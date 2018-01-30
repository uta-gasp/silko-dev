import TextPage from '@/model/task/textPage.js';

// ts-check-only
/* eslint-disable no-unused-vars */ // TODO this should be redundant, but eslint has some bug when parsing this file
import ModelTask from '@/model/task.js';
import Syllabifier from '@/task/syllabifier.js';

const RE_WORD = /(\S+)(\|)([\w,#]+)\b/g;
const RE_LINE = /^(.+)(\s\|)([\w,#]+)$/gm;

const WORD_CLASS = 'word';  // must correspond to the style name in TaskText.vue
const LINE_CLASS = 'line';  // must correspond to the style name in TaskText.vue

const CLASS_NAMES = [   // must correspond to the styles in TaskText.vue
  'light',
  'dark',
];
const WEIGHT_NAMES = [
  'bold',
  'b',                // in this list, shortcuts always follow the full name
  'bolder',
  'normal',
  'n',
  'lighter',
];
const STYLE_NAMES = [
  'regular=normal',   // [style-to-use-in-editor]=[corresponding-css-style]
  'r',                // in this list, shortcuts always follow the full name
  'italic',
  'i',
];

export default class TextPresenter {

  /**
   * @param {ModelTask} task 
   * @param {string[]} firstPage 
   * @param {HTMLElement} container 
   * @param {Syllabifier} syllabifier 
   */
  constructor( task, firstPage, container, syllabifier ) {
    /** @type {HTMLElement} */
    this._container = container;
    /** @type {Syllabifier} */
    this._syllabifier = syllabifier;

    /** @type {(TextPage | string[])[]} */
    this._pages = task.pages;
    /** @type {boolean} */
    this._hasInstructionPage = !!( firstPage && firstPage.length );

    if ( this._hasInstructionPage ) {
      const textPage = new TextPage( -1 );
      textPage.lines = firstPage;
      this._pages.unshift( textPage );
    }

    if ( task.alignment === 'left' ) {
      this._container.classList.add( 'alignLeft' );
    }

    if ( task.fontname ) {
      this._container.style.fontFamily = `"${task.fontname}", Calibri, sans-serif`;
    }

    /** @type {number} */
    this._pageIndex = -1;
  }

  /** @returns {number} */
  get page() {
    return this._pageIndex;
  }

  /** @returns {number} */
  get originalPageIndex() {
    return this._hasInstructionPage ? this._pageIndex - 1 : this._pageIndex;
  }

  /** @returns {boolean} */
  get isInstructionPage() {
    return this._pageIndex === 0 && this._hasInstructionPage;
  }

  /** @returns {boolean} */
  get hasNextPage() {
    return ( this._pageIndex + 1 ) < this._pages.length;
  }

  /** @returns {boolean} */
  get hasPrevPage() {
    return ( this._pageIndex - 1 ) >= 0;
  }

  nextPage() {
    const newPageIndex = this._pageIndex + 1;
    if ( newPageIndex >= this._pages.length ) {
      return;
    }

    this._pageIndex = newPageIndex;

    this._createLines( this._container );
  }

  prevPage() {
    const newPageIndex = this._pageIndex - 1;
    if ( newPageIndex < 0 ) {
      return;
    }

    this._pageIndex = newPageIndex;

    this._createLines( this._container );
  }

  /** @returns {Map} */
  get words() {
    const result = new Map();

    const els = document.querySelectorAll( '.' + WORD_CLASS );
    Array.from( els ).forEach( el => {
      result.set( el, this._syllabifier.unprepare( el.textContent ) );
    } );

    return result;
  }

  // Private

  /**
   * @param {HTMLElement} el 
   */
  _createLines( el ) {
    el.innerHTML = '';

    const page = this._pages[ this._pageIndex ];

    /** @type {string[]} */
    let lines;
    if ('lines' in page) {
      lines = /** @type {TextPage}*/ (page).lines;
    }
    else { // backward compatibility with format where Task.pages=[[String]]
      lines = /** @type {string[]}*/ (page);
    }

    lines.forEach( line => {
      el.appendChild( this._lineToElement( line ) );
    } );

    this._splitText();
  }

  /**
   * Creates a text line from a string. Features:
   *      Classes can be listed after "|" (lines) or "\" (words)
   *      For example, "This is\b a text|n" will expand
   *      to HTML "<span class="n">This <span class="b">is</span> a text</span>"
   * @param {string} line
   * @returns {HTMLElement} 
   */
  _lineToElement( line ) {
    const styledLine = this._parseStyles( line );

    const el = document.createElement( 'div' );
    el.innerHTML = styledLine;
    el.classList.add( LINE_CLASS );

    return el;
  }

  /**
   * @param {string} line 
   * @returns {string}
   */
  _parseStyles( line ) {
    function applyStyleAndSpace() {
      return applyStyle( ...arguments, true );
    }

    /* eslint no-unused-vars: ["error", { "args": "none" } ] */
    /**
     * @param {string} match 
     * @param {string} [p1] 
     * @param {string} [p2] 
     * @param {string} [p3] 
     * @param {number} [offset]
     * @param {string} [string]
     * @param {boolean} [addSpace]
     */
    function applyStyle( match, p1, p2, p3, offset, string, addSpace ) {
      const text = p1;
      const styles = p3;

      /** @type {string[]} */
      const css = [];
      /** @type {string[]} */
      const classes = [];
      styles.split( ',' ).forEach( style => {
        const styleAsNumber = Number.parseInt( style );
        const isNumber = !Number.isNaN( styleAsNumber );

        if ( CLASS_NAMES.includes( style ) ) {
          classes.push( style );
        }
        else if ( WEIGHT_NAMES.includes( style ) || ( isNumber && styleAsNumber % 100 ) === 0 ) {
          if ( style.length === 1 ) {  // handle shortcuts
            style = WEIGHT_NAMES[ WEIGHT_NAMES.indexOf( style ) - 1 ];
          }
          css.push( 'font-weight:' + style + ' !important' );
        }
        else if ( STYLE_NAMES.includes( style ) ) {
          if ( style.length === 1 ) {  // handle shortcuts
            style = STYLE_NAMES[ STYLE_NAMES.indexOf( style ) - 1 ];
          }
          if ( style.indexOf( '=' ) >= 0 ) {
            style = style.split( '=' )[1];
          }
          css.push( 'font-style:' + style + ' !important' );
        }
        else {
          css.push( ( isNumber ? 'font-size:' : 'color:' ) + style );
        }
      } );

      const s = addSpace ? ' ' : '';
      return `<span class="${classes.join( ' ' )}" style="${css.join( ';' )}">${s}${text}</span>${s}`;
    }

    return line.replace( RE_WORD, applyStyleAndSpace ).replace( RE_LINE, applyStyle );
  }

  // Splits the text nodes into words, each in its own span.word element
  _splitText() {
    const re = /[^\s]+/gi;

    const nodeIterator = document.createNodeIterator(
      this._container,
      NodeFilter.SHOW_TEXT,
      { acceptNode: node => {
        if ( !/^\s*$/.test( node.nodeValue ) ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }}
    );

    // Show the content of every non-empty text node that is a child of root
    let node;
    let wordID = 0;
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

        const wordText = this._syllabifier.prepareWord( word[ 0 ] );

        const span = document.createElement( 'span' );
        span.classList.add( WORD_CLASS );
        span.dataset.wordId = wordID++ + '';
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
