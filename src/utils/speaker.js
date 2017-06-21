// Dependecy:
//      responsiveVoice

import SpeechFeedback from '@/model/session/speechFeedback.js';

export default class Speaker {
    constructor( options ) {
        this.options = { ...options };
        this.options.threshold.factor = 4;

        this.voice = voices[ this.options.language ];
    }

    get enabled() {
        return !!this.voice;
    }

    get setup() {
        return new SpeechFeedback({ ...this.options, enabled: !!this.voice } );
    }

    // @wordFocus - WordFocus
    inspect( el, wordFocus ) {
        if (!this.voice) {
            return false;
        }

        const mustPronounce =
            !wordFocus.pronounced &&
            wordFocus.entries === 1 &&
            wordFocus.accumulatedTime > this.options.threshold.value;

        if (!mustPronounce) {
            return false;
        }

        wordFocus.pronounced = true;
        this.voice( wordFocus.word );

        return true;
    }

    say( word ) {
        if (!this.voice) {
            return;
        }

        this.voice( word );
    }

    setAvgWordReadingDuration( wordReadingDuration ) {
        if (!this.options.threshold.smart || !wordReadingDuration) {
            return;
        }

        this.options.threshold.value =
            Math.max( this.options.threshold.min,
            Math.min( this.options.threshold.max,
            wordReadingDuration * this.options.threshold.factor
        ));
    }
};

const voices = {
    Finnish( word ) {
        responsiveVoice.speak( word, 'Finnish Female' );
    }
};