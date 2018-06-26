// ts-check-only
import { TextPageImage } from './textPageImage';

export default class TextPage {

  /**
   * @param {number} id 
   */
  constructor( id ) {
    this.id = id;
    /** @type {string[]} */
    this.lines = [];
    /** @type {TextPageImage[]} */
    this.images = [];
  }

};
