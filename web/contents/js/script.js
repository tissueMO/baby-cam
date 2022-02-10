/**
 * 配信動画の再生
 */
document.addEventListener('DOMContentLoaded', async () => {
  const videoUrl = '/live/stream.m3u8';
  const hls = new Hls();
  let timer = null;
  console.info('HLSサポート:', Hls.isSupported());

  /**
   * @type HTMLVideoElement
   */
  const video = document.getElementById('video');

  // 再生成功時
  video.addEventListener('play', () => {
    document.querySelector('.js-error').classList.remove('show');
    clearInterval(timer);
    timer = null;
  });

  // HLS非サポート環境 (再生不可)
  if (!Hls.isSupported() && !video.canPlayType('application/vnd.apple.mpegurl')) {
    alert('非対応のブラウザーです。');
    return;
  }

  // HLS非サポート環境 (iOS Safari 向け)
  if (!Hls.isSupported()) {
    video.src = videoUrl;

    // 配信不具合発生時に自動で再復旧
    const reload = () => {
      document.querySelector('.js-error').classList.add('show');
      timer ??= setInterval(() => video.load(), 5000);
    };
    video.addEventListener('error', reload);
    video.addEventListener('stalled', reload);

    return;
  }

  // HLSサポート環境
  hls.loadSource(videoUrl);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
  hls.on(Hls.Events.ERROR, (_, data) => {
    // 配信不具合発生時に自動で再復旧
    if (data.fatal) {
      document.querySelector('.js-error').classList.add('show');
      timer ??= setInterval(() => {
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      }, 5000);
    }
  });
});

/**
 * リアルタイム状況更新
 */
document.addEventListener('DOMContentLoaded', () => {
  startReceiveData();
});

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

/**
 * WebSocket経由でリアルタイムな状況更新を行います。
 */
const startReceiveData = () => {
  const socket = new WebSocket(`ws://${location.hostname}:${Number.parseInt(location.port) + 1}`);
  let cryStartedTime = null;
  let cryTimer = null;

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
      }, 500);

      // アラート開始
      if (started && cryStartedTime === null) {
        cryStartedTime = data.body.startedTime;
        cryTimer = setInterval(() => {
          const deltaTime = Math.floor((new Date() - new Date(cryStartedTime)) / 1000);
          const seconds = ('00' + (deltaTime % 60)).slice(-2);
          const minutes = ('00' + Math.floor(deltaTime / 60)).slice(-2);
          document.querySelector('.js-babycry-value').textContent = `${minutes}:${seconds}`;
          document.querySelector('.js-babycry-card').classList.toggle('crying');
        }, 1000);
      }

      // アラート停止
      if (!started && cryStartedTime !== null) {
        clearInterval(cryTimer);
        cryTimer = null;
        cryStartedTime = null;
        document.querySelector('.js-babycry-value').textContent = '--:--';
        document.querySelector('.js-babycry-card').classList.remove('crying');
      }
    }
  });

  // 切断されたら自動で再接続
  socket.addEventListener('close', () => {
    console.warn('[WebSocket] 切断');
    setTimeout(() => startReceiveData(), 1000);
  });
};

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
