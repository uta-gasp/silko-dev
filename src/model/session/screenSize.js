export default class ScreenSize {

  /**
   * @param {number} width 
   * @param {number} height 
   */
  constructor( width, height ) {
    this.width = width;
    this.height = height;
  }

  /** @returns {ScreenSize} */
  static get full() {
    return new ScreenSize( window.screen.width, window.screen.height );
  }

}
