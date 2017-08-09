export default class ScreenSize {

  constructor( width, height ) {
    this.width = width;
    this.height = height;
  }

  static get full() {
    return new ScreenSize( window.screen.width, window.screen.height );
  }

}
