/**
 * @typedef {Object} ImageCreateParams
 * @property {string} src - URL string
 * @property {number} page - -1 for all pages, <n> for a certain page
 * @property {string} location:-'left', 'right', 'bottom'
 * @property {TextPageImageEvent} on
 * @property {TextPageImageEvent} off
 */

/** @returns {string} */
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
   * @virtual
   * @returns {boolean} 
   */
  get isValid() {
    return true;
  }

  /**
   * @param {TextPageImageEvent} event
   * @returns {boolean}
   */
  static hasParameters( event ) {
    return Object.keys( event ).length > 1;  // has other props other than 'name'
  }

  /** 
   * @param {any} meta
   * @param {string} type
   */
  setMeta( meta, type ) {
    Object.getOwnPropertyNames( this ).forEach( prop => {
      const id = prop === 'name' ? type : `${type}-${prop}`;
      meta[ id ] = /** @type {any} */ (this)[ prop ];
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
   * @override
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
   * @override
   * @returns {boolean} 
   */
  get isValid() {
    return this._isGreaterThanInt( this.duration, 0 );
  }

}

export class TextPageImage {

  /** 
   * @param {ImageCreateParams} param0
   */
  constructor( /** @type {{src: string, page: number, location: string, on: TextPageImageEvent | TextPageImageFixationEvent, off: TextPageImageEvent | TextPageImageDelayEvent}} */ 
    { src, page, location, on, off } ) {
    /** @type {string} */
    this.src = src;
    /** @type {number} */
    this.page = page;
    /** @type {string} */
    this.location = location;
    /** @type {TextPageImageEvent | TextPageImageFixationEvent} */
    this.on = on;
    /** @type {TextPageImageEvent | TextPageImageDelayEvent} */
    this.off = off;

    this.file = null;
  }

  /** @returns {object} - a dictionary of events */
  static get EVENT() {
    return {
      none: 'none',
      fixation: 'fixation',
      image: 'image',
      delay: 'delay',
    };
  }

  /** @returns {object} - a dictionary of meta values */
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

  /** @returns {string} */
  static generatePrefix() {
    const uuid = uuidv4();
    return `${uuid}${FILE_ID_SPLITTER}`;
  }

};
