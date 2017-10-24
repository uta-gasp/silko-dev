import Syllabifier from '@/task/syllabifier.js';

import Metric from '@/vis/metric.js';
import Colors from '@/vis/colors.js';

/**
 * Point
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 * @property {number} [_x]
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
 * Settings
 * @typedef {Object} Settings
 * @property {boolean} [isSyllabified]
 * @property {string} [colorMetric]
 * @property {number} [alpha]
 * @property {string} [hyphen]
 * @property {string} [background]
 * @property {string} [wordColor]
 * @property {boolean} drawWordFrame
 * @property {{hyphen: string}} [syllab]
 * @property {boolean} [showSaccades]
 * @property {boolean} [showConnections]
 * @property {string} [color]
 * @property {number} [fontSize]
 * @property {string} [fontFamily]
 * @property {Point} [location]
 * @property {number} [nameSpacing]
 * @property {string} [reason]
 * @property {string} [wordRectColor]
 * @property {string} [regressionColor]
 * @property {string} [saccadeColor]
 * @property {string} [connectionColor]
 * @property {boolean} [showIDs]
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
   * @param {Settings} settings 
   */
  constructor( el, settings ) {
    this.width = document.body.offsetWidth;
    this.height = parseInt( window.getComputedStyle( el ).height );
    el.setAttribute( 'width', this.width + '');
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
   * @param {{style: string, weight: string, size: number | string, family: string}} font 
   */
  setFont( font ) {
    this.ctx.font = `${font.style} ${font.weight} ${font.size} ${font.family}`;
  }

  /**
   * @param {Word[]} words 
   * @param {Settings} settings 
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
   * @param {Event[]} events 
   * @param {Settings} settings 
   */
  drawSyllabifications( events, settings ) {
    events.forEach( event => {
      this.drawSyllabification( event, settings );
    } );
  }

  /**
   * 
   * @param {Event} event 
   * @param {Settings} settings 
   */
  drawSyllabification( event, settings ) {
    const ctx = this.ctx;

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';

    const rc = event.rect;
    const word = this.settings.isSyllabified
      ? this.syllabifier.syllabifyWord( event.text, this.settings.hyphen )
      : event.text;

    ctx.fillStyle = settings.background;
    ctx.fillRect( ...this._offset( rc ), rc.width, rc.height );
    ctx.fillStyle = settings.wordColor;
    ctx.fillText( word, ...this._offset( { x: rc.x, y: rc.y + 0.8 * rc.height } ) );
  }

  /**
   * @param {Fixation[]} fixations 
   * @param {Settings} settings 
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
   * @param {Name[]} names 
   * @param {Settings} settings 
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
   * @param {Settings} settings 
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
   * @param {Point} point 
   * @returns {[number, number]}
   */
  _offset( { x, y } ) {
    return [ x + this.offsetX, y + this.offsetY ];
  }

  /**
   * @param {Word} word
   * @param {Settings} settings 
   */
  _drawWord( word, settings ) {
    const ctx = this.ctx;
    const rc = word.rect;

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = settings.wordColor;
    ctx.fillText( word.text, ...this._offset( { x: rc.x, y: rc.y + 0.8 * rc.height } ) );

    if ( settings.alpha > 0 ) {
      ctx.fillStyle = Colors.rgb2rgba( WORD_HIGHLIGHT_COLOR, settings.alpha );
      ctx.fillText( word.text, ...this._offset( { x: rc.x, y: rc.y + 0.8 * rc.height } ) );
    }

    // hide hyphens
    ctx.fillStyle = '#fff';
    let [prefix, suffix] = Syllabifier.getPrefixAndSuffix( word.text, this.settings.syllab.hyphen );
    if ( prefix ) {
      ctx.fillText( prefix, ...this._offset( { x: rc.x, y: rc.y + 0.8 * rc.height } ) );
    }
    if ( suffix ) {
      ctx.textAlign = 'end';
      ctx.fillText( suffix, ...this._offset( { x: rc.x + rc.width, y: rc.y + 0.8 * rc.height } ) );
    }

    if ( settings.showConnections || settings.drawWordFrame ) {
      ctx.strokeStyle = settings.wordRectColor;
      ctx.lineWidth = 1;
      ctx.strokeRect( ...this._offset( rc ), rc.width, rc.height );
    }
  }

  /**
   * @param {Point} from 
   * @param {Point} to 
   * @param {Settings} settings 
   */
  _drawSaccade( from, to, settings ) {
    const ctx = this.ctx;

    ctx.strokeStyle = to.isRegression ? settings.regressionColor : settings.saccadeColor;
    ctx.beginPath();

    let x = settings.showIDs ? ( from._x ? from._x : from.x ) : from.x;
    ctx.moveTo( ...this._offset( { x, y: from.y } ) );

    x = settings.showIDs ? ( to._x ? to._x : to.x ) : to.x;
    ctx.lineTo( ...this._offset( { x, y: to.y } ) );
    ctx.stroke();
  }

  /**
   * @param {Point} from 
   * @param {Point} to 
   * @param {Settings} settings 
   */
  _drawConnection( from, to, settings ) {
    const ctx = this.ctx;

    ctx.strokeStyle = settings.connectionColor;
    ctx.beginPath();

    const x = settings.showIDs ? ( from._x ? from._x : from.x ) : from.x;
    ctx.moveTo( ...this._offset( { x, y: from.y } ) );
    ctx.lineTo( ...this._offset( to ) );
    ctx.stroke();
  };

  /**
   * @param {Fixation} fixation 
   * @param {Settings} settings 
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

    ctx.beginPath();
    ctx.arc( ...this._offset( fixation ), circleSize, 0, 2 * Math.PI );
    ctx.fill();

    if ( fixation.isRegression ) {
      ctx.strokeStyle = settings.regressionColor;
      ctx.stroke();
    }

    if ( fixation.merged ) {
      ctx.strokeStyle = MERGED_FIXATION_BORDER_COLOR;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc( ...this._offset( fixation ), circleSize + 3, 0, 2 * Math.PI );
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

};
