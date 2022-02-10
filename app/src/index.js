const Meter = require('./meter');
const CryHandler = require('./cry');
const { Server } = require('ws');
const { CronJob } = require('cron');
const { v4: uuid } = require('uuid');

const port = 3000;
const meter = new Meter();
const cry = new CryHandler();

// WebSocketを通してすべてのクライアントに状況を配信
const server = new Server({ port }, () => console.info(`[WebSocket] ポート #${port} で待ち受けを開始します...`));
server.on('connection', (socket) => {
  // 新規接続開始時
  const id = uuid();
  console.info(`[WebSocket] 接続: ID=${id}, IP=${socket._socket.remoteAddress}, Clients=${server.clients.size}`);
  socket.on('close', () => console.info(`[WebSocket] 切断: ID=${id}, Clients=${server.clients.size}`));

  // すぐに最新の温湿度状況を配信
  if (meter.hasData) {
    socket.send(JSON.stringify(meter.lastData));
  }

  // オーディオレベル配信元から受け取ったデータを基に泣き状況を配信
  socket.on('message', (data) => {
    const payload = JSON.parse(data.toString());
    const handleResult = cry.handle(payload.type, { scores: payload.body });
    if (handleResult) {
      server.clients.forEach((client) => {
        if (socket !== client) {
          client.send(JSON.stringify({ type: payload.type, body: handleResult }));
        }
      });
    }
  });
});

// 定期的に温湿度状況を更新
new CronJob('0 0/5 * * * *', async () => {
  const data = await meter.fetch();
  server.clients.forEach(client => client.send(JSON.stringify(data)));
}, null, true, 'Asia/Tokyo', null, true);
