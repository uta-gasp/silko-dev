// ts-check-only
import DataPage from '@/model/data/dataPage';
import DataPageTextWord from '@/model/data/dataPageTextWord';

/**
 * Word
 * @typedef {Object} Word
 * @property {number} id
 * @property {string} text
 */

/**
 * Fixation
 * @typedef {Object} Fixation
 * @property {number} ts
 * @property {number} duration
 * @property {Word} word
 */

const DONE = 'done';

export class ReplayWord {

  /**
   * @param {DataPageTextWord} ref 
   */
  constructor( ref ) {
    /** @type {number} */
    this.id = ref.id;
    /** @type {number} */
    this.totalDuration = 0;
  }

}

export class WordTrack {

  /**
   * @param {HTMLElement} root
   * @param {string} userName 
   * @param {DataPage[]} session 
   * @param {number} id 
   */
  constructor( root, userName, session, id ) {
    /** @type {HTMLElement} */
    this._root = root;
    /** @type {string} */
    this._name = userName;
    /** @type {number} */
    this._id = id;

    /** @type {number} */
    this._pointerSize = 8;
    /** @type {HTMLElement} */
    this._pointer = null;

    /** @type {NodeJS.Timer} */
    this._fixationTimer = null;
    /** @type {number} */
    this._nextTimer = null;

    /** @type {DataPage[]} */
    this._session = session;
    /** @type {Fixation[]} */
    this._fixations = null;
    /** @type {ReplayWord[]} */
    this._words = null;

    /** @type {number} */
    this._fixationIndex = -1;

    /** @type {function} */
    this._onWordFixated = null;
    /** @type {function} */
    this._onCompleted = null;

    this.__next = this._next.bind( this );
  }

  /** @returns {string} */
  get name() {
    return this._name;
  }

  /** @returns {number} */
  get id() {
    return this._id;
  }

  /** @returns {string} */
  get doneMessage() {
    return DONE;
  }

  /** @returns {number} */
  get pointerSize() {
    return this._pointerSize;
  }

  /** @returns {HTMLElement} */
  get pointer() {
    return this._pointer;
  }

  /** @returns {DataPage[]} */
  get session() {
    return this._session;
  }

  /** @returns {ReplayWord[]} */
  get words() {
    return this._words;
  }

  /** @returns {boolean} */
  get hasData() {
    return !!this._fixations;
  }

  /**
   * @param {Fixation[]} fixations 
   * @param {DataPageTextWord[]} words 
   * @param {function} onWordFixated 
   * @param {function} onCompleted 
   */
  start( fixations, words, onWordFixated, onCompleted ) {
    this._onWordFixated = onWordFixated;
    this._onCompleted = onCompleted;

    this._fixations = fixations;
    this._words = words.map( word => new ReplayWord( word ) );

    this._words.forEach( word => {
      word.totalDuration = 0;
    } );

    this._fixationIndex = 0;

    if ( !fixations ) {
      this._doneMessage = 'no data';
      onCompleted( 'no data' );
      return;
    }

    this._pointer = document.createElement( 'div' );
    this._pointer.classList.add( 'pointer' );
    this._pointer.classList.add( 'invisible' );
    this._root.appendChild( this._pointer );

    this._nextTimer = setTimeout( this.__next, 1500 );
  }

  stop() {
    if ( this._nextTimer ) {
      clearTimeout( this._nextTimer );
      this._nextTimer = null;
    }

    if ( this._fixationTimer ) {
      clearTimeout( this._fixationTimer );
      this._fixationTimer = null;
    }

    if ( this._pointer ) {
      this._root.removeChild( this._pointer );
      this._pointer = null;
    }
  }

  /** @returns {boolean} */
  togglePause() {
    if ( !this._pointer ) {
      return false;
    }

    if ( this._nextTimer ) {
      clearTimeout( this._nextTimer );
      this._nextTimer = null;

      return true;
    }
    else {
      this._nextTimer = setTimeout( this.__next, 500 );
      // this._moveFixation( this._currentFixation );

      return false;
    }
  }

  // Private

  _next() {
    const fixation = this._fixations[ this._fixationIndex ];

    this._moveFixation( fixation.word, fixation.duration );

    this._fixationIndex++;
    if ( this._fixationIndex < this._fixations.length ) {
      let pause = this._fixations[ this._fixationIndex ].ts - fixation.ts;
      this._nextTimer = setTimeout( this.__next, pause );
    }
    else {
      this._onCompleted();
      this._root.removeChild( this._pointer );
      this._pointer = null;
      this._nextTimer = null;
    }
  };

  /**
   * @param {Word} word 
   * @param {number} duration 
   */
  _moveFixation( word, duration ) {
    if ( this._fixationTimer ) {
      clearTimeout( this._fixationTimer );
      this._fixationTimer = null;
    }

    if ( word ) {
      this._onWordFixated( word, duration, this._pointer );

      this._pointer.classList.remove( 'invisible' );

      this._fixationTimer = setTimeout( () => {
        this._fixationTimer = null;
        if ( this._pointer ) {
          this._pointer.classList.add( 'invisible' );
        }
      }, duration );
    }
    else {
      this._pointer.classList.add( 'invisible' );
    }
  };

};
