const videoUrl = '/live/stream.m3u8';

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('video');
  const hls = new Hls();
  const timer = null;

  if (Hls.isSupported()) {
    loadStream(hls, video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
      if (timer !== null) {
        clearInterval(timer);
      }
    });
    hls.on(Hls.Events.ERROR, (_, data) => {
      console.info('HLS-ERROR:', data);
      if (['levelLoadError', 'manifestLoadError'].includes(data.details)) {
        document.querySelector('.js-error').classList.remove('d-none');
        if (timer === null) {
          timer = setInterval(() => loadStream(hls, video), 5000);
        }
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoUrl;
  }
});

const loadStream = (hls, video) => {
  hls.loadSource(videoUrl);
  hls.attachMedia(video);
};
