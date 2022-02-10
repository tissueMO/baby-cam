const AudioLevelBuffer = require('./audio-level-buffer');
const { WebSocket } = require('ws');
const { AudioIO, SampleFormat16Bit } = require('naudiodon');

const audioLevelBuffer = new AudioLevelBuffer();

const socket = (new WebSocket(process.env.WEBSOCKET_HOST))
  .on('open', () => console.info('[WebSocket] 接続開始'))
  .on('close', () => {
    console.error('[WebSocket] 切断');
    process.exit(1);
  });

// オーディオレベルを1秒単位でバッファリングしてAppサーバーに送信
(new AudioIO({
  inOptions: {
    channelCount: 1,
    sampleFormat: SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: process.env.BABYCRY_AUDIO_SOURCE,
    closeOnError: false
  },
}))
  .on('data', (chunk) => {
    if (audioLevelBuffer.updateTimestamp(chunk)) {
      socket.send(JSON.stringify({
        type: 'cry',
        body: audioLevelBuffer.flush(),
      }));
    }
    audioLevelBuffer.push(chunk);
  })
  .start();
