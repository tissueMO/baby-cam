/**
 * 泣き状況ハンドラー
 */
class CryHandler {
  /**
   * アラート通知が必要な状態になったかどうか
   */
  #alert;

  /**
   * コンストラクター
   * @param {number} size セグメントサイズ
   * @param {number} threshold 泣いているとみなすデシベル単位の閾値
   * @param {number} startRate 泣き始めたとみなすセグメント内の閾値越え率
   * @param {number} endRate 泣き終えたとみなすセグメント内の閾値越え率
   */
  constructor (size = 10, threshold = 57, startRate = 0.75, endRate = 1.0) {
    this.size = size;
    this.threshold = threshold;
    this.startRate = startRate;
    this.endRate = endRate;

    this.segment = [];
    this.startedTime = null;
    this.#alert = false;
  }

  /**
   * 泣いているかどうか
   */
  get isCrying () {
    return this.startedTime !== null;
  }

  /**
   * 論理名
   */
  get logicalName () {
    return 'Cryメーター';
  }

  /**
   * 通知が必要な状態であるかどうか
   */
  get needsNotify () {
    const cryingLonger = this.#cryingDurationTime > Number.parseInt(process.env.CRY_NOTIFY_THRESHOLD);

    // 状態が切り替わった瞬間のみ反応する
    const result = !this.#alert ? cryingLonger : false;
    this.#alert = cryingLonger;

    return result;
  }

  /**
   * 泣いている時間秒数
   */
  get #cryingDurationTime () {
    return (this.startedTime !== null) ? Number.parseInt((new Date().getTime() - this.startedTime.getTime()) / 1000) : 0;
  }

  /**
   * 受信データから泣き状況をハンドルします。
   * @param {string} type 受信データタイプ
   * @param {Object} body 受信データ本体
   * @returns {Object} ハンドル結果
   */
  handle (type, { scores }) {
    if (type !== 'cry') {
      return null;
    }

    // 最新のスコアをセグメントに追加
    this.segment.unshift(scores.reduce((max, score) => Math.max(max, score.db), 0));
    this.segment.splice(this.size);
    if (this.segment.length < this.size) {
      return null;
    }

    const overCount = this.segment.reduce((count, db) => count += (db > this.threshold ? 1 : 0), 0);

    // 泣き判定: 開始
    const start = ((overCount / this.size) >= this.startRate);
    if (!this.isCrying && start) {
      this.startedTime = new Date();
    }

    // 泣き判定: 終了
    const end = (((this.size - overCount) / this.size) >= this.endRate);
    if (this.isCrying && end) {
      this.startedTime = null;
    }

    return {
      type,
      body: {
        startedTime: this.startedTime?.getTime() ?? null,
        scores,
      },
    };
  }

  /**
   * 状態文字列を返します。
   */
  toString () {
    return (this.#cryingDurationTime === 0) ? '正常' : `${this.#cryingDurationTime}秒間泣いています。`;
  }
}

module.exports = CryHandler;
