import Recordable from './commons/recordable.js';

import Class from './class.js';
import Task from './task.js';
import Session from './session.js';
import Data from './data.js';

import db from '@/db/db.js';

// ts-check-only
import { Question } from '@/model/session/question';

/**
 * @typedef {Object} QuestionWithAnswer
 * @implements {Question}
 * @property {string} answer
 */

export default class Student extends Recordable {

  /**
   * @param {string} [id]
   */
  constructor( id ) {
    super( id );

    /** @type {string} */
    this.name = '';
    /** @type {string} ID */
    this.school = '';
    /** @type {string} */
    this.grade = '';
    /** @type {object} {ID: name} */
    this.classes = {};
    /** @type {object} {ID: class ID} */
    this.sessions = {};
    /** @type {object} {task ID: class ID} */
    this.assignments = {};
  }

  /** @returns {string} */
  static get db() {
    return 'students';
  }

  /** @returns {boolean} */
  static get MULTICLASS() {
    return true;
  }

  /** @returns {boolean} */
  static get isLogged() {
    return db.user && db.user.isStudent;
  }

  /** @returns {Student} */
  static get instance() {
    return ( db.user && db.user.isStudent ) ? db.user.ref : null;
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static list( cb ) {
    return db.getAll( Student, cb );
  }

  /**
   * @param {string} id 
   * @param {string} name 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  addClass( id, name, cb ) {
    this.classes[ id ] = name;
    return db.updateField( this, `classes/${id}`, name, cb );
  }

  /**
   * @param {string} id 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  removeClass( id, cb ) {
    delete this.classes[ id ];

    this.setAssignment( id, null, err => {
      if ( err ) {
        return console.error( err );
      }
    } );

    return db.deleteField( this, `classes/${id}`, cb );
  }

  /**
   * @param {string} task 
   * @param {string} cls 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  addAssignment( task, cls, cb ) {
    return db.setField( this, `assignments/${task}`, cls, err => {
      if ( err ) {
        console.error( '@/model/student.js/.addAssignment', err );
      }
      else {
        this.assignments[ task ] = cls;
      }

      cb( err );
    } );
  }

  /**
   * @param {string} task 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  removeAssignment( task, cb ) {
    return db.deleteField( this, `assignments/${task}`, err => {
      if ( err ) {
        console.error( '@/model/student.js/.removeAssignment', err );
      }
      else {
        delete this.assignments[ task ];
      }

      cb( err );
    } );
  }

  /**
   * @param {string} cls 
   * @param {string} task 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  setAssignment( cls, task, cb ) {
    const prevAssignment = this.assignments[ cls ];
    if ( !task ) {
      delete this.assignments[ cls ];
    }
    else {
      this.assignments[ cls ] = task;
    }

    const onDone = /** @param {string} err */ err => {
      if ( err ) {
        this.assignments[ cls ] = prevAssignment;
        console.error( '@/model/student.js/.setAssignment', err );
      }

      cb( err );
    };

    if ( task ) {
      return db.setField( this, `assignments/${cls}`, task, onDone );
    }
    else {
      return db.deleteField( this, `assignments/${cls}`, onDone );
    }
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  loadAssignments( cb ) {
    const taskIDs = [];
    if ( Student.MULTICLASS ) {
      for ( let id in this.assignments ) {
        taskIDs.push( id );
      }
    }
    else {
      for ( let cls in this.assignments ) {
        taskIDs.push( this.assignments[ cls ] );
      }
    }

    return db.getFromIDs( Task, taskIDs, /** @param {Task[]} tasks */ ( err, tasks ) => {
      if ( err ) {
        return cb( err );
      }

      /** @type {{cls: Class, task: Task}[]} */
      const result = [];
      /** @type {Promise[]} */
      const promises = [];
      tasks.forEach( task => {
        promises.push( db.get( Class, task.cls, /** @param {Class} cls */ ( err, cls ) => {
          if ( err ) {
            return console.error( '@/model/student.js/.loadAssignments db.get Class', err ); // TODO is just logging error enough?
          }
          result.push( { cls, task } );
        } ) );
      } );

      Promise.all( promises ).then( _ => {
        cb( null, result );
      } );
    } );
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  loadSessions( cb ) {
    const sessionIDs = [];
    for ( let id in this.sessions ) {
      sessionIDs.push( id );
    }

    return db.getFromIDs( Session, sessionIDs, /** @param {Session[]} sessions */ ( err, sessions ) => {
      if ( err ) {
        return cb( err );
      }

      const result = new Map();
      sessions.forEach( session => {
        result.set( session, {
          cls: {},
          task: {},
          session: null,
          data: null,
        } );
      } );

      /** @type {Promise[]} */
      const promises = [];
      sessions.forEach( session => {
        promises.push( db.get( Class, session.cls, ( err, cls ) => {
          if ( err ) {
            return console.error( '@/model/student.js/.loadSessions db.get Class', err ); // TODO is just logging error enough?
          }
          result.get( session ).cls = cls;
        } ) );
        promises.push( db.get( Task, session.task, ( err, task ) => {
          if ( err ) {
            return console.error( '@/model/student.js/.loadSessions db.get Task', err ); // TODO is just logging error enough?
          }
          result.get( session ).task = task;
        } ) );
        promises.push( db.get( Data, session.data, ( err, data ) => {
          if ( err ) {
            return console.error( '@/model/student.js/.loadSessions db.get Data', err ); // TODO is just logging error enough?
          }
          result.get( session ).data = data;
        } ) );
      } );

      Promise.all( promises ).then( _ => {
      /** @type {object[]} */
        const arr = [];
        result.forEach( ( obj, session ) => {
          obj.session = session;
          arr.push( obj );
        } );

        cb( null, arr );
      } );
    } );
  }

  /**
   * @param {string} task 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  loadTask( task, cb ) {
    return db.get( Task, task, cb );
  }

  /**
   * @param {string} task 
   * @param {string} session 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  taskDone( task, session, cb ) {
    this.sessions[ session ] = task;
    return db.updateField( this, `sessions/${session}`, task, err => {
      if ( err ) {
        return cb( err );
      }

      // TODO
      // These lines are for production mode
      if ( Student.MULTICLASS ) {
        this.removeAssignment( task, cb );
      }
      else {
        this.setAssignment( task, null, cb );
      }
      // This line is for dev mode
      // cb();
    } );
  }

  /**
   * @param {string} dataID 
   * @param {QuestionWithAnswer} questionnaire 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  addQuestionnaire( dataID, questionnaire, cb ) {
    return db.update( `/${Data.db}/${dataID}/questionnaire`, questionnaire, err => {
      if ( err ) {
        return cb( err );
      }

      cb();
    } );
  }

  /**
   * @param {Callback} cb 
   * @returns {Promise}
   */
  getSessions( cb ) {
    return db.getFromIDs( Session, this.sessions, cb );
  }

  /**
   * @param {string} id 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  deleteSession( id, cb ) {
    const session = this.sessions[ id ];
    if ( !session ) {
      return cb( new Error( 'Session does not exist' ) );
    }

    delete this.sessions[ id ];

    return db.deleteField( this, `sessions/${id}`, err => {
      if ( err ) {
        return cb( err );
      }

      db.get( Session, id, ( err, session ) => {
        if ( err ) {
          return cb( err );
        }

        const promises = [];
        promises.push( db.deleteItems( Data, [ session.data ] ) );
        promises.push( db.deleteItems( Session, [ id ] ) );

        Promise.all( promises ).then( () => {
          cb( null );
        } );
      } );
    } );
  }

  /**
   * @param {string[]} ids 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static getData( ids, cb ) {
    return db.getFromIDs( Data, ids, cb );
  }

}

Recordable.apply( Student );
