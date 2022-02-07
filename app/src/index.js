const axios = require('axios');
const { Server } = require('ws');
const { CronJob } = require('cron');
const { v4: uuid } = require('uuid');

const cryDataQueue = [];
const crySegmentCount = 10;
const crySegmentCountStartRate = 0.5;
const crySegmentCountEndRate = 1.0;
const cryThresholdDecibel = 55;
let cryStartedTime = null;

// WebSocket サーバー始動
const port = 3000;
const webSocketServer = new Server({ port }, () => console.info(`[WebSocket] ポート #${port} で待ち受けを開始します...`));
webSocketServer.on('connection', (ws) => {
  const id = uuid();
  console.info(`[WebSocket] 接続: ID=${id}, RemoteAddress=${ws._socket.remoteAddress}, ClientsCount=${webSocketServer.clients.size}`);
  ws.on('close', () => console.info(`[WebSocket] 切断: ID=${id}, ClientsCount=${webSocketServer.clients.size}`));

  // すぐに最新の温湿度状況を配信
  if (latestMeterData !== null) {
    ws.send(JSON.stringify(latestMeterData));
  }

  // 泣き状況を受信元を除くすべてのクライアントにブロードキャスト
  ws.on('message', (data) => {
    const payload = JSON.parse(data.toString());

    if (payload.type === 'cry') {
      cryDataQueue.unshift(payload.body.reduce((max, score) => Math.max(max, score.db), 0));
      cryDataQueue.splice(crySegmentCount);

      if (cryDataQueue.length >= crySegmentCount) {
        const overCount = cryDataQueue.reduce((count, db) => count += (db > cryThresholdDecibel ? 1 : 0), 0);

        // 泣き判定: 開始
        const start = ((overCount / crySegmentCount) >= crySegmentCountStartRate);
        if (!cryStartedTime && start) {
          cryStartedTime = new Date();
        }

        // 泣き判定: 終了
        const end = (((crySegmentCount - overCount) / crySegmentCount) >= crySegmentCountEndRate);
        if (cryStartedTime && end) {
          cryStartedTime = null;
        }
      }

      webSocketServer.clients.forEach(client => {
        if (ws !== client) {
          client.send(JSON.stringify({
            type: 'cry',
            body: {
              startedTime: cryStartedTime?.getTime() ?? null,
              scores: payload.body,
            },
          }));
        }
      });
    }
  });
});

// 定期的に温湿度状況を配信
let latestMeterData = null;
new CronJob('0 0/5 * * * *', async () => {
  const { data } = await axios.get(`https://api.switch-bot.com/v1.0/devices/${process.env.SWITCHBOT_METER_DEVICE_ID}/status`, {
    headers: { Authorization: process.env.SWITCHBOT_API_TOKEN },
  });
  if (data.message !== 'success') {
    console.warn('温湿度状況の取得に失敗しました:', data);
    return;
  }

  const { temperature, humidity } = data.body;
  console.info(`[温湿度計] 温度=${temperature}, 湿度=${humidity}`);
  latestMeterData = {
    type: 'meter',
    body: {
      temperature,
      humidity,
    },
  };

  webSocketServer.clients.forEach(client => client.send(JSON.stringify(latestMeterData)));

}, null, true, 'Asia/Tokyo', null, true);
