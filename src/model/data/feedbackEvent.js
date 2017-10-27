// ts-chek-only
import Rect from './rect';

export default class FeedbackEvent {

  /**
   * @param {number} ts - ms
   * @param {string} text 
   * @param {Rect} rect 
   */
  constructor( ts, text, rect ) {
    this.ts = ts;
    this.text = text;
    this.rect = rect;
  }

}
