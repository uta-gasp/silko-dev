// @ts-check

export default class Image {

  // @param {TaskPageImage} image
  constructor( image, ts ) {
    this.src = image.src;
    this.location = image.location;
    this.on = image.on.name;
    this.off = image.off.name;

    this.shown = ts;
    this.hidden = 0;
  }

  get isCurrent() {
    return !this.hidden;
  }

  // @param {number} ts
  hide( ts ) {
    this.hidden = ts;
  }

}
