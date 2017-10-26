import { TextPageImage } from '@/model/task/textPageImage.js';

// ts-check-only
import DataImage from '@/model/data/image.js';

export default class ImageController {

  /**
   * @typedef {Function} ImageEventHandler
   * @param {DataImage} image
   */
  /**
   * @param {{onShow: ImageEventHandler, onHide: ImageEventHandler}} eventHandlers 
   * @param {DataImage[]} [images=[]] 
   */
  constructor( { onShow, onHide }, images = [] ) {
    /** @type {ImageEventHandler} */
    this._onShow = onShow;
    /** @type {ImageEventHandler} */
    this._onHide = onHide;
    /** @type {DataImage[]} */
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
   * @param {DataImage[]} images 
   */
  setImages( images ) {
    this.shutdown();

    this._images = images;

    this._start();
  }

  /**
   * @param {string} word 
   * @param {number} duration 
   */
  fixate( word, duration ) {
    this._images.forEach( image => {
      if ( image.on.name === TextPageImage.EVENT.fixation &&
          image.on.word === word &&
          image.on.duration < duration &&
          this._locations[ image.location ] !== image ) {
        this._show( image );
      }
    } );
  }

  _prefetch() {
    this._images.forEach( image => {
      const el = new window.Image();
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
   * @param {DataImage} image 
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
      }, image.off.duration * 1000 );

      this._timers.set( image, timer );
    }

    this._locations[ image.location ] = image;
    this._onShow( image );
  }

  /**
   * @param {DataImage} image 
   */
  _hide( image ) {
    this._locations[ image.location ] = null;
    this._onHide( image );
  }

}
