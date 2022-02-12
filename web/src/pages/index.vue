<template>
  <div class="container-fluid m-0 px-0 h-100">
    <main class="d-flex flex-column bg-light h-100">
      <div class="row flex-fill justify-content-between w-100 mx-0">
        <div v-if="visibleIndicators" class="col-12 col-md-3 col-lg-2 justify-content-center align-self-end align-self-md-center mb-3 mb-md-0 indicators">
          <div class="row">
            <!-- 泣き声インジケーター -->
            <div class="col-12 col-sm-4 col-md-12">
              <div class="card m-2 card-indicator-cry" :class="{ crying: cryingHighlight }">
                <div class="card-body">
                  <div class="text-medium-emphasis text-center card-icon">
                    <i class="fas fa-baby"></i>
                  </div>
                  <div class="fs-4 fw-semibold">
                    <span v-if="cryTime !== null">{{ cryTime }}</span>
                    <span v-else>--:--</span>
                  </div>
                  <small class="text-medium-emphasis text-uppercase fw-semibold">Cry</small>
                  <div class="progress progress-thin mt-3 mb-0">
                    <div
                      class="progress-bar indicator-bar-cry"
                      role="progressbar"
                      :style="{ width: indicators.cry.size }"
                      :class="indicators.cry.color"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 温度計 -->
            <div class="col-6 col-sm-4 col-md-12">
              <div class="card m-2 card-indicator-temperature">
                <div class="card-body">
                  <div class="text-medium-emphasis text-center card-icon">
                    <i class="fas fa-thermometer-half"></i>
                  </div>
                  <div class="fs-4 fw-semibold">
                    <span v-if="temperature !== null">{{ temperature }}&#8451;</span>
                    <span v-else>--&#8451;</span>
                  </div>
                  <small class="text-medium-emphasis text-uppercase fw-semibold">Temp</small>
                  <div class="progress progress-thin mt-3 mb-0">
                    <div
                      class="progress-bar indicator-bar-temperature"
                      role="progressbar"
                      :style="{ width: indicators.temperature.size }"
                      :class="indicators.temperature.color"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 湿度計 -->
            <div class="col-6 col-sm-4 col-md-12">
              <div class="card m-2">
                <div class="card-body card-indicator-humidity">
                  <div class="text-medium-emphasis text-center card-icon">
                    <i class="fas fa-percentage"></i>
                  </div>
                  <div class="fs-4 fw-semibold">
                    <span v-if="humidity !== null">{{ humidity }}&percnt;</span>
                    <span v-else>--&percnt;</span>
                  </div>
                  <small class="text-medium-emphasis text-uppercase fw-semibold">Humidity</small>
                  <div class="progress progress-thin mt-3 mb-0">
                    <div
                      class="progress-bar indicator-bar-humidity"
                      role="progressbar"
                      :style="{ width: indicators.humidity.size }"
                      :class="indicators.humidity.color"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 配信ビューアー -->
        <div
          class="col-12 col-md-9 col-lg-10 flex-fill d-flex align-items-md-center align-self-stretch mx-0 px-0 video-wrapper"
          :class="{ 'align-items-start': visibleIndicators, 'align-items-center': !visibleIndicators }"
        >
          <video
            ref="video"
            class="video"
            controls
            muted
            autoplay
            playsinline
            @play="stopVideoStreamAutoResume"
            @error="startVideoStreamAutoResume"
            @stalled="startVideoStreamAutoResume"
          ></video>
        </div>
      </div>
    </main>

    <!-- インジケーター格納ボタン -->
    <button class="btn btn-light border-0 rounded-circle p-0 position-fixed top-0 begin-0 p-3 indicator-toggle" type="button" @click="toggleIndicators">
      <i class="fas fa-bars"></i>
    </button>

    <!-- エラーメッセージ -->
    <div class="position-fixed top-0 end-0 p-3 error-toast">
      <div
        class="toast fade"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        :class="{ show: hasError }"
      >
        <div class="toast-header text-white bg-danger border-0">
          <strong class="me-auto">通信エラー</strong>
        </div>
        <div class="toast-body bg-white">
          配信ストリームが一時停止しています。<br>
          自動復旧されるまでこのままお待ち下さい。
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Hls from 'hls.js';

export default {
  data () {
    return {
      hls: new Hls(),
      videoStreamAutoResumeTimer: null,
      hasError: false,
      visibleIndicators: true,
      socket: null,
      cryTimer: null,
      cryingHighlight: false,
      cryTime: null,
      temperature: null,
      humidity: null,
      indicators: {
        cry: {
          value: 0,
          min: 0,
          max: 2500,
          size: 0,
          color: '',
        },
        temperature: {
          value: -20,
          min: -20,
          max: 40,
          size: 0,
          color: '',
          ok: {
            min: 20,
            max: 25,
          },
          warning: {
            min: 15,
            max: 30,
          },
        },
        humidity: {
          value: 0,
          min: 0,
          max: 100,
          size: 0,
          color: '',
          ok: {
            min: 40,
            max: 60,
          },
          warning: {
            min: 35,
            max: 75,
          },
        },
      },
    };
  },

  computed: {
    canPlayVideoStream () {
      /** @type HTMLVideoElement */
      const video = this.$refs.video;
      return Hls.isSupported() || video.canPlayType('application/vnd.apple.mpegurl');
    },

    canPlayVideoStreamDirectly () {
      /** @type HTMLVideoElement */
      const video = this.$refs.video;
      return !Hls.isSupported() && video.canPlayType('application/vnd.apple.mpegurl');
    },
  },

  mounted () {
    this.playVideoStream();
    this.startIndicators();
  },

  methods: {
    /**
     * 配信動画を再生します。
     */
    playVideoStream () {
      /** @type HTMLVideoElement */
      const video = this.$refs.video;
      console.info('HLSサポート:', Hls.isSupported());

      // 非対応環境
      if (!this.canPlayVideoStream) {
        alert('非対応のブラウザーです。');
        return;
      }

      // HLS非サポート環境 (iOS Safari 向け)
      if (this.canPlayVideoStreamDirectly) {
        video.src = this.$config.VIDEO_PATH;
        return;
      }

      // HLSサポート環境
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => this.hls.loadSource(this.$config.VIDEO_PATH));
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      this.hls.on(Hls.Events.ERROR, this.startVideoStreamAutoResume);
    },

    /**
     * WebSocket経由でデータを受け取りリアルタイムでインジケーターを更新します。
     */
    startIndicators () {
      this.socket = new WebSocket(`ws://${this.$config.APP_HOST}`);

      // インジケーター種別に応じた方法で更新
      this.socket.addEventListener('message', (e) => {
        const data = JSON.parse(e.data);
        console.info('[WebSocket] 受信:', data);

        if (data.type === 'cry') {
          return this.handleCryIndicator(data.body);
        }
        if (data.type === 'meter') {
          return this.handleMeterIndicator(data.body);
        }
      });

      // 切断されたら自動で再接続
      this.socket.addEventListener('close', () => {
        console.warn('[WebSocket] 切断');
        setTimeout(() => this.startIndicators(), 5000);
      });
    },

    /**
     * 泣き状況インジケーターを更新します。
     * @param {Object} body
     */
    handleCryIndicator (body) {
      const started = body.startedTime !== null;
      const color = started ? 'warning' : 'success';

      // 0.5秒ごとにカードとバーを更新
      setTimeout(() => this.updateIndicatorBar('cry', body.scores[0].peak * 10000, color), 0);
      setTimeout(() => this.updateIndicatorBar('cry', body.scores[Number.parseInt(body.scores.length / 2)].peak * 10000, color), 500);

      // アラート開始
      if (started && this.cryTimer === null) {
        this.cryTimer = setInterval(() => {
          const deltaTime = Math.floor((new Date() - new Date(body.startedTime)) / 1000);
          const seconds = ('00' + (deltaTime % 60)).slice(-2);
          const minutes = ('00' + Math.floor(deltaTime / 60)).slice(-2);
          this.cryTime = `${minutes}:${seconds}`;
          this.cryingHighlight = !this.cryingHighlight;
        }, 1000);
      }

      // アラート停止
      if (!started && this.cryTimer !== null) {
        clearInterval(this.cryTimer);
        this.cryTimer = null;
        this.cryTime = null;
        this.cryingHighlight = false;
      }
    },

    /**
     * 温湿度インジケーターを更新します。
     * @param {Object} body
     */
    handleMeterIndicator (body) {
      this.temperature = body.temperature.toFixed(1);
      this.updateIndicatorBar('temperature', body.temperature);

      this.humidity = body.humidity;
      this.updateIndicatorBar('humidity', body.humidity);
    },

    /**
     * 任意のインジケーターバーを更新します。
     * @param {string} name
     * @param {number} value
     * @param {string} color
     */
    updateIndicatorBar (name, value, color = null) {
      const indicator = this.indicators[name];

      // インジケーターバー内の現在位置を決定
      value = Math.min(Math.max(value, indicator.min), indicator.max);
      const rate = Number.parseInt(((value - indicator.min) / (indicator.max - indicator.min)) * 100);
      indicator.value = value;
      indicator.size = `${rate}%`;

      // インジケーターバーの色を決定
      if (color !== null) {
        indicator.color = `bg-${color}`;
      } else if (indicator.ok.min <= value && value <= indicator.ok.max) {
        indicator.color = 'bg-success';
      } else if (indicator.warning.min <= value && value <= indicator.warning.max) {
        indicator.color = 'bg-warning';
      } else {
        indicator.color = 'bg-danger';
      }
    },

    /**
     * 動画配信の自動復旧措置を試みます。
     */
    startVideoStreamAutoResume (...params) {
      const interval = 5000;

      /** @type HTMLVideoElement */
      const video = this.$refs.video;

      if (this.canPlayVideoStreamDirectly) {
        // HLS非サポート環境 (iOS Safari 向け)
        this.videoStreamAutoResumeTimer ??= setInterval(() => video.load(), interval);
        this.hasError = true;
      } else {
        // HLSサポート環境
        const [_, data] = params;
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            this.videoStreamAutoResumeTimer ??= setInterval(() => this.hls.startLoad(), interval);
            this.hasError = true;
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            this.videoStreamAutoResumeTimer ??= setInterval(() => this.hls.recoverMediaError(), interval);
            this.hasError = true;
          } else {
            alert('配信ストリームの再生中に不明なエラーが発生しました。\n自動復旧できません。');
          }
        }
      }
    },

    /**
     * 動画配信の自動復旧措置を停止します。
     */
    stopVideoStreamAutoResume () {
      clearInterval(this.videoStreamAutoResumeTimer);
      this.videoStreamAutoResumeTimer = null;
      this.hasError = false;
    },

    /**
     * インジケーターの表示有無を切り替えます。
     */
    toggleIndicators () {
      this.visibleIndicators = !this.visibleIndicators;
    },
  },
};
</script>

<style lang="scss">
.card-icon {
  float: right;

  i {
    font-size: 2.5rem;
    width: 2.5rem;
    height: 2.5rem;
    opacity: 0.3;
  }
}

.indicators {
  min-width: 170px;

  .card-indicator-cry {
    transition: background-color 1s ease;

    &.crying {
      background-color: #f007;
    }

    .indicator-bar-cry {
      transition: width .5s ease;
    }
  }
}

.indicator-toggle {
  width: 3rem;
  height: 3rem;
  line-height: 1rem;
  z-index: 1000;
}

.error-toast {
  z-index: 1000;
}

.video-wrapper {
  @media (min-width: 768px) {
    height: 100vh;
    background-color: black;
  }

  .video {
    aspect-ratio: 16 / 9;
    width: 100%;
    height: auto;
    max-height: 100%;
  }
}
</style>
