/**
 * @module TextPageImage
 */

/**
 * @returns {string}
 */
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ( r & 0x3 | 0x8 );
    return v.toString( 16 );
  } );
}

const FILE_ID_SPLITTER = '_';

export class TextPageImageEvent {

  /**
   * @param {string} name 
   */
  constructor( name ) {
    this.name = name;       // string
  }

  /**
   * @returns {boolean}
   */
  get isValid() {
    return true;
  }

  /** 
   * @param {any} meta
   * @param {string} type
   */
  setMeta( meta, type ) {
    Object.getOwnPropertyNames( this ).forEach( prop => {
      const id = prop === 'name' ? type : `${type}-${prop}`;
      meta[ id ] = this[ prop ];
    } );
  }

  /**
   * @param {number | string} value
   * @param {number} threshold
   * @returns {boolean}
   */
  _isGreaterThanInt( value, threshold ) {
    if ( value === '' || value === null || value === undefined ) {
      return false;
    }

    const int = +value;
    if ( Number.isNaN( int ) || !Number.isInteger( int ) ) {
      return false;
    }

    return int > threshold;
  }

}

export class TextPageImageFixationEvent extends TextPageImageEvent {

  /**
   * @param {string} word
   * @param {number} duration
   */
  constructor( word, duration ) {
    super( TextPageImage.EVENT.fixation );

    this.word = word;
    this.duration = duration;
  }

  /** 
   * @returns {boolean} 
   */
  get isValid() {
    return this.word && this._isGreaterThanInt( this.duration, 100 );
  }

}

export class TextPageImageDelayEvent extends TextPageImageEvent {

  /** 
   * @param {number} duration 
   */
  constructor( duration ) {
    super( TextPageImage.EVENT.delay );

    this.duration = duration;
  }

  /** 
   * @returns {boolean} 
   */
  get isValid() {
    return this._isGreaterThanInt( this.duration, 0 );
  }

}

export class TextPageImage {

  /**
   * @param {string} src - URL string
   * @param {number} page - -1 for all pages, <n> for a certain page
   * @param {string} location:-'left', 'right', 'bottom'
   * @param {TextPageImageEvent} on
   * @param {TextPageImageEvent} off
   */
  constructor( { src, page, location, on, off } ) {
    this.src = src;
    this.page = page;
    this.location = location;
    this.on = on;
    this.off = off;
  }

  /** 
   * @returns {object} - a dictionary of events
   */
  static get EVENT() {
    return {
      none: 'none',
      fixation: 'fixation',
      image: 'image',
      delay: 'delay',
    };
  }

  /** 
   * @returns {object} - a dictionary of meta values
   */
  get meta() {
    const result = {
      page: this.page,
      location: this.location,
    };

    this.on.setMeta( result, 'on' );
    this.off.setMeta( result, 'off' );

    return result;
  }

  /**
   * @param {string} source 
   * @returns {string}
   */
  static getNameFromSource( source ) {
    const parts = source.split( FILE_ID_SPLITTER );
    parts.shift();
    return parts.join( FILE_ID_SPLITTER ).split( '?' )[0];
  }

  /**
   * @returns {string}
   */
  static getPrefix() {
    const uuid = uuidv4();
    return `${uuid}${FILE_ID_SPLITTER}`;
  }

};
