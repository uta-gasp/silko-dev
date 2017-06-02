export default class TextPresenter {
    constructor( task, firstPage, container, syllabifier ) {
        this.task = task;
        this.firstPage = firstPage;
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

    nextPage() {
        const newPageIndex = this.pageIndex + 1;
        if (newPageIndex >= this.pages.length) {
            return;
        }

        this.pageIndex = newPageIndex;

        this._createLines( this.container );
    }

    _createLines( el ) {
        el.innerHTML = '';

        const lines = this.pages[ this.pageIndex ];

        lines.forEach( line => {
            el.appendChild( this._lineToElement( line ) );
        });

        this._splitText();
    }

    // Creates a text line from a string. Features:
    //   1. Classes can be listed after "|"
    //      For example, "This is a text|header|bold" will expand
    //      to HTML "<soan class="header bold"> This is a text </span>"
    //   2. "\b" placed right after a word adds "bold" class
    _lineToElement( line ) {
        const reBold = /(\S+)(\\b)/g;
        const parts = line.split( '|' );
        let lineText = parts[0].replace( reBold, '<span class="bold"> $1</span>' );

        const el = document.createElement( 'div' );
        el.innerHTML = lineText;
        el.classList.add( 'line' );

        for (let i = 1; i < parts.length; i++) {
            el.classList.add( parts[i] );
        }

        return el;
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
