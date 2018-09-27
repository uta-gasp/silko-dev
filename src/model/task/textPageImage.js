import DataImage from '@/model/data/image.js';

/**
 * @typedef {Object} ImageCreateParams
 * @property {string} src - URL string
 * @property {number} page - -1 for all pages, <n> for a certain page
 * @property {string} location:- 'left', 'right', 'bottom'
 * @property {number} offset:- offset from the location in pixels
 * @property {boolean} keepOriginalSize:- the image appears with its  original size  if 'true', and srinked to 15% of vh/vw otherwise
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

export class Word {
  /**
   * @param {string} text 
   * @param {string} id
   */
  constructor( text, id ) {
    this.text = text;
    this.id = id;
  }

  /**
   * @param {Word} ref 
   */
  isEqual( ref ) {
    return this.text === ref.text &&
           (ref.id ? this.id === ref.id : true);
  }
}

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
    /*
    Object.getOwnPropertyNames( this ).forEach( prop => {
      const id = prop === 'name' ? type : `${type}-${prop}`;
      meta[ id ] = (this)[ prop ];
    } );
    */
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
   * @param {Word[]} words
   * @param {number} duration
   */
  constructor( words, duration ) {
    super( TextPageImage.EVENT.fixation );

    this.words = words;
    this.duration = duration;
  }

  /** 
   * @override
   * @returns {boolean} 
   */
  get isValid() {
    return this.words && this.words.length > 0 && this._isGreaterThanInt( this.duration, 100 );
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
   * @type {(args: ImageCreateParams) => void}
   */
  constructor( /** @type {{src: string, page: number, location: string, offset: number, keepOriginalSize: boolean, on: TextPageImageEvent | TextPageImageFixationEvent, off: TextPageImageEvent | TextPageImageDelayEvent}} */ 
    { src, page, location, offset, keepOriginalSize, on, off } ) {
    /** @type {string} */
    this.src = src;
    /** @type {number} */
    this.page = page;
    /** @type {string} */
    this.location = location;
    /** @type {number} */
    this.offset = offset || 0;
    /** @type {boolean} */
    this.keepOriginalSize = !!keepOriginalSize;
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
      offset: this.offset,
      keepOriginalSize: this.keepOriginalSize,
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

  /**
   * @param {DataImage} image
   * @param {{ignoreDisplayCondition: boolean}} options?
   * @returns {TextPageImage}
   */
  static from( image, options ) {
    options = options || { ignoreDisplayCondition: false };

    return new TextPageImage({
      src: image.src, 
      page: -1, 
      location: image.location, 
      offset: image.offset, 
      keepOriginalSize: image.keepOriginalSize,
      on: new TextPageImageEvent( options.ignoreDisplayCondition ? TextPageImage.EVENT.none : image.on ), 
      off: new TextPageImageEvent( image.off )
    });
  }

  /**
   * @param {string} url 
   * @returns {string}
   */
  static nameFromURL( url ) {
    return decodeURIComponent( url ).split( '/' ).pop();
  }

  /**
   * @param {string} name
   * @returns {string}
   */
  static urlFromName( name ) {
    if (name.startsWith('https://')) {
      return name;
    }
    else {
      const path = process.env.IS_DEV_DB ? 
        'https://firebasestorage.googleapis.com/v0/b/eye-school-test.appspot.com/o/image%2F' :
        'https://firebasestorage.googleapis.com/v0/b/uta-gasp-silko.appspot.com/o/image%2F';
      return path + name;
    }
  }
};
