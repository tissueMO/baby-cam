const axios = require('axios');

/**
 * 通知機構
 */
class Notify {
  /**
   * 必要に応じてアラート通知を行います。
   * @param {*} handler
   * @param {Object} data
   */
  static async notifyIfNeeded (handler) {
    if (!handler.needsNotify) {
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
}

module.exports = Notify;
