export default class WordTrack {

  constructor( root, userName, session, id ) {
    this.root = root;
    this.name = userName;
    this.id = id;

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

  start( fixations, words, onWordFixated, onCompleted ) {
    this.onWordFixated = onWordFixated;
    this.onCompleted = onCompleted;

    if ( !fixations ) {
      onCompleted();
      return;
    }

    this.fixations = fixations;
    this.words = words;

    this.words.forEach( word => {
      word.totalDuration = 0;
    } );

    this.fixationIndex = 0;

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

  _next() {
    let fixation = this.fixations[ this.fixationIndex ];

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
