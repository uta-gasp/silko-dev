// Dependecy:
//      responsiveVoice

import SpeechFeedback from '@/model/session/speechFeedback.js';

// ts-check-only
import WordFocus from './wordFocus.js';

/**
 * @external responsiveVoice
 * @see {@link https://responsivevoice.org}
 */

const LONG_WORD_MIN_LENGTH = 7;
const EXTRA_THRESHOLD_FOR_CHAR = 0.05;

export default class Speaker {

  /**
   * @param {SpeechFeedback} options 
   */
  constructor( options ) {
    this.options = { ...options };
    this.options.threshold.factor = 4;

    this.voice = voices[ this.options.language ];
  }

  /**
   * @returns {string[]}
   */
  static get LANGS() {
    return Object.keys( voices );
  }

  /**
   * @returns {boolean}
   */
  get enabled() {
    return !!this.voice;
  }

  /**
   * @returns {SpeechFeedback}
   */
  get setup() {
    return new SpeechFeedback( { ...this.options, enabled: !!this.voice } );
  }

  /**
   * @param {HTMLElement} _
   * @param {WordFocus} wordFocus
   * @returns {boolean} - true if the word was pronounced
   */
  inspect( _ /* el */, wordFocus ) {
    if ( !this.voice ) {
      return false;
    }

    let threshold = this.options.threshold.value;
    if ( this.options.threshold.adjustForWordLength ) {
      threshold *= Math.max( 1, 1 + ( wordFocus.word.length - LONG_WORD_MIN_LENGTH ) * EXTRA_THRESHOLD_FOR_CHAR );
    }

    const mustPronounce =
            !wordFocus.pronounced &&
            wordFocus.entries === 1 &&
            wordFocus.accumulatedTime > threshold;

    if ( !mustPronounce ) {
      return false;
    }

    wordFocus.pronounced = true;
    this.voice( wordFocus.word );

    return true;
  }

  /**
   * @param {string} word 
   */
  say( word ) {
    if ( !this.voice ) {
      return;
    }

    this.voice( word );
  }

  /**
   * @param {number} wordReadingDuration 
   */
  setAvgWordReadingDuration( wordReadingDuration ) {
    if ( !this.options.threshold.smart || !wordReadingDuration ) {
      return;
    }

    this.options.threshold.value =
            Math.max( this.options.threshold.min,
              Math.min( this.options.threshold.max,
                wordReadingDuration * this.options.threshold.factor
              ) );
  }

};

const voices = {
  /**
   * @param {string} word 
   */
  Finnish( word ) {
    window.responsiveVoice.speak( word, 'Finnish Female' );
  },

  /**
   * @param {string} word 
   */
  English( word ) {
    window.responsiveVoice.speak( word, 'US English Female' );
  },
};
