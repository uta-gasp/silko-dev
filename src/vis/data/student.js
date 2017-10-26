// ts-check-only
import ModelStudent from '@/model/student.js';
import Session from './session.js';

export default class Student {

  /**
   * @param {ModelStudent} ref 
   */
  constructor( ref ) {
    /** @type {ModelStudent} */
    this.ref = ref;
    /** @type {Session[]} */
    this.sessions = [];
  }

};
