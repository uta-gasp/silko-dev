// Dependecy:
//      responsiveVoice

import SpeechFeedback from '@/model/session/speechFeedback.js';

export default class Speaker {
    constructor( options ) {
        this.options = Object.assign( {}, options );
        this.options.threshold.factor = 4;

        this.voice = voices[ this.options.language ];
    }

    get enabled() {
        return !!this.voice;
    }

    get setup() {
        return new SpeechFeedback(
            !!this.voice,
            this.options.threshold.value
        );
    }

    inspect( el, params ) {
        if (this.voice && params.notPronounced &&
            params.accumulatedTime > this.options.threshold.value) {

            params.notPronounced = false;

            this.voice( params.word );

            return true;
        }

        return false;
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
        console.log( 'wordReadingDuration', wordReadingDuration, '   >>   new value', this.options.threshold.value );
    }
};

const voices = {
    Finnish( word ) {
        responsiveVoice.speak( word, 'Finnish Female' );
    }
};