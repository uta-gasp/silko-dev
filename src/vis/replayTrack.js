import Colors from '@/vis/colors.js';

// ts-check-only
import DataPage from '@/model/data/dataPage';
import FeedbackEvent from '@/model/data/feedbackEvent';
import Fixation from '@/model/data/fixation';

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} Callbacks
 * @property {function} [fixation]
 * @property {function} [completed]
 * @property {function} [syllabification]
 */

let colorIndex = 0;

const FIXATION_GROW_INTERVAL = 100;

export default class ReplayTrack {

  /**
   * @param {HTMLElement} root
   * @param {string} userName 
   * @param {DataPage[]} session 
   * @param {Point} offset 
   */
  constructor( root, userName, session, offset ) {
    /** @type {HTMLElement} */
    this._root = root;
    /** @type {string} */
    this._name = userName;
    /** @type {DataPage[]} */
    this._session = session;
    /** @type {Point} */
    this._offset = offset;
    /** @type {string} */
    this._color = Colors.colors[ colorIndex++ % Colors.colors.length ];

    /** @type {number} */
    this._pointerSize = 8;
    /** @type {number} */
    this._fixationEndTimer = null;
    /** @type {NodeJS.Timer} */
    this._fixationGrowTimer = null;
    /** @type {number} */
    this._nextTimer = null;
    /** @type {NodeJS.Timer} */
    this._syllabTimer = null;

    /** @type {Fixation[]} */
    this._fixations = null;
    /** @type {Fixation} */
    this._currentFixation = null;
    /** @type {number} */
    this._currentDuration = 0;
    /** @type {number} */
    this._fixationIndex = -1;

    /** @type {object} */
    this._callbacks = {};
    /** @type {FeedbackEvent[]} */
    this._syllabifications = null;
    /** @type {number} */
    this._nextSyllabificationIndex = 0;
    /** @type {HTMLElement} */
    this._pointer = null;

    /** @type {number} */
    this._lastPause = 0;

    this.__next = this._next.bind( this );
  }

  /** @return {string} */
  get name() {
    return this._name;
  }

  /** @return {string} */
  get color() {
    return this._color;
  }

  /**
   * @param {number} pageIndex 
   * @param {Callbacks} callbacks 
   */
  start( pageIndex, callbacks ) {
    this._callbacks = callbacks || {};
    this._callbacks.fixation = this._callbacks.fixation || ( () => {} );
    this._callbacks.completed = this._callbacks.completed || ( () => {} );
    this._callbacks.syllabification = this._callbacks.syllabification || ( () => {} );

    this._fixations = this._session[ pageIndex ].fixations;
    if ( !this._fixations ) {
      this._callbacks.completed( 'no data' );
      return;
    }

    this._syllabifications = this._session[ pageIndex ].syllabifications;
    this._nextSyllabificationIndex = this._syllabifications ? 0 : -1;

    this._fixationIndex = 0;

    this._pointer = document.createElement( 'div' );
    this._pointer.classList.add( 'track-pointer' );
    this._pointer.classList.add( 'invisible' );
    this._root.appendChild( this._pointer );

    this._nextTimer = setTimeout( this.__next, 1500 );
  };

  stop() {
    this._stopFixationTimers();

    if ( this._nextTimer ) {
      clearTimeout( this._nextTimer );
      this._nextTimer = null;
    }

    if ( this._pointer ) {
      this._root.removeChild( this._pointer );
      this._pointer = null;
    }
  };

  /** @returns {boolean} - 'true' if paused */
  togglePause() {
    if ( !this._pointer ) {
      return false;
    }

    if ( this._nextTimer ) {
      this._stopFixationTimers();

      clearTimeout( this._nextTimer );
      this._nextTimer = null;

      return true;
    }
    else {
      this._nextTimer = setTimeout( this.__next, this._lastPause );
      this._moveFixation( this._currentFixation );

      return false;
    }
  }

  static resetColors() {
    colorIndex = 0;
  }

  // private

  _stopFixationTimers() {
    if ( this._fixationEndTimer ) {
      clearTimeout( this._fixationEndTimer );
      this._fixationEndTimer = null;
    }

    if ( this._fixationGrowTimer ) {
      clearInterval( this._fixationGrowTimer );
      this._fixationGrowTimer = null;
    }

    if ( this._syllabTimer ) {
      clearTimeout( this._syllabTimer );
      this._syllabTimer = null;
    }
  };

  _next() {
    let fixation = this._fixations[ this._fixationIndex ];

    this._moveFixation( fixation );

    this._fixationIndex++;
    if ( this._fixationIndex < this._fixations.length ) {
      this._lastPause = this._fixations[ this._fixationIndex ].ts - fixation.ts;
      this._nextTimer = setTimeout( this.__next, this._lastPause );
    }
    else {
      this._callbacks.completed();
      this._root.removeChild( this._pointer );
      this._pointer = null;
      this._nextTimer = null;
    }
  };

  /**
   * @param {Fixation} fixation 
   */
  _moveFixation( fixation ) {
    this._stopFixationTimers();

    if ( fixation ) {
      this._checkSyllabification( fixation );

      this._callbacks.fixation( fixation, this._pointer );

      if ( fixation.x > 0 && fixation.y > 0 ) {
        this._currentDuration = 100;
        this._updatePointer();
        this._pointer.classList.remove( 'invisible' );
      }

      this._fixationEndTimer = setTimeout( () => {
        this._stopFixationTimers();
        if ( this._pointer ) {
          this._pointer.classList.add( 'invisible' );
        }
      }, fixation.duration );

      this._fixationGrowTimer = setInterval( () => {
        this._updatePointer();
      }, FIXATION_GROW_INTERVAL );
    }
    else {
      this._pointer.classList.add( 'invisible' );
    }

    this._currentFixation = fixation;
  };

  _updatePointer() {
    if ( !this._currentFixation || !this._pointer ) {
      return;
    }

    const size = Math.round( Math.sqrt( this._currentDuration ) );
    this._pointer.setAttribute( 'style', `
      left: ${this._currentFixation.x + this._offset.x - size / 2}px;
      top: ${this._currentFixation.y + this._offset.y - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: ${size / 2}px;
      background-color: ${this._color};`
    );

    this._currentDuration += FIXATION_GROW_INTERVAL;
  };

  _checkSyllabification( fixation ) {
    if ( this._nextSyllabificationIndex < 0 ) {
      return;
    }

    const syllabification = this._syllabifications[ this._nextSyllabificationIndex ];
    const fixationEndsAt = fixation.tsSync + fixation.duration;
    if ( syllabification.ts < fixationEndsAt ) {
      this._nextSyllabificationIndex++;
      if ( this._nextSyllabificationIndex === this._syllabifications.length ) {
        this._nextSyllabificationIndex = -1;
      }

      this._syllabTimer = setTimeout( () => {
        this._syllabTimer = null;
        this._callbacks.syllabification( syllabification );
      }, ( fixationEndsAt - syllabification.ts ) );
    }
  };

};
