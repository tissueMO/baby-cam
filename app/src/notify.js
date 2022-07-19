const axios = require('axios');
const dayjs = require('dayjs');

dayjs.extend(require('dayjs/plugin/timezone'));
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.tz.setDefault(process.env.TZ ?? 'Asia/Tokyo');

/**
 * 通知機構
 */
class Notify {
  /**
   * アラート通知を行ってもよい時刻(時)
   */
  static #allowedHours = [22, 23, 0, 1, 2, 3];

  /**
   * 必要に応じてアラート通知を行います。
   * @param {*} handler
   * @param {Object} data
   */
  static async notifyIfNeeded (handler) {
    if (
      !handler.needsNotify ||
      !this.includesTimeRange()
    ) {
      return;
    }

    const response = await axios.post(process.env.SLACK_WEBHOOK_URL, {
      attachments: [
        {
          title: handler.logicalName,
          text: handler.toString(),
          color: 'danger',
        },
      ],
    });

    if (response.status === 200) {
      console.info('[通知] Slackによるアラートを送信しました:', handler.logicalName);
    } else {
      console.warn('[通知] Slackによるアラートに失敗しました:', handler.logicalName, response.status);
    }
  }

  /**
   * アラート通知を行ってもよい時刻かどうかを返します。
   * @returns {boolean}
   */
  static includesTimeRange () {
    return this.#allowedHours.includes(dayjs.tz().hour());
  }
}

module.exports = Notify;
