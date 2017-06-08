import Feedbacks from '@/model/session/feedbacks.js';

import Syllabifier from './syllabifier.js';
import Speaker from './speaker.js';

export default class FeedbackProvider {
    constructor( syllab, speech ) {

        this.syllabifier = new Syllabifier( syllab );
        this.speaker = new Speaker( speech );

        this.highlighClassName = 'currentWord';

        this.events = new EventEmitter();
        this.timer = null;
        this.currentWord = null;
        this.words = null;
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
    }

    // Propagates / removed the highlighing
    // Arguments:
    //   wordEl: - the focused word DOM element
    setFocusedWord( el ) {

        if (this.currentWord != el) {
            // if (this.highlightingEnabled) {
            //     if (this.currentWord) {
            //         this.currentWord.classList.remove( this.highlighClassName );
            //     }
            //     if (el) {
            //         el.classList.add( this.highlighClassName );
            //     }
            // }

            this.currentWord = el;

            if (el && !this.words.has( el )) {
                this.words.set( el, {
                    accumulatedTime: 0,
                    notSyllabified: true,
                    notPronounced: true,
                    word: this._getWordFromElement( el )
                });
            }
        }
    }

    _tick() {
        for (let key of this.words.keys()) {

            const wordParams = this.words.get( key );
            wordParams.accumulatedTime = Math.max( 0,
                wordParams.accumulatedTime + (key === this.currentWord ? 30 : -30)
            );

            if (this.syllabifier.inspect( key, wordParams )) {
                this.events.emitEvent( 'syllabified', [ key ] );
            }

            if (this.speaker.inspect( key, wordParams )) {
                this.events.emitEvent( 'pronounced', [ key ] );
            }
        }
    };

    _getWordFromElement( element ) {
        const textNodes = Array.from( element.childNodes ).filter( node =>
            node.nodeType === Node.TEXT_NODE ||
            !node.classList.contains( 'hyphens' )
        );

        return textNodes[0].textContent.trim();
    }
};
