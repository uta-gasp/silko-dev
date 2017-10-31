import { Feedback, FeedbackOptions } from './feedback.js';

export default class SyllabificationFeedback extends Feedback {

  /**
   * @param {object} options 
   */
  constructor( options ) {
    super( options );
    /** @type {string} */
    this.hyphen = options.hyphen;
    /** @type {string} - a key from Syllabifier.MODES */
    this.mode = options.mode;
    /** @type {boolean} */
    this.temporary = options.temporary;
    /** @type {object} - { 'original word': 'syllabified word' } */
    this.exceptions = {};
  }

}
