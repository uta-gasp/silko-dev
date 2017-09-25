import Recordable from './commons/recordable.js';

import Class from './class.js';
import Task from './task.js';
import Session from './session.js';
import Data from './data.js';

import db from '@/db/db.js';

export default class Student {

  constructor( id, name, school, grade ) {
    this.id = id;
    this.name = name;
    this.school = school;
    this.grade = grade;
    this.classes = {};
    this.sessions = {};
    this.assignments = {};
  }

  static get db() {
    return 'students';
  }

  static get MULTICLASS() {
    return true;
  }

  static get isLogged() {
    return db.user && db.user.isStudent;
  }

  static get instance() {
    return ( db.user && db.user.isStudent ) ? db.user.ref : null;
  }

  static list( cb ) {
    return db.getAll( Student, cb );
  }

  addClass( id, name, cb ) {
    this.classes[ id ] = name;
    return db.updateField( this, `classes/${id}`, name, cb );
  }

  removeClass( id, cb ) {
    delete this.classes[ id ];

    this.setAssignment( id, null, err => {
      if ( err ) {
        return console.error( err );
      }
    } );

    return db.deleteField( this, `classes/${id}`, cb );
  }

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

  setAssignment( cls, task, cb ) {
    const prevAssignment = this.assignments[ cls ];
    if ( !task ) {
      delete this.assignments[ cls ];
    }
    else {
      this.assignments[ cls ] = task;
    }

    const onDone = err => {
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
    return db.getFromIDs( Task, taskIDs, ( err, tasks ) => {
      if ( err ) {
        return cb( err );
      }

      const result = [];
      const promises = [];
      tasks.forEach( task => {
        promises.push( db.get( Class, task.cls, ( err, cls ) => {
          if ( err ) {
            return console.error( '@/model/student.js/.loadAssignments db.get Class', err ); // TODO is just logging error enough?
          }
          result.push( { cls, task } );
        } ) );
      } );

      Promise.all( promises ).then( values => {
        cb( null, result );
      } );
    } );
  }

  loadSessions( cb ) {
    const sessionIDs = [];
    for ( let id in this.sessions ) {
      sessionIDs.push( id );
    }

    return db.getFromIDs( Session, sessionIDs, ( err, sessions ) => {
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

      Promise.all( promises ).then( values => {
        const arr = [];
        result.forEach( ( obj, session ) => {
          obj.session = session;
          arr.push( obj );
        } );

        cb( null, arr );
      } );
    } );
  }

  loadTask( task, cb ) {
    return db.get( Task, task, cb );
  }

  taskDone( task, session, cb ) {
    this.sessions[ session ] = task;
    db.updateField( this, `sessions/${session}`, task, err => {
      if ( err ) {
        return cb( err );
      }

      // TODO
      // This line is for in production mode
      this.setAssignment( task, null, cb );
      // This line is for in dev mode
      // cb();
    } );
  }

  addQuestionnaire( dataKey, questionnaire, cb ) {
    db.update( `/${Data.db}/${dataKey}/questionnaire`, questionnaire, err => {
      if ( err ) {
        return cb( err );
      }

      cb();
    } );
  }

  getSessions( cb ) {
    db.getFromIDs( Session, this.sessions, cb );
  }

  deleteSession( id, cb ) {
    const session = this.sessions[ id ];
    if ( !session ) {
      return cb( new Error( 'Session does not exist' ) );
    }

    delete this.sessions[ id ];

    db.deleteField( this, `sessions/${id}`, err => {
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

  static getData( ids, cb ) {
    db.getFromIDs( Data, ids, cb );
  }

}

Recordable.apply( Student );
