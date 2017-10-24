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
    this.ref = ref;           // model/Session
    this.student = student;   // model/Student
    this.task = task;         // ./Task
    this.cls = cls;           // model/Class
  }

};
