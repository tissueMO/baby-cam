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
    document.querySelector('.js-error').classList.remove('show');
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
      document.querySelector('.js-error').classList.add('show');
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
let cryStartedTime = null;
let cryTimer = null;
document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket(`ws://${location.hostname}:${Number.parseInt(location.port) + 1}`);

  socket.addEventListener('message', (e) => {
    const data = JSON.parse(e.data);
    console.info('[WebSocket] 受信:', data);

    // 温湿度状況
    if (data.type === 'meter') {
      // 気温
      applyProgressBar('.js-temperature-bar', data.body.temperature);
      document.querySelector('.js-temperature-value').textContent = `${data.body.temperature.toFixed(1)}`;

      // 湿度
      applyProgressBar('.js-humidity-bar', data.body.humidity);
      document.querySelector('.js-humidity-value').textContent = `${data.body.humidity}`;
    }

    // 泣き状況
    if (data.type === 'cry') {
      const started = data.body.startedTime !== null;
      const color = started ? 'warning' : 'success';

      // 0.5秒ごとにカードとバーを更新
      applyProgressBar('.js-babycry-bar', data.body.scores[0].peak * 10000, color);
      setTimeout(() => {
        applyProgressBar('.js-babycry-bar', data.body.scores[Number.parseInt(data.body.scores.length / 2)].peak * 10000, color);
        if (started) {
          document.querySelector('.js-babycry-card').classList.toggle('bg-danger');
        }
      }, 500);

      // アラート開始
      if (started && cryStartedTime === null) {
        cryStartedTime = data.body.startedTime;
        cryTimer = setInterval(() => {
          const deltaTime = Math.floor((new Date() - new Date(cryStartedTime)) / 1000);
          const seconds = ('00' + (deltaTime % 60)).slice(-2);
          const minutes = ('00' + Math.floor(deltaTime / 60)).slice(-2);
          document.querySelector('.js-babycry-value').textContent = `${minutes}:${seconds}`;
        }, 1000);
      }

      // アラート停止
      if (!started && cryStartedTime !== null) {
        cryStartedTime = null;
        clearInterval(cryTimer);
        document.querySelector('.js-babycry-card').classList.remove('bg-danger');
        document.querySelector('.js-babycry-value').textContent = '--:--';
      }
    }
  });
});

/**
 * プログレスバーを更新します。
 * @param {string} selector
 * @param {number} value
 * @param {string} color
 */
const applyProgressBar = (selector, value, color = null) => {
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

  if (color !== null) {
    progressBar.classList.add(`bg-${color}`);
    return;
  }
  if (okRange.min <= value && value <= okRange.max) {
    progressBar.classList.add('bg-success');
  } else if (warnRange.min <= value && value <= warnRange.max) {
    progressBar.classList.add('bg-warning');
  } else {
    progressBar.classList.add('bg-danger');
  }
};

/**
 * インジケーターのトグルボタン
 */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.js-indicator-toggle').addEventListener('click', () => {
    document.querySelector('.js-indicators').classList.toggle('d-none');
    document.querySelector('.js-video-wrapper').classList.toggle('align-items-center');
    document.querySelector('.js-video-wrapper').classList.toggle('align-items-start');
  });
});
