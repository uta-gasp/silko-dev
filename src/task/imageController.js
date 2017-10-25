import { TextPageImage } from '@/model/task/textPageImage.js';

// ts-check-only
import DataImage from '@/model/data/image.js';

export default class ImageController {

  /**
   * @param {{onShow: function, onHide: function}} param0 
   * @param {DataImage[]} [images=[]] 
   */
  constructor( { onShow, onHide }, images = [] ) {
    this.onShow = onShow;
    this.onHide = onHide;
    this.images = images;

    this.prefetched = new Map();

    this.locations = {
      left: null,
      right: null,
      bottom: null,
    };

    this.timers = new Map();

    this._prefetch();

    this._start();
  }

  shutdown() {
    this.timers.forEach( ( timer, image ) => {
      window.clearTimeout( timer );
      this._hide( image );
    } );

    for ( let location in this.locations ) {
      const image = this.locations[ location ];
      if ( image ) {
        this._hide( image );
      }
    }

    this.timers.clear();
  }

  /**
   * @param {DataImage[]} images 
   */
  setImages( images ) {
    this.shutdown();

    this.images = images;

    this._start();
  }

  fixate( word, duration ) {
    this.images.forEach( image => {
      if ( image.on.name === TextPageImage.EVENT.fixation &&
          image.on.word === word &&
          image.on.duration < duration &&
          this.locations[ image.location ] !== image ) {
        this._show( image );
      }
    } );
  }

  _prefetch() {
    this.images.forEach( image => {
      const el = new window.Image();
      el.src = image.src;

      this.prefetched.set( image, el );
    } );
  }

  _start() {
    this.images.forEach( image => {
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
    for ( let location in this.locations ) {
      const tempImage = this.locations[ location ];
      if ( tempImage && tempImage.off.name === TextPageImage.EVENT.image ) {
        this._hide( tempImage );
      }
    }

    // set timeout if needed
    if ( image.off.name === TextPageImage.EVENT.delay ) {
      const timer = window.setTimeout( () => {
        this._hide( image );
        this.timers.delete( image );
      }, image.off.duration * 1000 );

      this.timers.set( image, timer );
    }

    this.locations[ image.location ] = image;
    this.onShow( image );
  }

  /**
   * @param {DataImage} image 
   */
  _hide( image ) {
    this.locations[ image.location ] = null;
    this.onHide( image );
  }

}
