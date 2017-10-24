// ts-check-only
import Session from './session.js';
import ModelData from '@/model/data.js';

export default class Record {

  /**
   * @param {Session} session 
   * @param {ModelData[]} data 
   */
  constructor( session, data ) {
    this.student = session.student;     // model/Student
    this.session = session.ref;         // model/Session
    this.task = session.task;           // ./Task
    this.cls = session.cls;             // ./Class
    this.data = data.find( item => item.id === session.ref.data );  // model/Data
  }

};
