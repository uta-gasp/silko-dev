export default class Rect {

  /**
   * @param {number} x - px
   * @param {number} y - px
   * @param {number} width - px
   * @param {number} height - px
   */
  constructor( x, y, width, height ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * @param {Element} el 
   * @returns {Rect}
   */
  static from( el ) {
    if ( !el ) {
      return null;
    }

    const rect = el.getBoundingClientRect();
    return new Rect(
      Math.round( rect.left ), Math.round( rect.top ),
      Math.round( rect.width ), Math.round( rect.height )
    );
  }

}
