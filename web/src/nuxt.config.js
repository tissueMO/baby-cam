export default {
  ssr: false,
  target: 'static',

  head: {
    title: 'BabyCam',
    htmlAttrs: { lang: 'ja' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'ベビーカメラ' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'stylesheet', crossorigin: 'anonymous', href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css' },
      { rel: 'stylesheet', crossorigin: 'anonymous', href: 'https://cdn.jsdelivr.net/npm/@coreui/coreui@4.1.0/dist/css/coreui.min.css' },
      { rel: 'stylesheet', crossorigin: 'anonymous', href: 'https://use.fontawesome.com/releases/v5.15.4/css/all.css' },
    ],
    script: [
      { crossorigin: 'anonymous', src: 'https://cdn.jsdelivr.net/npm/@coreui/coreui@4.1.0/dist/js/coreui.bundle.min.js' },
      { crossorigin: 'anonymous', src: 'https://cdn.jsdelivr.net/npm/hls.js@latest' },
    ],
  },

  css: [
    { src: '~/assets/scss/style.scss', lang: 'scss' },
  ],

  plugins: [
  ],

  components: true,

  buildModules: [
    '@nuxtjs/eslint-module'
  ],

  modules: [
  ],

  build: {
    terser: {
      terserOptions: {
        compress: { drop_console: true },
      },
    },
  },

  publicRuntimeConfig: {
    APP_HOST: process.env.APP_HOST,
    VIDEO_PATH: '/live/stream.m3u8',
  },

  server: {
    host: '0.0.0.0',
    port: 80,
  },
};
