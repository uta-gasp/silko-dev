  import Feedbacks from '@/model/session/feedbacks.js';
  import SpeechFeedback from '@/model/session/speechFeedback.js';
  import SyllabificationFeedback from '@/model/session/syllabificationFeedback.js';

// Word-in-focus highlighting, syllabification and pronounciation
//  external dependencies:
//      responsiveVoice
//      EventEmitter
//
// Constructor arguments:
//      options: {
//          highlightingEnabled
//          syllabification          - language, or empty
//          syllabificationThreshold - minimum fixation duration in ms to consider the word should be split
//          syllabificationSmart     - if enabled, computeds the threshold after the first page is read
//              syllabificationSmartThresholdMin
//              syllabificationSmartThresholdMax
//              syllabificationSmartThresholdFactor
//          speech          - language, or empty
//          speechThreshold - minimum fixation duration in ms to consider the word should be pronounced
//          focusedWordClass
//          hyphen
//      }
export default class Syllabifier {
    constructor( exceptions, options ) {
        options = options || {};

        this.highlightingEnabled = options.highlightingEnabled || false;
        this.syllabification = {};
        this.syllabification.language = options.syllabification || '';
        this.syllabification.threshold = options.syllabificationThreshold || 2500;
        this.syllabification.smart = {}
        this.syllabification.smart.enabled = options.syllabificationSmart || true;
        this.syllabification.smart.threshold = {}
        this.syllabification.smart.threshold.min = options.syllabificationSmartThresholdMin || 1500;
        this.syllabification.smart.threshold.max = options.syllabificationSmartThresholdMax || 3000;
        this.syllabification.smart.threshold.factor = options.syllabificationSmartThresholdFactor || 4;
        this.speech = {};
        this.speech.language = options.speech || '';
        this.speech.threshold = options.speechThreshold || 4000;
        this.className = options.focusedWordClass || 'currentWord';
        this.hyphen = options.hyphen || String.fromCharCode( 0x00B7 );//DOTS: 00B7 2010 2022 2043 LINES: 2758 22EE 205E 237F

        this.events = new EventEmitter();
        this.hyphenHtml = `<span class="hyphen">${this.hyphen}</span>`;
        this.timer = null;
        this.currentWord = null;
        this.words = null;

        this.rule = rules[ this.syllabification.language ];
        this.voice = voices[ this.speech.language ];

        this.exceptions = {};
        for (let word in exceptions) {
            this.exceptions[ word.toLowerCase() ] = exceptions[ word ].replace( ' ', this.hyphen ).toLowerCase();
        }
    }

    get setup() {
        return new Feedbacks(
            new SpeechFeedback(
                !!this.voice,
                this.speech.threshold
            ),
            new SyllabificationFeedback(
                !!this.rule,
                this.syllabification.threshold,
                this.hyphen
            )
        );
    }

    // Resets the highlighting
    cleanup() {

        if (this.currentWord) {
            this.currentWord.classList.remove( this.className );
            this.currentWord = null;
        }

        clearTimeout( this.timer );
        this.timer = null;
        this.words = null;
    }

    init() {
        this.words = new Map();

        if (this.rule || this.voice) {
            this.timer = setInterval( () => {
                this._tick();
            }, 30);
        }
    }

    reset( updateThresholds ) {
        if (updateThresholds) {
        //     const avgWordReadingDuration = statistics.getAvgWordReadingDuration();
        //     syllabifier.setAvgWordReadingDuration( avgWordReadingDuration );
        }

        this.words = new Map();
        this.currentWord = null;
    }

    // @param text - [""]
    // syllabify( text ) {

    //     if (!this.rule) {
    //         return text;
    //     }

    //     return text.map( line => {
    //         const words = line.split( ' ' ).map( word => word.toLowerCase() );
    //         return words.map( word => this._syllabifyWord( word, this.hyphenHtml ) ).join( ' ' );
    //     });
    // }

    prepare( text ) {

        if (!this.rule) {
            return text;
        }

        const prepareWord = word => {
            if (!word) {
                return word;
            }

            const syllabifiedWord = this._syllabifyWord( word, this.hyphen );
            const hyphenCount = syllabifiedWord.length - word.length;
            const halfHyphenCount = Math.round( hyphenCount / 2 );

            return  '<span class="hyphens">' +
                        (Array( halfHyphenCount + 1 ).join( this.hyphen ) ) +
                    '</span>' +
                    word +
                    '<span class="hyphens">' +
                        (Array( hyphenCount - halfHyphenCount + 1 ).join( this.hyphen ) ) +
                    '</span>';
        };

        if (text instanceof Array) {
            return text.map( line => {
                const words = line.split( ' ' ).map( word => word.toLowerCase() );
                return words.map( prepareWord ).join( ' ' );
            });
        }
        else {
            return prepareWord( text );
        }
    };

    // Propagates / removed the highlighing
    // Arguments:
    //   wordEl: - the focused word DOM element
    setFocusedWord( el ) {

        if (this.currentWord != el) {
            if (this.highlightingEnabled) {
                if (this.currentWord) {
                    this.currentWord.classList.remove( this.className );
                }
                if (el) {
                    el.classList.add( this.className );
                }
            }

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

    _setAvgWordReadingDuration( avgWordReadingDuration ) {
        if (!this.syllabification.smart.enabled) {
            return;
        }

        this.syllabification.threshold =
            Math.max( this.syllabification.smart.threshold.min,
            Math.min( this.syllabification.smart.threshold.max,
            avgWordReadingDuration * this.syllabification.smart.threshold.factor
        ));
    }

    _tick() {
        for (let key of this.words.keys()) {

            const wordSyllabParams = this.words.get( key );
            wordSyllabParams.accumulatedTime = Math.max( 0,
                wordSyllabParams.accumulatedTime + (key === this.currentWord ? 30 : -30)
            );

            if (this.rule && wordSyllabParams.notSyllabified &&
                wordSyllabParams.accumulatedTime > this.syllabification.threshold) {

                wordSyllabParams.notSyllabified = false;

                const word = this._getWordFromElement( key );
                key.innerHTML = this._syllabifyWord( word, this.hyphenHtml );

                this.events.emitEvent( 'syllabified', [ key ] );
            }

            if (this.voice && wordSyllabParams.notPronounced &&
                wordSyllabParams.accumulatedTime > this.speech.threshold) {

                wordSyllabParams.notPronounced = false;
                this.voice( wordSyllabParams.word );

                this.events.emitEvent( 'pronounced', [ key ] );
            }
        }
    };

    _syllabifyWord( word, hyphen ) {
        const exception = Object.keys( this.exceptions ).find( exception => this._isException( word, exception ));
        if (exception) {
            return this._formatException( word, exception, this.exceptions[ exception ], hyphen );
        }

        return this.rule( word, hyphen );
    }

    _isException( word, exception ) {
        return word.toLowerCase().indexOf( exception ) >= 0;
    }

    _formatException( word, exception, syllabified, hyphen ) {
        const start = word.toLowerCase().indexOf( exception );
        const length = exception.length;
        const prefix = word.substr( 0, start );
        const postfix = word.substr( start + length );
        const chars = Array.from( syllabified );

        for (let i = start, j = 0; i < start + length; i++) {
            let c = word.charAt( i );
            if (c === c.toUpperCase()) {
                chars[j] = c;
            }

            while (chars[ ++j ]=== this.hyphen) { }
        }

        let result = chars.join('');
        if (this.hyphen !== hyphen) {
            const re = new RegExp( this.hyphen, 'g' );
            result = result.replace( re, hyphen );
        }

        return prefix + result + postfix;
    }

    _getWordFromElement( element ) {
        const textNodes = Array.from( element.childNodes ).filter( node =>
            node.nodeType === Node.TEXT_NODE ||
            !node.classList.contains( 'hyphens' )
        );

        return textNodes[0].textContent.trim();
    }

    // test
    // syllabified.forEach( line => line.forEach( word => { console.log(word); } ));
    //console.log( new Syllabifier({})._syllabifyWord( 'WeeGee:ssä.', '-' ) );
    //console.log( new Syllabifier({})._syllabifyWord( '"Unien', '-' ) );

};

const rules = {
    Finnish( word, hyphen ) {

        const vowels = [ 'a', 'o', 'u', 'i', 'e', 'ä', 'ö', 'y' ];
        const consonants = [ 'b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm',
                            'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z' ];
        const diftongs = [ 'ai', 'ei', 'oi', 'ui', 'yi', 'äi', 'öi', 'au', 'eu',
                            'iu', 'ou', 'ey', 'iy', 'äy', 'öy', 'ie', 'uo', 'yö' ];

        const getType = c => vowels.includes( c ) ? 'V' : ( consonants.includes( c ) ? 'C' : '_' );

        const result = [];

        let hasVowel = false;
        for (let i = word.length - 1; i >= 0; i--) {
            let separate = false;
            const char = word[i];
            const type = getType( char );
            if (type === 'V') {
                if (i < word.length - 1) {
                    const charPrevious = word[ i + 1 ];
                    const typePrevious = getType( charPrevious );
                    if (charPrevious !== char && typePrevious === type
                        && !diftongs.includes( char + charPrevious)) {
                        result.unshift( hyphen );
                    }
                }
                hasVowel = true;
            }
            else if (type === 'C' && hasVowel) {
                separate = i > 0;
                if (i === 1) {
                    const charNext = word[i - 1];
                    const typeNext = getType( charNext );
                    if (typeNext === type) {
                        separate = false;
                    }
                }
            }
            result.unshift( char );

            if (separate) {
                result.unshift( hyphen );
                hasVowel = false;
            }
        }

        return result.join('');
    }
};

const voices = {
    Finnish( word ) {
        responsiveVoice.speak( word, 'Finnish Female' );
    }
}