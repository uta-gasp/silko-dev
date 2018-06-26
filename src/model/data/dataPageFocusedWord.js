import Rect from './rect.js';
import WordFocusing from './wordFocusing.js';
import WordFeedback from './wordFeedback.js';

export default class DataPageFocusedWord {

  /**
   * @param {HTMLElement} el 
   * @param {number} page - index
   */
  constructor( el, page ) {
    /** @type {string} */
    this.text = el ? el.textContent : '';
    /** @type {Rect} */
    this.rect = Rect.from( el );
    /** @type {number} */
    this.page = page;
    /** @type {WordFocusing} */
    this.focusing = new WordFocusing();
    /** @type {WordFeedback} */
    this.feedback = new WordFeedback();
  }

};
