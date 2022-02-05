const fs = require('fs');
const portAudio = require('naudiodon');

const io = new portAudio.AudioIO({
  inOptions: {
    channelCount: 1,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 2,
    closeOnError: false,
  },
});

const stream = fs.createWriteStream('rec.raw');
io.on('data', chunk => stream.write(chunk));
io.start();
