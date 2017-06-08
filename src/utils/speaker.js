// Dependecy:
//      responsiveVoice

import SpeechFeedback from '@/model/session/speechFeedback.js';

export default class Speaker {
    constructor( options ) {
        this.options = Object.assign( { factor: 4 }, options );
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

    setAvgWordReadingDuration( avgWordReadingDuration ) {
        if (!this.options.threshold.smart) {
            return;
        }

        this.options.threshold.value =
            Math.max( this.options.threshold.min,
            Math.min( this.options.threshold.max,
            avgWordReadingDuration * this.options.threshold.factor
        ));
    }
};

const voices = {
    Finnish( word ) {
        responsiveVoice.speak( word, 'Finnish Female' );
    }
};