// ts-check-only
import ModelStudent from '@/model/student.js';

export default class Student {

  /**
   * @param {ModelStudent} ref 
   */
  constructor( ref ) {
    this.ref = ref;
    this.sessions = []; // [ ./Session ]
  }

};
