const pcm = require('pcm-util');

/**
 * オーディオレベルバッファー
 */
class AudioLevelBuffer {
  /**
   * コンストラクター
   */
  constructor() {
    /** @type {number} */
    this.lastTimestamp = null;

    /** @type {Array} */
    this.scores = [];
  }

  /**
   * 現在のレベルバッファーが指すタイムスタンプを更新します。
   * @param {Buffer} chunk
   * @returns {boolean} 前回の更新からタイムスタンプが変化したかどうか
   */
  updateTimestamp (chunk) {
    const changed = (chunk.timestamp !== this.lastTimestamp);
    this.lastTimestamp = chunk.timestamp;
    return changed;
  }

  /**
   * 与えられたチャンクのレベルを現在のレベルバッファーに追加します。
   * @param {Buffer} chunk
   */
  push (chunk) {
    this.scores.push(this.#calcLevelScore(chunk));
  }

  /**
   * 現在のレベルバッファーをすべて返してクリアします。
   * @returns {Object}
   */
  flush () {
    return this.scores.splice(0);
  }

  /**
   * 与えられたチャンクのレベルを計算します。
   * @param {Buffer} chunk
   * @returns {Object} デシベル、実効値、ピーク値
   */
  #calcLevelScore (chunk) {
    const buffer = pcm.toAudioBuffer(chunk).getChannelData(0);

    const peak = Math.max(...buffer.map(d => Math.abs(d)));
    if (!Number.isFinite(peak)) {
      return null;
    }
    const rms = Math.sqrt(
      buffer
        .map(d => d * d)
        .reduce((sum, d) => sum + d, 0) / buffer.length
    );
    const db = 20 * Math.log10(rms / 20e-6);

    return { db, rms, peak };
  }
}

module.exports = AudioLevelBuffer;
