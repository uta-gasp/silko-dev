// ts-check-only
import ModelSession from '@/model/session.js';
import ModelStudent from '@/model/student.js';
import ModelClass from '@/model/class.js';
import Task from './task.js';

export default class Session {

  /**
   * @param {ModelSession} ref 
   * @param {ModelStudent} student 
   * @param {Task} task 
   * @param {ModelClass} cls 
   */
  constructor( ref, student, task, cls ) {
    /** @type {ModelSession} */
    this.ref = ref;
    /** @type {ModelStudent} */
    this.student = student;
    /** @type {Task} */
    this.task = task;
    /** @type {ModelClass} */
    this.cls = cls;
  }

};
