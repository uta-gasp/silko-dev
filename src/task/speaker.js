// Dependecy:
//      responsiveVoice

import SpeechFeedback from '@/model/session/speechFeedback.js';

const LONG_WORD_MIN_LENGTH = 7;
const EXTRA_THRESHOLD_FOR_CHAR = 0.05;

export default class Speaker {

  constructor( options ) {
    this.options = { ...options };
    this.options.threshold.factor = 4;

    this.voice = voices[ this.options.language ];
  }

  static get LANGS() {
    return Object.keys( voices );
  }

  get enabled() {
    return !!this.voice;
  }

  get setup() {
    return new SpeechFeedback( { ...this.options, enabled: !!this.voice } );
  }

  /**
   * @param {WordFocus} wordFocus
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

  say( word ) {
    if ( !this.voice ) {
      return;
    }

    this.voice( word );
  }

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
  Finnish( word ) {
    responsiveVoice.speak( word, 'Finnish Female' );
  },
  English( word ) {
    responsiveVoice.speak( word, 'US English Female' );
  },
};
