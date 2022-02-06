const { AudioIO, SampleFormat16Bit } = require('naudiodon');
const pcm = require('pcm-util');

const scores = [];
let currentTimestamp = null;

const io = new AudioIO({
  inOptions: {
    channelCount: 1,
    sampleFormat: SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 1,
    closeOnError: false
  },
});

io.on('data', (chunk) => {
  // 1秒単位でバッファリング
  if (chunk.timestamp !== currentTimestamp) {
    currentTimestamp = chunk.timestamp;
    console.log(scores);

    // TODO: App へ scores を送信

    scores.splice(0);
  }

  // 現在のチャンクの音量を計算
  const buffer = pcm.toAudioBuffer(chunk).getChannelData(0);
  const peak = Math.max(...buffer.map(d => Math.abs(d)));
  if (!Number.isFinite(peak)) {
    return;
  }
  const rms = Math.sqrt(
    buffer
      .map(d => d * d)
      .reduce((sum, d) => sum + d, 0) / buffer.length
  );
  const db = 20 * Math.log10(rms / 20e-6);

  scores.push({ db, rms, peak });
});

io.start();
