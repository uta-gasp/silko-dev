import ModelTask from '@/model/task.js';

// ts-check-only
import Session from './session.js';

export default class Task {

  /**
   * @param {string} id 
   * @param {string} name 
   */
  constructor( id, name ) {
    /** @type {string} */
    this.id = id;
    /** @type {string} */
    this.name = name;
    /** @type {Set} ./Student */
    this.students = new Set();
    /** @type {Session[]} */
    this.sessions = [];
    /** @type {boolean} */
    this.hasQuestionnaire = false;

    ModelTask.get( id, ( err, task ) => {
      if ( !err ) {
        this.hasQuestionnaire = task.questionnaire && task.questionnaire.length;
      }
      else {
        console.error( '@/vis/datal/task.js/.ctor model/Task.get', err );
      }
    } );
  }

};
