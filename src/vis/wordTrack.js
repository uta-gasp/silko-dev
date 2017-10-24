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

/**
 * @callback OnWordFixatedCallback
 * @param {SGWMWord} word
 * @param {number} duration
 */

/**
 * @callback OnCompletedCallback
 */

export class ReplayWord {

  /**
   * @param {DataPageTextWord} ref 
   */
  constructor( ref ) {
    this.id = ref.id;
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
    this.root = root;
    this.name = userName;
    this.id = id;

    this.doneMessage = 'done';
    this.pointerSize = 8;
    this.fixationTimer = null;
    this.nextTimer = null;

    this.session = session;
    this.fixations = null;
    this.words = null;

    this.fixationIndex = -1;

    this.onWordFixated = null;
    this.onCompleted = null;
    this.pointer = null;

    this.__next = this._next.bind( this );
  }

  /**
   * @param {Fixation[]} fixations 
   * @param {DataPageTextWord[]} words 
   * @param {function} onWordFixated 
   * @param {function} onCompleted 
   */
  start( fixations, words, onWordFixated, onCompleted ) {
    this.onWordFixated = onWordFixated;
    this.onCompleted = onCompleted;

    this.fixations = fixations;
    this.words = words.map( word => new ReplayWord( word ) );

    this.words.forEach( word => {
      word.totalDuration = 0;
    } );

    this.fixationIndex = 0;

    if ( !fixations ) {
      this.doneMessage = 'no data';
      onCompleted( 'no data' );
      return;
    }

    this.pointer = document.createElement( 'div' );
    this.pointer.classList.add( 'pointer' );
    this.pointer.classList.add( 'invisible' );
    this.root.appendChild( this.pointer );

    this.nextTimer = setTimeout( this.__next, 1500 );
  }

  stop() {
    if ( this.nextTimer ) {
      clearTimeout( this.nextTimer );
      this.nextTimer = null;
    }

    if ( this.fixationTimer ) {
      clearTimeout( this.fixationTimer );
      this.fixationTimer = null;
    }

    if ( this.pointer ) {
      this.root.removeChild( this.pointer );
      this.pointer = null;
    }
  }

  /**
   * @returns {boolean}
   */
  togglePause() {
    if ( !this.pointer ) {
      return false;
    }

    if ( this.nextTimer ) {
      clearTimeout( this.nextTimer );
      this.nextTimer = null;

      return true;
    }
    else {
      this.nextTimer = setTimeout( this.__next, 500 );
      // this._moveFixation( this.currentFixation );

      return false;
    }
  }

  // Private

  _next() {
    const fixation = this.fixations[ this.fixationIndex ];

    this._moveFixation( fixation.word, fixation.duration );

    this.fixationIndex++;
    if ( this.fixationIndex < this.fixations.length ) {
      let pause = this.fixations[ this.fixationIndex ].ts - fixation.ts;
      this.nextTimer = setTimeout( this.__next, pause );
    }
    else {
      this.onCompleted();
      this.root.removeChild( this.pointer );
      this.pointer = null;
      this.nextTimer = null;
    }
  };

  /**
   * 
   * @param {Word} word 
   * @param {number} duration 
   */
  _moveFixation( word, duration ) {
    if ( this.fixationTimer ) {
      clearTimeout( this.fixationTimer );
      this.fixationTimer = null;
    }

    if ( word ) {
      this.onWordFixated( word, duration, this.pointer );

      this.pointer.classList.remove( 'invisible' );

      this.fixationTimer = setTimeout( () => {
        this.fixationTimer = null;
        if ( this.pointer ) {
          this.pointer.classList.add( 'invisible' );
        }
      }, duration );
    }
    else {
      this.pointer.classList.add( 'invisible' );
    }
  };

};
