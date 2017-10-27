// ts-check-only
import { TextPageImage } from '@/model/task/textPageImage.js';

export default class Image {

  /**
   * @param {TextPageImage} image 
   * @param {number} ts
   */
  constructor( image, ts ) {
    /** @type {string} */
    this.src = image.src;
    /** @type {string} */
    this.location = image.location;
    /** @type {string} */
    this.on = image.on.name;
    /** @type {string} */
    this.off = image.off.name;

    /** @type {number} */
    this.shown = ts;

    /** @type {number} */
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
