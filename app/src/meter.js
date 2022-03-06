const axios = require('axios');

/**
 * 温湿度計
 */
class Meter {
  /**
   * 一時保管用の取得データ
   * @property {Object}
   */
  #data;

  /**
   * アラート通知が必要な状態になったかどうか
   */
  #alert;

  /**
   * コンストラクター
   */
  constructor () {
    this.#data = null;
    this.#alert = false;
  }

  /**
   * 直近の取得データ
   */
  get lastData () {
    return this.#data;
  }

  /**
   * 取得データを保持しているかどうか
   */
  get hasData () {
    return this.#data !== null;
  }

  /**
   * 論理名
   */
  get logicalName () {
    return '温湿度計';
  }

  /**
   * 通知が必要な状態であるかどうか
   */
  get needsNotify () {
    // 既に通知が必要な状態になっていた場合は重複させないようにする
    if (this.#alert) {
      return false;
    }

    const alert = (this.#data !== null)
      ? (
        this.#data.body.temperature < Number.parseFloat(process.env.TEMPERATURE_NOTIFY_LOWER_THRESHOLD) ||
        this.#data.body.temperature > Number.parseFloat(process.env.TEMPERATURE_NOTIFY_HIGHER_THRESHOLD) ||
        this.#data.body.humidity < Number.parseFloat(process.env.HUMIDITY_NOTIFY_LOWER_THRESHOLD) ||
        this.#data.body.humidity > Number.parseFloat(process.env.HUMIDITY_NOTIFY_HIGHER_THRESHOLD)
      )
      : false;
    this.#alert = alert;

    return this.#alert;
  }

  /**
   * 最新のデータを取得して返却します。
   * @returns {Object}
   */
  async fetch () {
    const { data } = await axios.get(`https://api.switch-bot.com/v1.0/devices/${process.env.SWITCHBOT_METER_DEVICE_ID}/status`, {
      headers: { Authorization: process.env.SWITCHBOT_API_TOKEN },
    });
    if (data.message !== 'success') {
      console.warn('[温湿度計] SwitchBot API からの取得に失敗しました:', data);
      return;
    }

    this.#data = {
      type: 'meter',
      body: {
        temperature: data.body.temperature,
        humidity: data.body.humidity,
      },
    };

    return this.#data;
  }

  /**
   * 状態文字列を返します。
   */
  toString () {
    return (this.#data !== null) ? `温度=${this.#data.body.temperature}℃, 湿度=${this.#data.body.humidity}%` : '';
  }
}

module.exports = Meter;
