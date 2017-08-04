import Feedbacks from '@/model/session/feedbacks.js';

import Syllabifier from './syllabifier.js';
import Speaker from './speaker.js';
import WordFocus from './wordFocus.js';

const FOCUS_THRESHOLD = 150;
const REENTRY_THRESHOLD = 1000;
const SAMPLE_DURATION = 30;

export default class FeedbackProvider {

    constructor( syllab, speech ) {
        this.syllabifier = new Syllabifier( syllab );
        this.speaker = new Speaker( speech );

        this.highlighClassName = 'currentWord';

        this.events = new EventEmitter();
        this.timer = null;
        this.currentWord = null;
        this.lastFocusedWord = null;

        this.words = null;  // map of el: WordFocus
    }

    get setup() {
        return new Feedbacks(
            this.speaker.setup,
            this.syllabifier.setup
        );
    }

    // Resets the highlighting
    cleanup() {
        if (this.currentWord) {
            this.currentWord.classList.remove( this.highlighClassName );
            this.currentWord = null;
        }

        this.lastFocusedWord = null;

        clearTimeout( this.timer );
        this.timer = null;
        this.words = null;
    }

    init() {
        this.words = new Map();

        if (this.syllabifier.enabled || this.speaker.enabled) {
            this.timer = setInterval( () => {
                this._tick();
            }, 30);
        }
    }

    reset( avgWordReadingDuration ) {
        if (avgWordReadingDuration) {
            this.syllabifier.setAvgWordReadingDuration( avgWordReadingDuration );
            this.speaker.setAvgWordReadingDuration( avgWordReadingDuration );
        }

        this.words = new Map();
        this.currentWord = null;
        this.lastFocusedWord = null;
    }

    // Propagates / removed the highlighing
    // Arguments:
    //   el: - the focused word DOM element
    setFocusedWord( el ) {
        if (this.currentWord !== el) {
            // if (this.highlightingEnabled) {
            //     if (this.currentWord) {
            //         this.currentWord.classList.remove( this.highlighClassName );
            //     }
            //     if (el) {
            //         el.classList.add( this.highlighClassName );
            //     }
            // }

            this.currentWord = el;

            if (el) {
                if (!this.words.has( el )) {
                    this.words.set( el, new WordFocus( el ) );
                }
                else {
                    const wordFocus = this.words.get( el );

                    if (this.currentWord !== this.lastFocusedWord) {
                        wordFocus.focusRecorded = false;
                    }

                    const now = window.performance.now();
                    if (now - wordFocus.lastSample > REENTRY_THRESHOLD) {
                        wordFocus.entries++;
                    }

                    wordFocus.lastSample = now;
                }

                this.lastFocusedWord = el;
            }
        }
    }

    _tick() {
        for (let key of this.words.keys()) {
            const wordFocus = this.words.get( key );
            wordFocus.accumulatedTime = Math.max( 0,
                wordFocus.accumulatedTime + (key === this.currentWord ? SAMPLE_DURATION : -SAMPLE_DURATION)
            );

            if (wordFocus.accumulatedTime > FOCUS_THRESHOLD && !wordFocus.focusRecorded) {
                wordFocus.focusRecorded = true;
                wordFocus.focusCount++;
            }

            if (this.syllabifier.inspect( key, wordFocus )) {
                this.events.emitEvent( 'syllabified', [ key ] );
            }

            if (this.speaker.inspect( key, wordFocus )) {
                this.events.emitEvent( 'pronounced', [ key ] );
            }
        }
    };

};
