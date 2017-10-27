export default class Fixation {

  /**
   * @param {number} ts - ms
   * @param {number} tsSync - ms
   * @param {number} x - px
   * @param {number} y - px
   * @param {number} duration - ms
   */
  constructor( ts, tsSync, x, y, duration ) {
    this.ts = ts;
    this.tsSync = tsSync;
    this.x = x;
    this.y = y;
    this.duration = duration;
  }

  /**
   * @param {GTFixation} gazePoint 
   * @param {number} ts - own Silko timestamp
   * @returns {Fixation}
   */
  static from( gazePoint, ts ) {
    return new Fixation(
      gazePoint.ts,
      ts,
      Math.round( gazePoint.x ),
      Math.round( gazePoint.y ),
      gazePoint.duration
    );
  }

}
