import Syllabifier from '@/task/syllabifier.js';

import Metric from '@/vis/metric.js';
import Colors from '@/vis/colors.js';

import WordFont from '@/model/data/wordFont.js';

// ts-check-only
import { SyllabOptions } from '@/model/session/feedbacks.js';
import Font from '@/model/session/font.js';

/**
 * Point
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * Word
 * @typedef {Object} Word
 * @property {number} id
 * @property {string} text
 * @property {Rect} rect
 * @property {number} left
 * @property {number} right
 * @property {number} top
 * @property {number} bottom
 * @property {{charSpeed: number, syllableSpeed: number}} reading
 * @property {{duration: number, count: number}} [focusing]
 * @property {WordFont} [font]
 */

/**
 * Rect
 * @typedef {Object} Rect
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * Underline
 * @typedef {Object} Underline
 * @property {number} left
 * @property {number} right
 * @property {number} y
 */

/**
 * Event
 * @typedef {Object} Event
 * @property {number} id
 * @property {string} text
 * @property {Rect} rect
 */

/**
 * @typedef {Object} WordSettings
 * @property {string} wordColor
 * @property {string} wordHighlightColor
 * @property {string} wordRectColor
 * @property {boolean} drawWordFrame
 */

/**
 * @typedef {Object} SyllabSettings
 * @property {string} background
 * @property {string} wordColor
 */

/**
 * @typedef {Object} GazePathSettings
 * @property {string} colorMetric
 * @property {string} saccadeColor
 * @property {string} regressionColor
 * @property {boolean} showConnections
 * @property {boolean} showSaccades
 * @property {boolean} showFixations
 * @property {SyllabSettings} syllab
 * @property {string} connectionColor
 */

/**
 * Fixation
 * @typedef {Object} Fixation
 * @property {number} ts
 * @property {number} duration
 * @property {number} x
 * @property {number} y
 * @property {Word} word
 * @property {number} line
 * @property {boolean} [isRegression]
 * @property {boolean} [merged]
 */

/**
 * Name
 * @typedef {Object} Name
 * @property {string} text
 * @property {string} color
 * @property {*} index
 */

const WORD_HIGHLIGHT_COLOR = '#A06';

const LINE_COLOR_A = 0.5;
const LINE_COLORS = [
  `rgba(255,0,0,${LINE_COLOR_A}`,
  `rgba(255,255,0,${LINE_COLOR_A}`,
  `rgba(0,255,0,${LINE_COLOR_A}`,
  `rgba(0,255,224,${LINE_COLOR_A}`,
  `rgba(0,128,255,${LINE_COLOR_A}`,
  `rgba(255,0,255,${LINE_COLOR_A}`,
];

const UNMAPPED_FIXATION_COLOR = 'rgba(0,0,0,0.5)';
const MERGED_FIXATION_BORDER_COLOR = '#808';

const CHECK_MARK = String.fromCharCode( 0x2713 );
const NO_DATA_MARK = String.fromCharCode( 0x26A0 );

export class Painter {

  /**
   * @param {HTMLCanvasElement} el 
   * @param {{syllab: SyllabOptions}} settings 
   */
  constructor( el, settings ) {
    this._width = document.body.offsetWidth;
    this._height = parseInt( window.getComputedStyle( el ).height );
    el.setAttribute( 'width', this._width + '' );
    el.setAttribute( 'height', this._height + '' );

    this._offsetX = 0;
    this._offsetY = 0;

    this._font = null;

    this._syllabifier = new Syllabifier( settings.syllab );

    this._ctx = el.getContext( '2d' );

    this.clean();
  }

  /** @returns {Point} */
  get offset() {
    return {
      x: this._offsetX,
      y: this._offsetY,
    };
  }

  clean() {
    this._ctx.clearRect( 0, 0, this._width, this._height );
  }

  /**
   * @param {Font} font 
   */
  setFont( font ) {
    this._font = font;
    this._ctx.font = `${font.style} ${font.weight} ${font.size} ${font.family}`;
  }

  /**
   * @typedef {Object} WordsSettings
   * @implements {WordSettings}
   * @property {string} colorMetric
   * @property {string} showConnections
   * @property {string} hyphen
   */

  /**
   * @param {Word[]} words 
   * @param {WordsSettings} settings 
   */
  drawWords( words, settings ) {
    const metricRange = Metric.computeRange( words, settings.colorMetric );

    words.forEach( word => {
      const wordSettings = Object.assign( {
        alpha: Metric.getAlpha( word, settings.colorMetric, metricRange ),
      }, settings );

      this._drawWord( word, wordSettings );
    } );
  }

  /**
   * @typedef {Object} SyllabsSettings
   * @implements {SyllabSettings}
   * @property {boolean} isSyllabified
   * @property {string} hyphen
   */
  /**
   * @param {Event[]} events 
   * @param {SyllabsSettings} settings 
   */
  drawSyllabifications( events, settings ) {
    events.forEach( event => {
      this.drawSyllabification( event, settings );
    } );
  }

  /**
   * @param {Event} event 
   * @param {SyllabsSettings} settings 
   */
  drawSyllabification( event, settings ) {
    const ctx = this._ctx;

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    const rc = event.rect;
    const word = settings.isSyllabified
      ? this._syllabifier.syllabifyWord( event.text, settings.hyphen )
      : event.text;

    var { x, y } = this._offset( rc );
    ctx.fillStyle = settings.background;
    ctx.fillRect( x, y, rc.width, rc.height );

    /* eslint no-redeclare: "off" */
    var { x, y } = this._offset( rc, { dy: 0.8 * rc.height } );
    ctx.fillStyle = settings.wordColor;
    ctx.fillText( word, x, y );
  }

  /**
   * @param {Fixation[]} fixations 
   * @param {GazePathSettings} settings 
   */
  drawFixations( fixations, settings ) {
    /** @type {Fixation} */
    let prevFix;

    fixations.forEach( fix => {
      if ( fix.x <= 0 && fix.y <= 0 ) {
        return;
      }

      if ( settings.showSaccades && prevFix ) {
        this._drawSaccade( prevFix, fix, settings );
      }

      if ( settings.showConnections && fix.word ) {
        this._drawConnection( fix, {
              x: ( fix.word.left + fix.word.right ) / 2, 
              y: fix.word.bottom
            }, {
              left: fix.word.left,
              right: fix.word.right,
              y: fix.word.bottom
            },
          settings 
        );
      }

      this._drawFixation( fix, settings );

      prevFix = fix;
    } );
  }

  /**
   * @typedef {Object} NamesSettings
   * @property {number} fontSize
   * @property {string} fontFamily
   * @property {Point} location
   * @property {number} nameSpacing
   * @property {string} [reason]
   */
  /**
   * @param {Name[]} names 
   * @param {NamesSettings} settings 
   */
  drawNames( names, settings ) {
    const ctx = this._ctx;

    names.forEach( ( name, index ) => {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = name.color;
      ctx.font = `bold ${settings.fontSize}px ${settings.fontFamily}`;

      const location = {
        x: settings.location.x + settings.fontSize,
        y: settings.location.y + ( settings.nameSpacing * settings.fontSize ) * index,
      };

      ctx.fillText( name.text, location.x, location.y );
    } );
  }

  /**
   * @param {Name} name
   * @param {NamesSettings} settings 
   */
  checkName( name, settings ) {
    const ctx = this._ctx;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.strokeStyle = '#000';
    ctx.fillStyle = name.color;

    const isNoData = settings.reason === 'no data';
    const fontFamily = isNoData ? 'Segoe UI' : settings.fontFamily;
    ctx.font = `bold ${settings.fontSize}px ${fontFamily}`;

    const location = {
      x: settings.location.x,
      y: settings.location.y + ( settings.nameSpacing * settings.fontSize ) * name.index,
    };

    ctx.fillText( isNoData ? NO_DATA_MARK : CHECK_MARK, location.x, location.y );
  }

  /**
   * @param {{width: number, height: number}} screenSize 
   */
  setScreenSize( screenSize ) {
    this._offsetX = ( this._width - screenSize.width ) / 2;
    this._offsetY = ( this._height - screenSize.height ) / 2;
  }

  /**
   * @param {Point | Rect | Fixation} point 
   * @param {{dx: number, dy: number}} [offset={dx: 0, dy: 0}] 
   * @returns {Point}
   */
  _offset( { x = 0, y = 0 }, { dx = 0, dy = 0 } = { dx: 0, dy: 0 } ) {
    return { x: x + this._offsetX + dx, y: y + this._offsetY + dy };
  }

  /**
   * @param {number} realWidth
   * @param {Word} word
   */
  _autoAdjustFontSize( realWidth, word ) {
    if (word.font) {
      const font = word.font;
      this._ctx.font = `${font.style} ${font.weight} ${font.size} ${this._font.family}`;
    }
    else {
      const font = this._font;
      this._ctx.font = `${font.style} ${font.weight} ${font.size} ${font.family}`;

      const wordSizeOfDefaultSize = this._ctx.measureText( word.text );
      const ratioToRealSize = realWidth / wordSizeOfDefaultSize.width;

      const p = /(\d+)(\w+)/.exec( font.size );
      const newSize = (parseFloat(p[1]) * ratioToRealSize).toFixed( 2 ) + p[2];

      this._ctx.font = `${font.style} ${font.weight} ${newSize} ${this._font.family}`;
    }
  }
  
  /**
   * @typedef {Object} TransparentWordsSettings
   * @implements {WordsSettings}
   * @property {number} alpha
   */
  
  /**
   * @param {Word} word
   * @param {TransparentWordsSettings} settings 
   */
  _drawWord( word, settings ) {
    const ctx = this._ctx;
    const rc = word.rect;

    this._autoAdjustFontSize( rc.width, word );

    var { x, y } = this._offset( rc, { dy: 0.8 * rc.height } );

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = word.font ? word.font.color : settings.wordColor;
    ctx.fillText( word.text, x, y );

    if ( settings.alpha > 0 ) {
      ctx.fillStyle = Colors.rgb2rgba( WORD_HIGHLIGHT_COLOR, settings.alpha );
      ctx.fillText( word.text, x, y );
    }

    // hide hyphens
    ctx.fillStyle = '#fff';
    let [prefix, suffix] = Syllabifier.getPrefixAndSuffix( word.text, settings.hyphen );
    if ( prefix ) {
      ctx.fillText( prefix, x, y );
    }
    if ( suffix ) {
      const { x, y } = this._offset( rc, { dx: rc.width, dy: 0.8 * rc.height } );
      ctx.textAlign = 'end';
      ctx.fillText( suffix, x, y );
    }

    if ( settings.drawWordFrame ) {
      const { x, y } = this._offset( rc );
      ctx.strokeStyle = settings.wordRectColor;
      ctx.lineWidth = 1;
      ctx.strokeRect( x, y, rc.width, rc.height );
    }
  }

  /**
   * @param {Fixation} from 
   * @param {Fixation} to 
   * @param {GazePathSettings} settings 
   */
  _drawSaccade( from, to, settings ) {
    const ctx = this._ctx;

    ctx.strokeStyle = to.isRegression ? settings.regressionColor : settings.saccadeColor;
    ctx.beginPath();

    // let x = settings.showIDs ? ( from._x ? from._x : from.x ) : from.x;
    var { x, y } = this._offset( from );
    ctx.moveTo( x, y );

    // x = settings.showIDs ? ( to._x ? to._x : to.x ) : to.x;
    /* eslint no-redeclare: "off" */
    var { x, y } = this._offset( to );
    ctx.lineTo( x, y );
    ctx.stroke();
  }

  /**
   * @param {Point} from 
   * @param {Point} to 
   * @param {Underline} underline
   * @param {GazePathSettings} settings 
   */
  _drawConnection( from, to, underline, settings ) {
    const ctx = this._ctx;

    ctx.strokeStyle = settings.connectionColor;
    ctx.beginPath();

    // const x = settings.showIDs ? ( from._x ? from._x : from.x ) : from.x;
    var { x, y } = this._offset( from );
    ctx.moveTo( x, y );
    /* eslint no-redeclare: "off" */
    var { x, y } = this._offset( to );
    ctx.lineTo( x, y );

    ctx.stroke();

    ctx.strokeStyle = settings.connectionColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    var { x, y } = this._offset( { x: underline.left, y: underline.y } );
    ctx.moveTo( x, y );
    var { x, y } = this._offset( { x: underline.right, y: underline.y } );
    ctx.lineTo( x, y );
    ctx.stroke();
  };

  /**
   * @param {Fixation} fixation 
   * @param {GazePathSettings} settings 
   */
  _drawFixation( fixation, settings ) {
    const ctx = this._ctx;

    if ( fixation.line !== undefined ) {
      ctx.fillStyle = LINE_COLORS[ fixation.line % LINE_COLORS.length ];
    }
    else {
      ctx.fillStyle = UNMAPPED_FIXATION_COLOR;
    }

    const circleSize = Math.round( Math.sqrt( fixation.duration ) ) / 2;

    var { x, y } = this._offset( fixation );
    ctx.beginPath();
    ctx.arc( x, y, circleSize, 0, 2 * Math.PI );
    ctx.fill();

    if ( fixation.isRegression ) {
      ctx.strokeStyle = settings.regressionColor;
      ctx.stroke();
    }

    if ( fixation.merged ) {
      ctx.strokeStyle = MERGED_FIXATION_BORDER_COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc( x, y, circleSize + 3, 0, 2 * Math.PI );
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

};
