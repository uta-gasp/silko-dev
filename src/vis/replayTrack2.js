// ts-check-only
import DataPage from '@/model/data/dataPage';
import FeedbackEvent from '@/model/data/feedbackEvent';
import Fixation from '@/model/data/fixation';

/**
 * @typedef {Object} Point
 * @property {number} x
 * @property {number} y
 */

export default class ReplayTrack {

  /**
   * @param {HTMLElement} root
   * @param {DataPage[]} session 
   * @param {Point} offset 
   */
  constructor( root, session, offset ) {
    /** @type {HTMLElement} */
    this._root = root;
    /** @type {DataPage[]} */
    this._session = session;
    /** @type {Point} */
    this._offset = offset;

    /** @type {Fixation[]} */
    this._fixations = null;
    /** @type {number} */
    this._fixationIndex = -1;
    /** @type {number} */
    this._lastTimestamp = -1;

    this._pointer = document.createElement( 'div' );
    this._pointer.classList.add( 'track-pointer' );
    this._pointer.classList.add( 'invisible' );
    this._root.appendChild( this._pointer );
  }

  /**
   * @param {number} pageIndex 
   */
  setPage( pageIndex ) {
    this._fixationIndex = -1;
    this._fixations = this._session[ pageIndex ].fixations;
    if ( !this._fixations ) {
      return;
    }
  }

  cleanup() {
    if ( this._pointer ) {
      this._root.removeChild( this._pointer );
      this._pointer = null;
    }
  }

  /**
   * @param {number} time ms
   */
  setTime( time ) {
    if (!this._fixations) {
      console.log('fix', '!fixs');
      return;
    }

    let fixation = null;
    let fixationIndex = -1;
    /*
    const direction = time > this._lastTimestamp ? 1 : -1;
    const from = Math.max( 0, this._fixationIndex );

    for (let i = from; i >= 0 && i < this._fixations.length; i += direction ) {
    */
   for (let i = 0; i < this._fixations.length; i += 1) {
    const fix = this._fixations[i];
      if (fix.tsSync <= time && time <= (fix.tsSync + fix.duration)) {
        fixation = fix;
        fixationIndex = i;
        this._lastTimestamp = time;
        break;
      }
    }
   
    const isNew = fixationIndex != this._fixationIndex;
    if (isNew) {
      this._fixationIndex = fixationIndex;
      this._updatePointer( fixation );
    }
  }

  /**
   * @returns {Fixation}
   */
  get fixation() {
    return this._fixationIndex < 0 ? null : this._fixations[ this._fixationIndex ];
  }

  /**
   * @returns {HTMLElement}
   */
  get pointer() {
    return this._pointer;
  }

  // private

  /**
   * @param {Fixation} fixation
   */
  _updatePointer( fixation ) {
    if (!this._pointer) {
      return;
    }

    const isFixationHidden = !fixation;
    const isFixationShown = fixation;
    const isFixationValid = fixation && fixation.x > 0 && fixation.y > 0;

    if ( isFixationHidden || !isFixationValid ) {
      this._pointer.classList.add( 'invisible' );
    }

    if ( isFixationValid ) {
      const size = Math.round( Math.sqrt( fixation.duration ) );
      this._pointer.setAttribute( 'style', `
        left: ${fixation.x + this._offset.x - size / 2}px;
        top: ${fixation.y + this._offset.y - size / 2}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: ${size / 2}px;
        background-color: #289AE5;
      `);
      this._pointer.classList.remove( 'invisible' );
    }
  };
};
