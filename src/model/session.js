import Recordable from './commons/recordable.js';

// ts-check-only
import Font from './session/font.js';
import { Feedbacks } from './session/feedbacks.js';
import ScreenSize from './session/screenSize.js';

export default class Session extends Recordable {

  /**
   * @param {string} [id]
   */
  constructor( id ) {
    super( id );

    /** @type {string} */
    this.date = ( new Date() ).toJSON();
    /** @type {string} ID */
    this.student = '';
    /** @type {string} ID */
    this.cls = '';
    /** @type {string} ID */
    this.task = '';
    /** @type {Font} */
    this.font = null;
    /** @type {Feedbacks} */
    this.feedbacks = null;
    /** @type {ScreenSize} */
    this.screen = null;
    /** @type {string} ID */
    this.data = '';
  }

  /** @returns {string} */
  static get db() {
    return 'sessions';
  }

}

Recordable.apply( Session );
