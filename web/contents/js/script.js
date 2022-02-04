/**
 * 配信動画の再生
 */
document.addEventListener('DOMContentLoaded', async () => {
  const videoUrl = '/live/stream.m3u8';
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

/**
 * リアルタイム状況更新
 */
document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket(`ws://${location.hostname}:${Number.parseInt(location.port) + 1}`);

  socket.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    console.info('[WebSocket] 受信:', data);

    // 温湿度状況
    if (data.type === 'meter') {
      // 気温
      applyProgressBar('.js-temperature-bar', data.body.temperature);
      document.querySelector('.js-temperature-value').textContent = `${data.body.temperature}`;

      // 湿度
      applyProgressBar('.js-humidity-bar', data.body.humidity);
      document.querySelector('.js-humidity-value').textContent = `${data.body.humidity}`;
    }

    // レベルメーター
    if (data.type === 'level') {

    }
  });
});

/**
 * プログレスバーを更新します。
 * @param {string} selector
 * @param {number} value
 */
const applyProgressBar = (selector, value) => {
  const progressBar = document.querySelector(selector);

  // プログレスバー内の現在位置を決定
  const min = Number.parseInt(progressBar.getAttribute('aria-valuemin'));
  const max = Number.parseInt(progressBar.getAttribute('aria-valuemax'));
  value = Math.min(Math.max(value, min), max);

  const rate = Number.parseInt((value - min) / (max - min) * 100);
  progressBar.setAttribute('aria-valuenow', value);
  progressBar.style.width = `${rate}%`;

  // プログレスバーの色を決定
  const okRange = {
    min: Number.parseInt(progressBar.dataset.okmin),
    max: Number.parseInt(progressBar.dataset.okmax),
  };
  const warnRange = {
    min: Number.parseInt(progressBar.dataset.warnmin),
    max: Number.parseInt(progressBar.dataset.warnmax),
  };

  ['bg-success', 'bg-warning', 'bg-danger']
    .forEach(c => progressBar.classList.remove(c));

  if (okRange.min <= value && value <= okRange.max) {
    progressBar.classList.add('bg-success');
  } else if (warnRange.min <= value && value <= warnRange.max) {
    progressBar.classList.add('bg-warning');
  } else {
    progressBar.classList.add('bg-danger');
  }
};
