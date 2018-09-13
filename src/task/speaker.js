/**
 * @external responsiveVoice
 * @see {@link https://responsivevoice.org/}
 */

import DataUtils from '@/utils/data-utils.js';

import SpeechFeedback from '@/model/session/speechFeedback.js';

// ts-check-only
import WordFocus from './wordFocus.js';
import { SpeechOptions } from '@/model/session/feedbacks.js';

const LONG_WORD_MIN_LENGTH = 7;
const EXTRA_THRESHOLD_FOR_CHAR = 0.05;

export default class Speaker {

  /**
   * @param {SpeechOptions} options 
   */
  constructor( options ) {
    /** @type {SpeechOptions} */
    this._options = { ...options };
    this._options.threshold.factor = 4;

    /** @type {function( string )} */
    this.voice = voices[ DataUtils.convertLegacy( this._options.language ) ];
  }

  /** @returns {string[]} */
  static get LANGS() {
    return Object.keys( voices );
  }

  /** @returns {boolean} */
  get enabled() {
    return !!this.voice;
  }

  /** @returns {SpeechFeedback} */
  get setup() {
    return new SpeechFeedback( { ...this._options, enabled: !!this.voice } );
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

    let threshold = this._options.threshold.value;
    if ( this._options.threshold.adjustForWordLength ) {
      threshold *= Math.max( 1, 1 + ( wordFocus.word.length - LONG_WORD_MIN_LENGTH ) * EXTRA_THRESHOLD_FOR_CHAR );
    }

    const mustPronounce =
            !wordFocus.pronounced &&
            //wordFocus.entries === 1 &&
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
    if ( !this._options.threshold.smart || !wordReadingDuration ) {
      return;
    }

    const threshold = this._options.threshold;
    threshold.value = Math.max( threshold.min, Math.min( threshold.max, wordReadingDuration * threshold.factor ) );
  }

};

const voices = {
  /**
   * @param {string} word 
   */
  Suomi( word ) {
    responsiveVoice.speak( word, 'Finnish Female' );
  },

  /**
   * @param {string} word 
   */
  English( word ) {
    responsiveVoice.speak( word, 'US English Female' );
  },
};
