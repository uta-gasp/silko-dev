import Recordable from './commons/recordable.js';

import Teacher from './teacher.js';
import Student from './student.js';
import Session from './session.js';
import Data from './data.js';
import Class from './class.js';

import db from '@/db/db.js';

export default class School {

  constructor( id, email, name ) {
    this.id = id;
    this.name = name;   // ""
    this.email = email; // ""
    this.teachers = {}; // list of { id: name } of Teacher
    this.students = {}; // list of { id: name } of Student
  }

  static get db() {
    return 'schools';
  }

  static get isLogged() {
    return db.user && db.user.isSchool;
  }

  static get instance() {
    return ( db.user && db.user.isSchool ) ? db.user.ref : null;
  }

  static list( cb ) {
    return db.getAll( School, cb );
  }

  static get( id, cb ) {
    return db.get( School, id, cb );
  }

  createTeacher( name, email, cb ) {
    db.add( Teacher, {
      name: name,
      email: email,
      school: this.id,
      intros: {},
      classes: {},
    }, ( err, id ) => {
      if ( !err ) {
        this.teachers[ id ] = name;

        db.updateField( this, `teachers/${id}`, name, errUpdate => {
          if ( errUpdate ) {
            delete this.teachers[ id ];
          }
          err = errUpdate;
        } );
      }

      cb( err, id );
    } );
  }

  getTeachers( cb ) {
    return db.getFromIDs( Teacher, this.teachers, ( err, teachers ) => {
      if ( err ) {
        return cb( err );
      }

      cb( null, teachers );
    } );
  }

  createStudent( name, email, grade, cb ) {
    db.add( Student, {
      name: name,
      email: email,
      grade: grade,
      school: this.id,
      classes: {},
      sessions: {},
      assignments: {},
    }, ( err, id ) => {
      if ( !err ) {
        this.students[ id ] = name;

        db.updateField( this, `students/${id}`, name, errUpdate => {
          if ( errUpdate ) {
            delete this.students[ id ];
          }
          err = errUpdate;
        } );
      }

      cb( err, id );
    } );
  }

  getStudents( cb ) {
    return db.getFromIDs( Student, this.students, ( err, students ) => {
      if ( err ) {
        return cb( err );
      }

      cb( null, students );
    } );
  }

  deleteStudent( student, cb ) {
    delete this.students[ student.id ];

    return db.updateField( this, 'students', this.students, err => {
      if ( err ) {
        return cb( err );
      }

      db.updateField( student, 'deleted', true );  // TODO ignore errors?

      if (student.assignments) {
        student.assignments = {};
        db.updateField( student, 'assignments', {} );  // TODO ignore errors?
      }

      if (student.classes) {
        const promises = [];
        Object.keys( student.classes ).map( id => {
          promises.push( Class.get( id, (err, cls) => {
            delete cls.students[ student.id ];
            db.updateField( cls, 'students', cls.students );  // TODO ignore errors?
          } ) );
        } );

        student.classes = {};
        db.updateField( student, 'classes', {} );  // TODO ignore errors?

        Promise.all( promises ).then( () => {
          cb( null );
        } ).catch( err => {
          cb( err );
        });
      }
  } );

    // Removes the student from /students, /users, all student sessions and related session data

    // return db.delete( student, err => {
    //   if ( err ) {
    //     return cb( err );
    //   }

    //   db.deleteUser( student.id );

    //   const sessionPromises = [];
    //   const dataIDs = [];
    //   Object.keys( student.sessions ).forEach( id => {
    //     sessionPromises.push( db.get( Session, id, ( err, session ) => {
    //       if ( !err ) {
    //         dataIDs.push( session.data );
    //       }
    //     } ) );
    //   } );

    //   Promise.all( sessionPromises ).then( () => {
    //     db.deleteItems( Session, student.sessions );

    //     if ( !dataIDs.length ) {
    //       return cb( null );
    //     }

    //     db.deleteItems( Data, dataIDs ).then( () => {
    //       cb( null );
    //     } );
    //   } );
    // } );
  }

}

Recordable.apply( School );
