import Syllabifier from '@/task/syllabifier.js';

import Metric from '@/vis/metric.js';
import Colors from '@/vis/colors.js';

// ts-check-only
import SyllabificationFeedback from '@/model/session/syllabificationFeedback.js';
import Font from '@/model/session/font.js';

/**
 * Point
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 * @property {boolean} [isRegression]
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
 * @property {{charSpeed: number, syllableSpeed: number}} reading
 * @property {{duration: number, count: number}} [focusing]
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

export default class Painter {

  /**
   * @param {HTMLCanvasElement} el 
   * @param {{syllab: SyllabificationFeedback}} settings 
   */
  constructor( el, settings ) {
    this.width = document.body.offsetWidth;
    this.height = parseInt( window.getComputedStyle( el ).height );
    el.setAttribute( 'width', this.width + '' );
    el.setAttribute( 'height', this.height + '' );

    this.offsetX = 0;
    this.offsetY = 0;

    this.settings = settings;
    this.syllabifier = new Syllabifier( settings.syllab );

    this.ctx = el.getContext( '2d' );
    this.clean();
  }

  /**
   * @returns {{x: number, y: number}}
   */
  get offset() {
    return {
      x: this.offsetX,
      y: this.offsetY,
    };
  }

  clean() {
    this.ctx.clearRect( 0, 0, this.width, this.height );
  }

  /**
   * @param {Font} font 
   */
  setFont( font ) {
    this.ctx.font = `${font.style} ${font.weight} ${font.size} ${font.family}`;
  }

  /**
   * @typedef {Object} WordsSettings
   * @implements {WordSettings}
   * @property {string} colorMetric
   * @property {string} showConnections
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
    const ctx = this.ctx;

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    const rc = event.rect;
    const word = settings.isSyllabified
      ? this.syllabifier.syllabifyWord( event.text, settings.hyphen )
      : event.text;

    var { x, y } = this._offset( rc );
    ctx.fillStyle = settings.background;
    ctx.fillRect( x, y, rc.width, rc.height );

    var { x, y } = this._offset( rc, { dy: 0.8 * rc.height } );
    ctx.fillStyle = settings.wordColor;
    ctx.fillText( word, x, y );
  }

  /**
   * @param {Fixation[]} fixations 
   * @param {GazePathSettings} settings 
   */
  drawFixations( fixations, settings ) {
    let prevFix;

    fixations.forEach( fix => {
      if ( fix.x <= 0 && fix.y <= 0 ) {
        return;
      }

      if ( settings.showSaccades && prevFix ) {
        this._drawSaccade( prevFix, fix, settings );
      }

      if ( settings.showConnections && fix.word ) {
        this._drawConnection( fix, {x: ( fix.word.left + fix.word.right ) / 2, y: fix.word.top}, settings );
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
    const ctx = this.ctx;

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
   * @param {Name} names 
   * @param {NamesSettings} settings 
   */
  checkName( name, settings ) {
    const ctx = this.ctx;

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
    this.offsetX = ( this.width - screenSize.width ) / 2;
    this.offsetY = ( this.height - screenSize.height ) / 2;
  }

  /**
   * 
   * @param {Point | Rect | Fixation} point 
   * @param {{dx: number, dy: number}} [offset={dx: 0, dy: 0}] 
   * @returns {Point}
   */
  _offset( { x, y }, { dx = 0, dy = 0 } = { dx: 0, dy: 0 } ) {
    return { x: x + this.offsetX + dx, y: y + this.offsetY + dy };
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
    const ctx = this.ctx;
    const rc = word.rect;

    var { x, y } = this._offset( rc, { dy: 0.8 * rc.height } );

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = settings.wordColor;
    ctx.fillText( word.text, x, y );

    if ( settings.alpha > 0 ) {
      ctx.fillStyle = Colors.rgb2rgba( WORD_HIGHLIGHT_COLOR, settings.alpha );
      ctx.fillText( word.text, x, y );
    }

    // hide hyphens
    ctx.fillStyle = '#fff';
    let [prefix, suffix] = Syllabifier.getPrefixAndSuffix( word.text, this.settings.syllab.hyphen );
    if ( prefix ) {
      ctx.fillText( prefix, x, y );
    }
    if ( suffix ) {
      var { x, y } = this._offset( rc, { dx: rc.width, dy: 0.8 * rc.height } );
      ctx.textAlign = 'end';
      ctx.fillText( suffix, x, y );
    }

    if ( settings.showConnections || settings.drawWordFrame ) {
      var { x, y } = this._offset( rc );
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
    const ctx = this.ctx;

    ctx.strokeStyle = to.isRegression ? settings.regressionColor : settings.saccadeColor;
    ctx.beginPath();

    // let x = settings.showIDs ? ( from._x ? from._x : from.x ) : from.x;
    var { x, y } = this._offset( from );
    ctx.moveTo( x, y );

    // x = settings.showIDs ? ( to._x ? to._x : to.x ) : to.x;
    var { x, y } = this._offset( to );
    ctx.lineTo( x, y );
    ctx.stroke();
  }

  /**
   * @param {Point} from 
   * @param {Point} to 
   * @param {GazePathSettings} settings 
   */
  _drawConnection( from, to, settings ) {
    const ctx = this.ctx;

    ctx.strokeStyle = settings.connectionColor;
    ctx.beginPath();

    // const x = settings.showIDs ? ( from._x ? from._x : from.x ) : from.x;
    var { x, y } = this._offset( from );
    ctx.moveTo( x, y );
    var { x, y } = this._offset( to );
    ctx.lineTo( x, y );

    ctx.stroke();
  };

  /**
   * @param {Fixation} fixation 
   * @param {GazePathSettings} settings 
   */
  _drawFixation( fixation, settings ) {
    const ctx = this.ctx;

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
