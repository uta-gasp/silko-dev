import Recordable from './commons/recordable.js';

import Teacher from './teacher.js';
import Student from './student.js';
import Class from './class.js';

import db from '@/db/db.js';

// ts-check-only 
import { StudentCreateParams } from './commons/createParams.js';

export default class School extends Recordable {

  /**
   * @param {string} [id]
   */
  constructor( id ) {
    super( id );

    /** @type {string} */
    this.name = '';
    /** @type {string} */
    this.email = '';
    /** @type {object} {ID: name} */
    this.teachers = {};
    /** @type {object} {ID: name} */
    this.students = {};
  }

  /** @returns {string} */
  static get db() {
    return 'schools';
  }

  /** @returns {boolean} */
  static get isLogged() {
    return db.user && db.user.isSchool;
  }

  /** @returns {School} */
  static get instance() {
    return ( db.user && db.user.isSchool ) ? db.user.ref : null;
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static list( cb ) {
    return db.getAll( School, cb );
  }

  /**
   * @param {string} ID
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static get( id, cb ) {
    return db.get( School, id, cb );
  }

  /**
   * @param {string} name 
   * @param {string} email 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  createTeacher( name, email, cb ) {
    return db.add( Teacher, {
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

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  getTeachers( cb ) {
    return db.getFromIDs( Teacher, this.teachers, ( err, teachers ) => {
      if ( err ) {
        return cb( err );
      }

      cb( null, teachers );
    } );
  }

  /**
   * @param {StudentCreateParams} param0 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  createStudent( {name, email, password, grade}, cb ) {
    return db.add( Student, {
      name: name,
      email: email,
      password: password,
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

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  getStudents( cb ) {
    return db.getFromIDs( Student, this.students, ( err, students ) => {
      if ( err ) {
        return cb( err );
      }

      cb( null, students );
    } );
  }

  /**
   * @param {Student} student
   * @param {Callback} cb 
   * @returns {Promise}
   */
  deleteStudent( student, cb ) {
    delete this.students[ student.id ];

    // TODO is just logging error enough?
    const errorHandler = err => { if ( err ) console.log( '@/model/school.js/.deleteStudent db.updateField', err ); };

    return db.updateField( this, 'students', this.students, err => {
      if ( err ) {
        return cb( err );
      }

      db.updateField( student, 'deleted', true, errorHandler );

      if ( student.assignments ) {
        student.assignments = {};
        db.updateField( student, 'assignments', {}, errorHandler );
      }

      if ( student.classes ) {
        const promises = [];
        Object.keys( student.classes ).map( id => {
          promises.push( Class.get( id, ( err, cls ) => {
            if ( err ) {
              return;
            }

            delete cls.students[ student.id ];
            db.updateField( cls, 'students', cls.students, errorHandler );
          } ) );
        } );

        student.classes = {};
        db.updateField( student, 'classes', {}, errorHandler );

        Promise.all( promises ).then( () => {
          cb( null );
        } ).catch( err => {
          cb( err );
        } );
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
