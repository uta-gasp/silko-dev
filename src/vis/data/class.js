import Student from '@/vis/data/student.js';
import Session from '@/vis/data/session.js';

import dataUtils from '@/utils/data-utils.js';

// ts-check-only
import ModelClass from '@/model/class.js';
import ModelStudent from '@/model/student.js';
import Task from './task.js';

export default class Class {

  /**
   * @param {ModelClass} ref 
   * @param {Task[]} tasks 
   */
  constructor( ref, tasks ) {
    this.ref = ref;     // model/Class
    this.tasks = tasks; // [ ./Task ]
    this.students = null; // [ ./Student ]
  }

  /**
   * @param {function} cb 
   */
  loadStudents( cb ) {
    this.ref.getStudents( ( err, students ) => {
      this.students = [];
      if ( err ) {
        return cb( err );
      }

      students.sort( dataUtils.byName );

      students.forEach( student => {
        this._loadStudentSessions( student, cb );
      } );
    } );
  }

  /**
   * @param {ModelStudent} student 
   * @param {function} cb 
   */
  _loadStudentSessions( student, cb ) {
    student.getSessions( ( err, sessions ) => {
      if ( err ) {
        return cb( err );
      }

      const _student = new Student( student );

      sessions.forEach( session => {
        const task = this.tasks.find( task => task.id === session.task );
        if ( !task ) {
          return;
        }

        const _session = new Session( session, student, task, this.ref );
        task.sessions.push( _session );
        task.students.add( _student );
        _student.sessions.push( _session );
      } );

      if ( _student.sessions.length ) {
        this.students.push( _student );
      }

      cb();
    } );
  }

};
