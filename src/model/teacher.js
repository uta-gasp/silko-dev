import Recordable from './commons/recordable.js';

import School from './school.js';
import Student from './student.js';
import Intro from './intro.js';
import Class from './class.js';
import Task from './task.js';

import db from '@/db/db.js';

// ts-check-only 
import { StudentCreateParams, IntroCreateParams } from './commons/createParams.js';

export default class Teacher extends Recordable {

  /**
   * @param {string} [id]
   */
  constructor( id ) {
    super( id );

    /** @type {string} */
    this.name = '';
    /** @type {string} */
    this.email = '';
    /** @type {string} ID */
    this.school = '';
    /** @type {object} {ID: name} */
    this.intros = {};
    /** @type {object} {ID: name} */
    this.classes = {};
  }

  /** @returns {string} */
  static get db() {
    return 'teachers';
  }

  /** @returns {boolean} */
  static get isLogged() {
    return db.user && db.user.isTeacher;
  }

  /** @returns {Teacher} */
  static get instance() {
    return ( db.user && db.user.isTeacher ) ? db.user.ref : null;
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static list( cb ) {
    return db.getAll( Teacher, cb );
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  getSchool( cb ) {
    return db.get( School, this.school, cb );
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  createStudent( /** @type {StudentCreateParams} */ {name = '', email = '', password = '', grade = ''}, cb ) {
    return db.add( Student, {
      name: name,
      email: email,
      password: password,
      grade: grade,
      school: this.school,
      classes: {},
      sessions: {},
      assignments: {},
    }, ( err, id ) => {
      if ( err ) {
        return cb( err );
      }

      db.get( School, this.school, ( err, school ) => {
        if ( err ) {
          return cb( err );
        }

        school.students[ id ] = name;

        db.updateField( school, `students/${id}`, name, errUpdate => {
          err = errUpdate;
        } );

        cb( err, id );
      } );
    } );
  }

  /**
   * @param {string} name 
   * @param {IntroCreateParams} texts 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  createIntro( name, texts, cb ) {
    const introTexts = Intro.validateTexts( texts );

    return db.add( Intro, {
      name: name,
      owner: this.id,
      calibInstruction: introTexts.calibInstruction,
      calibStart: introTexts.calibStart,
      calibSkip: introTexts.calibSkip,
      startInstruction: introTexts.startInstruction,
      startRun: introTexts.startRun,
      startCancel: introTexts.startCancel,
      firstPage: introTexts.firstPage,
      next: introTexts.next,
      finish: introTexts.finish,
      finished: introTexts.finished,
    }, ( err, id ) => {
      if ( err ) {
        return cb( err );
      }

      this.intros[ id ] = name;
      db.updateField( this, `intros/${id}`, name, err => {
        if ( err ) {
          delete this.intros[ id ];
        }

        cb( err );
      } );
    } );
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  getIntros( cb ) {
    return db.getFromIDs( Intro, this.intros, cb );
  }

  /**
   * @param {Intro} intro 
   * @param {Callback} cb 
   */
  deleteIntro( intro, cb ) {
    delete this.intros[ intro.id ];

    db.deleteField( this, `intros/${intro.id}`, cb );

    db.getFromIDs( Class, this.classes, /** @param {Class[]} classes */ ( err, classes ) => {
      if ( err ) {
        return console.error( err );
      }

      classes.forEach( cls => {
        db.getFromIDs( Task, cls.tasks, /** @param {Task[]} tasks */( err, tasks ) => {
          if ( err ) {
            return console.error( err );
          }

          tasks.forEach( task => {
            if ( task.intro === intro.id ) {
              task.intro = '';
              db.updateField( task, 'intro', task.intro, err => {
                if ( err ) {
                  return console.error( err );
                }
              } );
            }
          } );
        } );
      } );
    } );

    db.delete( intro, err => {
      if ( err ) {
        console.error( err );
      }
    } );
  }

  /**
   * @param {string} name 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  createClass( name, cb ) {
    return db.add( Class, {
      name: name,
      owner: this.id,
      tasks: {},
      students: {},
    }, ( err, id ) => {
      if ( err ) {
        return cb( err );
      }

      this.classes[ id ] = name;
      db.updateField( this, `classes/${id}`, name, err => {
        if ( err ) {
          delete this.classes[ id ];
        }

        cb( err );
      } );
    } );
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  getClasses( cb ) {
    return db.getFromIDs( Class, this.classes, cb );
  }

  /**
   * @param {Class} cls 
   * @param {Callback} cb 
   */
  deleteClass( cls, cb ) {
    delete this.classes[ cls.id ];
    db.deleteField( this, `classes/${cls.id}`, cb );

    db.deleteItems( Task, cls.tasks );

    db.getFromIDs( Student, cls.students, /** @param {Student[]} students */ ( err, students ) => {
      if ( err ) {
        return console.error( err );
      }

      students.forEach( student => {
        student.removeClass( cls.id, err => {
          if ( err ) {
            return console.error( err );
          }
        } );
      } );
    } );

    db.delete( cls, err => {
      if ( err ) {
        console.error( err );
      }
    } );
  }

}

Recordable.apply( Teacher );
