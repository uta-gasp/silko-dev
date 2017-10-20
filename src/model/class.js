import Recordable from './commons/recordable.js';

import Task from './task.js';
import Student from './student.js';

import db from '@/db/db.js';

export default class Class {

  constructor( id, name, owner ) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.tasks = {};        // id: name
    this.students = {};     // id: name
  }

  static get db() {
    return 'classes';
  }

  static list( cb ) {
    return db.getAll( Class, cb );
  }

  static get( id, cb ) {
    return db.get( Class, id, cb );
  }

  createTask( task, type, cb ) {
    task.syllab.exceptions = Task.textToSyllabs( task.syllabExceptions );

    const taskObj = {
      name: task.name,
      owner: this.owner,
      cls: this.id,
      type: type,
      intro: task.intro,
      pages: Task.textToPages( task.text ),
      syllab: task.syllab,
      speech: task.speech,
      questionnaire: task.questionnaire,
    };

    Task.embedImagesIntoPages( taskObj.pages, task.images );

    db.add( Task, taskObj, ( err, id ) => {
      if ( err ) {
        return cb( err );
      }

      this.tasks[ id ] = task.name;
      db.updateField( this, `tasks/${id}`, task.name, err => {
        if ( err ) {
          delete this.tasks[ id ];
        }

        cb( err, id );
      } );
    } );
  }

  getTasks( cb ) {
    db.getFromIDs( Task, this.tasks, cb );
  }

  deleteTask( task, cb ) {
    delete this.tasks[ task.id ];
    db.deleteField( this, `tasks/${task.id}`, cb );

    db.getFromIDs( Student, this.students, ( err, students ) => {
      if ( err ) {
        return console.error( err );
      }

      students.forEach( student => {
        if ( Student.MULTICLASS ) {
          if ( task.id in student.assignments ) {
            student.removeAssignment( task.id, err => {
              if ( err ) {
                return console.error( err );
              }
            } );
          }
        }
        else {
          if ( student.assignments[ this.id ] === task.id ) {
            student.setAssignment( this.id, null, err => {
              if ( err ) {
                return console.error( err );
              }
            } );
          }
        }
      } );
    } );

    db.delete( task, err => {
      console.error( err );
    } );
  }

  getStudents( cb ) {
    db.getFromIDs( Student, this.students, cb );
  }

  addStudents( newStudents, cb ) {
    const joinedStudents = { ...this.students, ...newStudents };

    db.updateField( this, 'students', joinedStudents, err => {
      if ( !err ) {
        this.students = joinedStudents;

        db.getFromIDs( Student, newStudents, ( err, students ) => {
          if ( err ) {
            return console.error( err );
          }

          students.forEach( student => {
            student.addClass( this.id, this.name, err => {
              if ( err ) {
                return console.error( err );
              }
            } );
          } );
        } );
      }

      cb( err );
    } );
  }

  removeStudent( student, cb ) {
    delete this.students[ student.id ];
    db.deleteField( this, `students/${student.id}`, cb );

    db.get( Student, student.id, ( err, _ /* studnet */ ) => {
      if ( err ) {
        return console.error( err );
      }

      student.removeClass( this.id, err => {
        if ( err ) {
          return console.error( err );
        }
      } );

      student.setAssignment( this.id, null, err => {
        if ( err ) {
          return console.error( err );
        }
      } );
    } );
  }

}

Recordable.apply( Class );
