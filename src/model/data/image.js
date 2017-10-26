import { TextPageImage } from '../task/textPageImage.js';

export default class Image {

  /**
   * @param {TextPageImage} image 
   * @param {number} ts
   */
  constructor( image, ts ) {
    this.src = image.src;
    this.location = image.location;
    this.on = image.on.name;
    this.off = image.off.name;

    this.shown = ts;
    this.hidden = 0;
  }

  /** @returns {boolean} */
  get isCurrent() {
    return !this.hidden;
  }

  /** 
   * @param {number} ts 
   */
  hide( ts ) {
    this.hidden = ts;
  }

}
