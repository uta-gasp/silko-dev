// ts-check-only
import Session from './session.js';
import Task from './task.js';
import ModelClass from '@/model/class.js';
import ModelData from '@/model/data.js';
import ModelStudent from '@/model/student.js';
import ModelSession from '@/model/session.js';

export default class Record {

  /**
   * @param {Session} session 
   * @param {ModelData[]} data 
   */
  constructor( session, data ) {
    /** @type {ModelStudent} */
    this.student = session.student;
    /** @type {ModelSession} */
    this.session = session.ref;
    /** @type {Task} */
    this.task = session.task;
    /** @type {ModelClass} */
    this.cls = session.cls;
    /** @type {ModelData} */
    this.data = data.find( item => item.id === session.ref.data );
  }

};
