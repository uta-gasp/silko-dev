import { TextPageImage, TextPageImageFixationEvent, TextPageImageDelayEvent, Word } from '@/model/task/textPageImage.js';

export default class ImageController {

  /**
   * @typedef {function(TextPageImage)} ImageEventHandler
   */

  /**
   * @typedef {object} ImageEventHandlers
   * @property {ImageEventHandler} onShow
   * @property {ImageEventHandler} onHide
   */

  /**
   * @param {TextPageImage[]} [images=[]] 
   */
  constructor( /** @type {ImageEventHandlers} */  {
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

    /** @type {Map<TextPageImage, HTMLImageElement>} */
    this._prefetched = new Map();
    /** @type {Map<TextPageImage, number>} */
    this._timers = new Map();

    this._prefetch();

    this._start();
  }

  shutdown() {
    console.log('IMC', 'shutdown');
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
    console.log('IMC', '---');
  }

  /**
   * @param {TextPageImage[]} images 
   */
  setImages( images ) {
    console.log('IMC', 'setImages');
    this.shutdown();

    this._images = images;

    this._start();
    console.log('IMC', '---');
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
        const words = /** @type {[Word]} */ (fixEvent.word ? [ fixEvent.word ] : fixEvent.words);
        const hasWord = words.find( w => word.isEqual( w ) );
        if (hasWord && fixEvent.duration < duration) {
          console.log('IMC', 'fixated "', words.map(v => '-' + v.text + '-').join(' '), '" ---');
          this._show( image );
        }
      }
    } );
  }

  _prefetch() {
    this._images.forEach( image => {
      const el = new Image();
      el.src = image.src;
      el.width = 1;
      el.height = 1;
      el.style.position = 'absolute';
      el.style.left = '0'; 
      el.style.top = '0';
      window.document.body.appendChild(el);

      this._prefetched.set( image, el );
    } );
  }

  _start() {
    console.log('IMC', '_start');
    this._images.forEach( image => {
      if ( image.on.name === TextPageImage.EVENT.none ) {
        this._show( image );
      }
    } );
    console.log('IMC', '---');
  }

  /**
   * @param {TextPageImage} image 
   */
  _show( image ) {
    console.log('IMC', '_show');
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
    console.log('IMC', '---');
  }

  /**
   * @param {TextPageImage} image 
   */
  _hide( image ) {
    console.log('IMC', '_hide');
    this._locations[ image.location ] = null;
    this._onHide( image );
    console.log('IMC', '---');
  }

}
