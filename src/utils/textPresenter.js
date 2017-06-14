const RE_WORD = /(\S+)(\|)([\w,#]+)\b/g;
const RE_LINE = /^(.+)(\s\|)([\w,#]+)$/gm;
const CLASS_NAMES = [   // must correspond to the styles in TaskText.vue
    'lighter',
    'darker'
];

export default class TextPresenter {
    constructor( task, firstPage, container, syllabifier ) {
        // this.task = task;
        // this.firstPage = firstPage;
        this.container = container;
        this.syllabifier = syllabifier;

        this.pages = task.pages;
        if (firstPage) {
            this.pages.unshift( firstPage );
        }

        this.pageIndex = -1;

        this.WORD_CLASS = 'word';
    }

    get page() {
        return this.pageIndex;
    }

    get hasNextPage() {
        return (this.pageIndex + 1) < this.pages.length;
    }

    get hasPrevPage() {
        return (this.pageIndex - 1) >= 0;
    }

    nextPage() {
        const newPageIndex = this.pageIndex + 1;
        if (newPageIndex >= this.pages.length) {
            return;
        }

        this.pageIndex = newPageIndex;

        this._createLines( this.container );
    }

    prevPage() {
        const newPageIndex = this.pageIndex - 1;
        if (newPageIndex < 0) {
            return;
        }

        this.pageIndex = newPageIndex;

        this._createLines( this.container );
    }

    get words() {
        const result = new Map();

        const els = document.querySelectorAll( '.' + this.WORD_CLASS );
        Array.from( els).forEach( el => {
            result.set( el, this.syllabifier.unprepare( el.textContent ) );
        });

        return result;
    }

    // Private

    _createLines( el ) {
        el.innerHTML = '';

        const lines = this.pages[ this.pageIndex ];

        lines.forEach( line => {
            el.appendChild( this._lineToElement( line ) );
        });

        this._splitText();
    }

    // Creates a text line from a string. Features:
    //      Classes can be listed after "|" (lines) or "\" (words)
    //      For example, "This is\b a text|n" will expand
    //      to HTML "<span class="n">This <span class="b">is</span> a text</span>"
    _lineToElement( line ) {

        const styledLine = this._parseStyles( line );

        const el = document.createElement( 'div' );
        el.innerHTML = styledLine;
        el.classList.add( 'line' );

        return el;
    }

    _parseStyles( line ) {
        function applyStyleAndSpace() {
            return applyStyle( ...arguments, true );
        }

        function applyStyle( match, p1, p2, p3, offset, string, space ) {
            const text = p1;
            const styles = p3;

            const css = [];
            const classes = [];
            styles.split( ',' ).forEach( style => {
                if (CLASS_NAMES.includes( style )) {
                    classes.push( style );
                }
                else {
                    const isNumber = !Number.isNaN( Number.parseInt( style ) );
                    css.push( (isNumber ? 'font-size:' : 'color:') + style );
                }
            });

            const s = space ? ' ' : '';
            return `<span class="${classes.join(' ')}" style="${css.join(';')}">${s}${text}</span>${s}`;
        }

        return line.replace( RE_WORD, applyStyleAndSpace ).
                    replace( RE_LINE, applyStyle );
    }

    // Splits the text nodes into words, each in its own span.word element
    _splitText() {
        const re = /[^\s]+/gi;

        const nodeIterator = document.createNodeIterator(
            this.container,
            NodeFilter.SHOW_TEXT,
            { acceptNode: node => {
                if ( ! /^\s*$/.test( node.data ) ) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }}
        );

        // Show the content of every non-empty text node that is a child of root
        let node;
        const docFrags = [];

        while ((node = nodeIterator.nextNode())) {

            let word;
            let index = 0;
            const docFrag = document.createDocumentFragment();

            while ((word = re.exec( node.textContent )) !== null) {

                if (index < word.index) {
                    const space = document.createTextNode( node.textContent.substring( index, word.index ) );
                    docFrag.appendChild( space );
                }

                const wordText = this.syllabifier.prepare( word[ 0 ] );

                const span = document.createElement( 'span' );
                span.classList.add( this.WORD_CLASS );
                span.innerHTML = wordText;
                docFrag.appendChild( span );

                index = re.lastIndex;
            }

            docFrags.push( { node, docFrag } );
        }

        docFrags.forEach( item => {
            item.node.parentNode.replaceChild( item.docFrag, item.node );
        });
    }
};
