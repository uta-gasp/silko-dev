import SyllabificationFeedback from '@/model/session/syllabificationFeedback.js';

const RESTORE_INTERVAL = 3000;

export default class Syllabifier {
    constructor( options ) {
        this.options = { ...options };
        this.options.threshold.factor = 4;

        this.hyphen = Syllabifier.MODES[ 'hyphen' ];

        this.hyphenHtml = `<span class="hyphen">${this.hyphen}</span>`;

        this.rule = rules[ this.options.language ];

        this.exceptions = {};
        for (let word in this.options.exceptions) {
            this.exceptions[ word.toLowerCase() ] = this.options.exceptions[ word ].replace( ' ', this.hyphen ).toLowerCase();
        }
    }

    static get MODES() {
        return {
            hyphen: String.fromCharCode( 0x00B7 ), //DOTS: 00B7 2010 2022 2043 LINES: 2758 22EE 205E 237F
            colors: [ 'black', 'red'] //, '#0af'
        };
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

        if (!this.rule || this.options.mode !== 'hyphen') {
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
    }

    unprepare( text ) {
        return text.replace( new RegExp( this.hyphen, 'g' ), '' );
    }

    inspect( el, params ) {
        if (this.rule && params.notSyllabified &&
            params.accumulatedTime > this.options.threshold.value) {

            params.notSyllabified = false;

            el.innerHTML = this._syllabifyWord( params.word, this.hyphenHtml );

            if (this.options.temporary) {
                console.log('i;ll be back');
                setTimeout( () => {
                    this._restore( el );
                }, RESTORE_INTERVAL );
            }

            return true;
        }

        return false;
    }

    syllabifyWord( el, word ) {
        if (!this.rule) {
            return false;
        }

        el.innerHTML = this._syllabifyWord( word, this.hyphenHtml );

        return true;
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

    _syllabifyWord( word, hyphen ) {
        if (this.options.mode === 'colors') {
            hyphen = this.hyphen;
        }

        let result;
        const exception = Object.keys( this.exceptions ).find( exception => this._isException( word, exception ));
        if (exception) {
            result = this._formatException( word, exception, this.exceptions[ exception ], hyphen );
        }
        else {
            result = this.rule( word, hyphen );
        }

        if (this.options.mode === 'colors') {
            const syllabs = result.split( this.hyphen );
            result = this._colorize( syllabs );
        }

        return result;
    }

    _restore( el ) {
        let text = null;
        try {
            text = el.textContent;
        }
        catch (e) { }

        if (text) {
            const syllabs = text.split( this.hyphen );
            el.innerHTML = syllabs.join('');
        }
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
            if (c === c.toUpperCase()) {    // this is not a letter
                chars[j] = c;
            }

            while (chars[ ++j ] === this.hyphen) { }    // just copy hyphens
        }

        let result = chars.join('');
        if (this.hyphen !== hyphen) {
            const re = new RegExp( this.hyphen, 'g' );
            result = result.replace( re, hyphen );
        }

        return prefix + result + postfix;
    }

    _colorize( syllabs ) {
        const colors = Syllabifier.MODES[ 'colors' ];
        let colorIndex = 0;

        const colorizedSyllabs = syllabs.map( syllab => {
            const result = `<span style="color: ${colors[ colorIndex ]}">${syllab}</span>`;
            if (++colorIndex === colors.length) {
                colorIndex = 0;
            }
            return result;
        });

        return colorizedSyllabs.join('');
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
                    else if (vowelsInRow === 3) { // this is a compound word... split as "V-VV" (incorrect for eg maailma)
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
