import { TextPageImage, TextPageImageFixationEvent, TextPageImageDelayEvent, Word } from '@/model/task/textPageImage.js';

export default class ImageController {

  /**
   * @typedef {Function} ImageEventHandler
   * @param {TextPageImage} image
   */

  /**
   * @param {{onShow: ImageEventHandler, onHide: ImageEventHandler}} eventHandlers 
   * @param {TextPageImage[]} [images=[]] 
   */
  constructor( {
    onShow = /** @param {TextPageImage} _ */_ => {}, 
    onHide = /** @param {TextPageImage} _ */ _ => {} }, 
    images = []
  ) {
    /** @type {ImageEventHandler} */
    this._onShow = onShow;
    /** @type {ImageEventHandler} */
    this._onHide = onHide;
    /** @type {TextPageImage[]} */
    this._images = images;

    /** @type {object} - list of image locations */
    this._locations = {
      left: null,
      right: null,
      bottom: null,
    };

    /** @type {Map} */
    this._prefetched = new Map();
    /** @type {Map} */
    this._timers = new Map();

    this._prefetch();

    this._start();
  }

  shutdown() {
    this._timers.forEach( ( timer, image ) => {
      window.clearTimeout( timer );
      this._hide( image );
    } );

    for ( let location in this._locations ) {
      const image = this._locations[ location ];
      if ( image ) {
        this._hide( image );
      }
    }

    this._timers.clear();
  }

  /**
   * @param {TextPageImage[]} images 
   */
  setImages( images ) {
    this.shutdown();

    this._images = images;

    this._start();
  }

  /**
   * @param {Word} word 
   * @param {number} duration 
   */
  fixate( word, duration ) {
    if (!word) {
      return;
    }

    this._images.forEach( image => {
      if (this._locations[ image.location ] === image) {
        return;
      }

      if (image.on.name === TextPageImage.EVENT.fixation) {
        const fixEvent = /** @type {TextPageImageFixationEvent} */(image.on);
        const words = fixEvent.words;
        const hasWord = words.find( w => word.isEqual( w ) );
        if (hasWord && fixEvent.duration < duration) {
          this._show( image );
        }
      }
    } );
  }

  _prefetch() {
    this._images.forEach( image => {
      const el = new Image();
      el.src = image.src;

      this._prefetched.set( image, el );
    } );
  }

  _start() {
    this._images.forEach( image => {
      if ( image.on.name === TextPageImage.EVENT.none ) {
        this._show( image );
      }
    } );
  }

  /**
   * @param {TextPageImage} image 
   */
  _show( image ) {
    // handle off = 'image' cases
    for ( let location in this._locations ) {
      const tempImage = this._locations[ location ];
      if ( tempImage && tempImage.off.name === TextPageImage.EVENT.image ) {
        this._hide( tempImage );
      }
    }

    // set timeout if needed
    if ( image.off.name === TextPageImage.EVENT.delay ) {
      const timer = window.setTimeout( () => {
        this._hide( image );
        this._timers.delete( image );
      }, /** @type {TextPageImageDelayEvent} */ (image.off).duration * 1000 );

      this._timers.set( image, timer );
    }

    this._locations[ image.location ] = image;
    this._onShow( image );
  }

  /**
   * @param {TextPageImage} image 
   */
  _hide( image ) {
    this._locations[ image.location ] = null;
    this._onHide( image );
  }

}
