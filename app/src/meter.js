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
   * コンストラクター
   */
  constructor () {
    this.#data = null;
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
}

module.exports = Meter;
