const RE_WORD = /(\S+)(\|)([\w,#]+)\b/g;
const RE_LINE = /^(.+)(\s\|)([\w,#]+)$/gm;
const CLASS_NAMES = [   // must correspond to the styles in TaskText.vue
  'lighter',
  'darker',
];
const WEIGHT_NAMES = [   // must correspond to the styles in TaskText.vue
  'bold',
  'b',
  'bolder',
  'normal',
  'n',
  'lighter',
  'l',
];
const STYLE_NAMES = [   // must correspond to the styles in TaskText.vue
  'regular',
  'r',
  'italic',
  'i',
];

export default class TextPresenter {

  constructor( task, firstPage, container, syllabifier ) {
    this.container = container;
    this.syllabifier = syllabifier;

    this.pages = task.pages;
    this.hasInstructionPage = !!( firstPage && firstPage.length );

    if ( this.hasInstructionPage ) {
      this.pages.unshift( firstPage );
    }

    this.pageIndex = -1;

    this.WORD_CLASS = 'word';
  }

  get page() {
    return this.pageIndex;
  }

  get isInstructionPage() {
    return this.pageIndex === 0 && this.hasInstructionPage;
  }

  get hasNextPage() {
    return ( this.pageIndex + 1 ) < this.pages.length;
  }

  get hasPrevPage() {
    return ( this.pageIndex - 1 ) >= 0;
  }

  nextPage() {
    const newPageIndex = this.pageIndex + 1;
    if ( newPageIndex >= this.pages.length ) {
      return;
    }

    this.pageIndex = newPageIndex;

    this._createLines( this.container );
  }

  prevPage() {
    const newPageIndex = this.pageIndex - 1;
    if ( newPageIndex < 0 ) {
      return;
    }

    this.pageIndex = newPageIndex;

    this._createLines( this.container );
  }

  get words() {
    const result = new Map();

    const els = document.querySelectorAll( '.' + this.WORD_CLASS );
    Array.from( els ).forEach( el => {
      result.set( el, this.syllabifier.unprepare( el.textContent ) );
    } );

    return result;
  }

  // Private

  _createLines( el ) {
    el.innerHTML = '';

    const lines = this.pages[ this.pageIndex ];

    lines.forEach( line => {
      el.appendChild( this._lineToElement( line ) );
    } );

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
        const styleAsNumber = Number.parseInt( style );
        const isNumber = !Number.isNaN( styleAsNumber );

        if ( CLASS_NAMES.includes( style ) ) {
          classes.push( style );
        }
        else if ( WEIGHT_NAMES.includes( style ) || ( isNumber && styleAsNumber % 100 ) === 0 ) {
          css.push( 'font-weight:' + style );
        }
        else if ( STYLE_NAMES.includes( style ) ) {
          css.push( 'font-style:' + style );
        }
        else {
          css.push( ( isNumber ? 'font-size:' : 'color:' ) + style );
        }
      } );

      const s = space ? ' ' : '';
      return `<span class="${classes.join( ' ' )}" style="${css.join( ';' )}">${s}${text}</span>${s}`;
    }

    return line.replace( RE_WORD, applyStyleAndSpace ).replace( RE_LINE, applyStyle );
  }

  // Splits the text nodes into words, each in its own span.word element
  _splitText() {
    const re = /[^\s]+/gi;

    const nodeIterator = document.createNodeIterator(
      this.container,
      window.NodeFilter.SHOW_TEXT,
      { acceptNode: node => {
        if ( !/^\s*$/.test( node.data ) ) {
          return window.NodeFilter.FILTER_ACCEPT;
        }
        return window.NodeFilter.FILTER_REJECT;
      }}
    );

    // Show the content of every non-empty text node that is a child of root
    let node;
    const docFrags = [];

    while ( ( node = nodeIterator.nextNode() ) ) {
      let word;
      let index = 0;
      const docFrag = document.createDocumentFragment();

      while ( ( word = re.exec( node.textContent ) ) !== null ) {
        if ( index < word.index ) {
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
    } );
  }

};
