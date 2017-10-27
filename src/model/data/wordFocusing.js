export default class WordFocusing {

  constructor() {
    /** @type {number} */
    this.count = 0;
    /** @type {number} - ms */
    this.first = 0;
    /** @type {number} - ms */
    this.last = 0;
    /** @type {number} - ms */
    this.duration = 0;
  }

  /**
   * @param {number} ts - timestamp
   */
  start( ts ) {
    this.last = ts;
    if ( !this.count ) {
      this.first = this.last;
    }
    this.count++;
  }

  /**
   * @param {number} ts - timestamp
   */
  stop( ts ) {
    this.duration += ts - this.last;
  }

  /**
   * @param {number} ts - timestamp
   * @returns {number}
   */
  currentDuration( ts ) {
    return ( ts - this.last );
  }

}
