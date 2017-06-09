import SyllabificationFeedback from '@/model/session/syllabificationFeedback.js';

export default class Syllabifier {
    constructor( options ) {
        this.options = Object.assign( {}, options );
        this.options.threshold.factor = 4;

        this.className = 'currentWord';
        this.hyphen = String.fromCharCode( 0x00B7 );//DOTS: 00B7 2010 2022 2043 LINES: 2758 22EE 205E 237F

        this.hyphenHtml = `<span class="hyphen">${this.hyphen}</span>`;

        this.rule = rules[ this.options.language ];

        this.exceptions = {};
        for (let word in this.options.exceptions) {
            this.exceptions[ word.toLowerCase() ] = this.options.exceptions[ word ].replace( ' ', this.hyphen ).toLowerCase();
        }
    }

    get enabled() {
        return !!this.rule;
    }

    get setup() {
        return new SyllabificationFeedback(
            !!this.rule,
            this.options.threshold.value,
            this.hyphen
        );
    }

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

    inspect( el, params ) {
        if (this.rule && params.notSyllabified &&
            params.accumulatedTime > this.options.threshold.value) {

            params.notSyllabified = false;

            el.innerHTML = this._syllabifyWord( params.word, this.hyphenHtml );

            return true;
        }

        return false;
    }

    setAvgWordReadingDuration( wordReadingDuration ) {
        if (!this.options.threshold.smart) {
            return;
        }

        this.options.threshold.value =
            Math.max( this.options.threshold.min,
            Math.min( this.options.threshold.max,
            wordReadingDuration * this.options.threshold.factor
        ));
    }

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
        let vowelsInRow = 0;

        for (let i = word.length - 1; i >= 0; i--) {
            let separate = false;
            const char = word[i];
            const type = getType( char );
            const charNext = i > 0 ? word[i - 1] : null;
            const typeNext = charNext ? getType( charNext ) : '_';

            if (type === 'V') {
                hasVowel = true;
                vowelsInRow++;

                if (i < word.length - 1) {
                    const charPrevious = word[ i + 1 ];
                    const typePrevious = getType( charPrevious );
                    if (charPrevious !== char && typePrevious === type
                        && !diftongs.includes( char + charPrevious )) {
                        result.unshift( hyphen );
                        vowelsInRow = 0;
                    }
                    else if ( char === 'i' && result[0] === 'e' && result[1] === 'n') { // handle '-ien' ending
                        result.unshift( hyphen );
                        vowelsInRow = 0;
                    }
                    else if (vowelsInRow === 3) { // this is a comound word... make a guess
                        result.unshift( hyphen );
                        vowelsInRow = 0;
                    }
                }
            }
            else if (type === 'C' && hasVowel) {
                vowelsInRow = 0;

                separate = i > 0;
                if (i === 1) {  // prevent the two leading consonants to separate (eg. 'kreikka' )
                    // const charNext = word[i - 1];
                    // const typeNext = getType( charNext );
                    if (typeNext === type) {
                        separate = false;
                    }
                }
            }

            result.unshift( char );

            if (separate) {
                if (type !== '_' && typeNext !== '_') {
                    result.unshift( hyphen );
                }
                hasVowel = false;
            }
        }

        return result.join('');
    }
};
