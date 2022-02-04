const axios = require('axios');
const { Server } = require('ws');
const { CronJob } = require('cron');
const { v4: uuid } = require('uuid');

// WebSocket サーバー始動
const port = 3000;
const webSocketServer = new Server({ port }, () => console.info(`[WebSocket] ポート #${port} で待ち受けを開始します...`));
webSocketServer.on('connection', (ws) => {
  const id = uuid();
  console.info(`[WebSocket] 接続: ID=${id}, RemoteAddress=${ws._socket.remoteAddress}, ClientsCount=${webSocketServer.clients.size}`);
  ws.on('close', () => console.info(`[WebSocket] 切断: ID=${id}, ClientsCount=${webSocketServer.clients.size}`));

  // 最新の温湿度状況を送る
  if (latestMeterData !== null) {
    ws.send(JSON.stringify(latestMeterData));
  }
});

// TODO: マイクのデシベルを計算してリアルタイムに配信

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
