const videoUrl = '/live/stream.m3u8';

document.addEventListener('DOMContentLoaded', async () => {
  const video = document.getElementById('video');
  const hls = new Hls();
  let timer = null;

  console.info('HLSサポート:', Hls.isSupported());

  // 再生成功時
  video.addEventListener('play', () => {
    document.querySelector('.js-error').classList.add('d-none');
    if (timer !== null) {
      clearInterval(timer);
    }
  });

  // HLS非サポート環境 (iPhone Safari 向け)
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoUrl;
    return;
  }
  // HLS非サポート環境 (再生不可)
  if (!Hls.isSupported()) {
    return;
  }

  // HLSサポート環境 (自動再復旧にも対応)
  document.querySelector(`.js-hls-enabled`).classList.remove('d-none');
  hls.loadSource(videoUrl);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
  hls.on(Hls.Events.ERROR, (_, data) => {
    console.warn('HLS-ERROR:', data);
    if (data.fatal) {
      document.querySelector('.js-error').classList.remove('d-none');
      if (timer === null) {
        timer = setInterval(() => {
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
        }, 5000);
      }
    }
  });
});
