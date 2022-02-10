const axios = require('axios');

/**
 * 温湿度計
 */
export class Meter {
  /**
   * コンストラクター
   */
  constructor () {
    this._data = null;
  }

  /**
   * 直近の取得データ
   */
  get lastData () {
    return this._data;
  }

  /**
   * 取得データを保持しているかどうか
   */
  get hasData () {
    return this._data !== null;
  }

  /**
   * 最新のデータを取得して返却します。
   * @returns {Object}
   */
  fetch () {
    const { data } = await axios.get(`https://api.switch-bot.com/v1.0/devices/${process.env.SWITCHBOT_METER_DEVICE_ID}/status`, {
      headers: { Authorization: process.env.SWITCHBOT_API_TOKEN },
    });
    if (data.message !== 'success') {
      console.warn('[温湿度計] SwitchBot API からの取得に失敗しました:', data);
      return;
    }

    this._data = {
      type: 'meter',
      body: {
        temperature: data.body.temperature,
        humidity: data.body.humidity,
      },
    };

    return this._data;
  }
}
