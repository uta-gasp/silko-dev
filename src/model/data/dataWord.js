import Rect from '../commons/rect.js';
import WordFocusing from './wordFocusing.js';
import WordFeedback from './wordFeedback.js';

export default class DataWord {

  constructor( el, page ) {
    this.text = el ? el.textContent : '';   // string
    this.rect = Rect.from( el );            // Rect
    this.page = page;                       // id
    this.focusing = new WordFocusing();     // WordFocusing
    this.feedback = new WordFeedback();     // WordFeedback
  }

};
