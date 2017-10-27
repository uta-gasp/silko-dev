import Recordable from './commons/recordable.js';

// ts-check-only
import DataPage from './data/dataPage.js';
import Question from './session/question.js';

export default class Data extends Recordable {

  /**
   * @param {string} [id]
   */
  constructor( id ) {
    super( id );

    /** @type {string} ID */
    this.task = null;
    /** @type {string} ID */
    this.student = null;
    /** @type {DataPage[]} */
    this.pages = null;
    /** @type {Question[]} */
    this.questionnaire = null;
  }

  /** @returns {string} */
  static get db() {
    return 'data';
  }

}

Recordable.apply( Data );
