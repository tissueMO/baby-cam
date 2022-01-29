const video = document.getElementById('video');
const videoUrl = '/live/stream.m3u8';

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource(videoUrl);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = videoUrl;
}
