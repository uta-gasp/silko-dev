// import * as firebase from 'firebase/app';
// import 'firebase/auth';
// import 'firebase/database';

import UserCreator from './user-creator.js';
import { User, UserPrefs } from '@/model/user.js';

import eventBus from '@/utils/event-bus.js';

// ts-check-only
import UserBase from './userBase.js';
import Recordable from '@/model/commons/recordable.js';

/**
 * @typedef {Object} RecordableClass
 * @implements {Function}
 * @property {function(obj: any): boolean} validate
 * @property {function(obj: any): any} from
 */

// TODO remove the first line, uncomment the other
// const config = require( '@/config/db.development.js' ).config;
const configName = process.env.IS_DEV_DB ? 'development' : 'production'; // process.env.NODE_ENV;
const config = require( `@/config/db.${configName}.js` ).config;
console.log( `Connecting to ${config.projectId}` );

const DEFAULT_PASSWORD = 'gdfvgdfv';
const ADMIN_UID = configName === 'development'
  ? 'd1wjPNPQ0CVOssWFwqSm1r1inC62'
  : 'sp4j975g5uWGUozTRhpHKgyaG8m2';  // 'DKhFYCK9Z2RBhJ4whW8ujJm0s6c2'

/**
 * @param {any} obj 
 */
function ctor( obj ) {
  return Object.getPrototypeOf( obj ).constructor;
}

/**
 * @fires connected
 * @fires login - global
 * @fires logout - global
 */
class DB {

  // Constructor
  constructor() {
    this._connected = false;

    /** @type {FirebaseRef} */
    this.fb = null;
    this.storage = null;
    this.auth = null;

    /** @type {UserBase} */
    this._user = null;
    this.ignoreUserSwitch = false;
    this.currentPassword = '';

    if ( !/** @type {any} */(window)['firebase'] ) {
      window.alert( 'Cannot access Firebase' );
      return;
    }

    if ( !firebase.apps.length ) {
      this._init( firebase.initializeApp( config ) );
    }
    else {  // In HOT-RELOAD db objects still sits in memory, therefore the default database must be released
      firebase.apps[0].delete().then( () => {
        this._init( firebase.initializeApp( config ) );
      } ).catch( /** @param {string} err */ err => {
        console.log( '@/db/db.js/.ctor firebase.App.delete', err );
      } );
    }
  }

  /** @returns {string} */
  get FAKE_EMAIL_DOMAIN() {
    return '@fake.com';
  }

  /**
   * @param {any} app 
   */
  _init( app ) {
    this.fb = firebase.database( app ).ref();
    this.storage = firebase.storage().ref();
    this.auth = firebase.auth();

    this.auth.onAuthStateChanged( this._onUserChanged.bind( this ) );
  }

  /** @returns {UserBase} - current user */
  get user() {
    return this._user;
  }

  /** @returns {boolean} */
  get isConnected() {
    return this._connected;
  }

  /**
   * Signs in with email and password
   * @param {string} email 
   * @param {string} password 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  logIn( email, password, cb ) {
    if ( !this.fb ) {
      cb( new Error( 'Not connected to the database' ) );
    }

    if ( email.indexOf( '@' ) < 0 ) {
      email += this.FAKE_EMAIL_DOMAIN;
    }

    return this.auth.signInWithEmailAndPassword( email, password ).then( user => {
      this.currentPassword = password;
      cb( null, user );
    } ).catch( /** @param {string} err */ err => {
      cb( err );
    } );
  }

  // logs the user out
  logOut() {
    if ( !this.auth ) {
      return;
    }

    this.auth.signOut();
  }

  /**
   * @param {string} email 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  resetPassword( email, cb ) {
    return this.auth.sendPasswordResetEmail( email ).then( _ => {
      cb( null );
    } ).catch( /** @param {string} err */ err => {
      cb( err );
    } );
  }

  /**
   * Adds a new record
   * @param {RecordableClass} cls - class
   * @param {any} obj - object to store
   * @param {Callback} cb - id of the created record
   */
  add( cls, obj, cb ) {
    if ( cls.validate && !cls.validate( obj ) ) {
      let objString = JSON.stringify( obj );
      objString = objString.substr( 0, Math.min( objString.length, 50 ) );
      return cb( new Error( `INTERNAL: ${objString}" is not of a class '${cls.name}'` ) );
    }

    if ( obj.email ) {
      // 1. create a new user,
      // 2. Send password reset email
      // 3. log in back to the current user
      this.ignoreUserSwitch = true;

      const password = obj.password || DEFAULT_PASSWORD;
      delete obj.password;

      this.auth.createUserWithEmailAndPassword( obj.email, password ).then( user => {
        // user.sendEmailVerification();

        if ( obj.email.indexOf( '@' ) > 0 && obj.email.indexOf( this.FAKE_EMAIL_DOMAIN ) < 0 ) {
          setTimeout( () => {
            this.auth.sendPasswordResetEmail( obj.email );
          }, 1000 );
        }

        const ref = this.fb.child( cls.db ).push( obj );

        // add user record
        const userRecord = {};
        userRecord[ user.uid ] = {
          path: cls.db,
          id: ref.key,
          prefs: new UserPrefs(),
        };
        this.fb.child( 'users' ).update( userRecord ); // TODO - replace by this.update

        cb( null, ref.key );
      } ).catch( /** @param {string} err */ err => {
        cb( err );
      } );
    }
    else {
      const ref = this.fb.child( cls.db ).push( obj );
      cb( null, ref.key );
    }
  }

  /**
   * Update an object located at a direct path
   * @param {string} path - db path
   * @param {any} value - value to store
   * @param {Callback} cb
   * @return {Promise}
   */
  update( path, value, cb ) {
    const updates = {};
    updates[ path ] = value;
    return this.fb.update( updates, cb );
  }

  /**
   * Update an inner object's field
   * @param {Recordable} obj - instance of a class to update
   * @param {string} field - field to update
   * @param {any} value - value to store
   * @param {Callback} cb 
   * @return {Promise}
   */
  updateField( obj, field, value, cb ) {
    const updates = {};
    updates[ `/${ctor( obj ).db}/${obj.id}/${field}` ] = value;
    return this.fb.update( updates, cb );
  }

  /**
   * 
   * @param {Recordable} obj - instance of a class to update
   * @param {Array | object} upd - [ { field, value } ] | { field, value }
   * @param {Callback} cb 
   * @return {Promise}
   */
  updateFields( obj, upd, cb ) {
    const updates = {};

    if ( upd instanceof Array ) {
      upd.forEach( item => {
        updates[ `/${ctor( obj ).db}/${obj.id}/${item.field}` ] = item.value;
      } );
    }
    else {
      for ( let field in upd ) {
        updates[ `/${ctor( obj ).db}/${obj.id}/${field}` ] = upd[ field ];
      }
    }

    return this.fb.update( updates, cb );
  }

  /**
   * Sets a new value for a field
   * @param {Recordable} obj - instance of a class to update
   * @param {string} field - field to update
   * @param {any} value - value to store
   * @param {Callback} cb 
   * @return {Promise}
   */
  setField( obj, field, value, cb ) {
    const ref = this.fb.child( `/${ctor( obj ).db}/${obj.id}` );
    return ref.child( field ).set( value, cb );
  }

  /**
   * Gets a record from DB
   * @param {RecordableClass} cls 
   * @param {string} id - ID
   * @param {Callback} cb - 'obj' retrieved object
   * @return {Promise}
   */
  get( cls, id, cb ) {
    const ref = this.fb.child( `${cls.db}/${id}` );
    return ref.once( 'value', snapshot => {
      if ( !snapshot.exists() ) {
        return cb( new Error( `INTERNAL: ${cls.db}/${id} do not exist` ) );
      }

      cb( null, cls.from( snapshot ) );
    }, err => {
      cb( err );
    } );
  }

  /**
   * Gets several items from DB
   * @param {RecordableClass} cls 
   * @param {string[]} ids - IDs
   * @param {Callback} cb - 'object[]' retrieved objects
   * @return {Promise}
   */
  getFromIDs( cls, ids, cb ) {
    /** @type {Recordable[]} */
    const results = [];
    /** @type {Promise[]} */
    const promises = [];
    /** @type {string[]} */
    const errors = [];

    this._toArray( ids ).forEach( id => {
      const ref = this.fb.child( `${cls.db}/${id}` );
      promises.push( ref.once( 'value', snapshot => {
        if ( !snapshot.exists() ) {
          errors.push( `${cls.db}/${id}` );
          return;
        }

        results.push( cls.from( snapshot ) );
      }, err => {
        errors.push( err );
      } ) );
    } );

    return Promise.all( promises ).then( _ => {
      cb( errors.join( ', ' ), results );
    } );
  }

  /**
   * Gets an array of objects
   * @param {string} path path in DB
   * @param {RecordableClass} cls 
   * @param {Callback} cb - 'object[]' retrieved objects
   * @return {Promise}
   */
  getFieldAll( path, cls, cb ) {
    const ref = this.fb.child( path ); // `${cls.db}/${id}/${field}`
    return ref.once( 'value', snapshot => {
      /** @type {Recordable[]} */
      const objs = [];

      snapshot.forEach( childSnapshot => {
        objs.push( cls.from( childSnapshot ) );
      } );

      cb( null, objs );
    }, err => {
      cb( err );
    } );
  }

  /**
   * Returns all records of the given class
   * @param {RecordableClass} cls 
   * @param {Callback} cb - 'object[]' retrieved objects
   * @return {Promise}
   */
  getAll( cls, cb ) {
    const ref = this.fb.child( cls.db );
    return ref.once( 'value', snapshot => {
      if ( !snapshot.exists() ) {
        return cb( null, [] );
        // return cb( new Error( `${cls.db} do not exist` ) );
      }

      /** @type {Recordable[]} */
      const objs = [];

      snapshot.forEach( childSnapshot => {
        objs.push( cls.from( childSnapshot ) );
      } );

      cb( null, objs );
    }, err => {
      cb( err );
    } );
  }

  /**
   * Delete multiple records on the given class
   * @param {RecordableClass} cls 
   * @param {string[]} ids 
   * @return {Promise}
   */
  deleteItems( cls, ids ) {
    /** @type {Promise[]} */
    const promises = [];

    this._toArray( ids ).forEach( id => {
      const ref = this.fb.child( `${cls.db}/${id}` );
      promises.push( ref.remove() );
    } );

    return Promise.all( promises );
  }

  /**
   * Delete a given recordable instance
   * @param {Recordable} obj 
   * @param {Callback} cb 
   * @return {Promise}
   */
  delete( obj, cb ) {
    const ref = this.fb.child( `${ctor( obj ).db}/${obj.id}` );
    return ref.remove().then( () => cb() ).catch( /** @param {string} err */ err => cb( err ) );
  }

  /**
   * Delete a field
   * @param {Recordable} obj 
   * @param {string} field 
   * @param {Callback} cb 
   * @return {Promise}
   */
  deleteField( obj, field, cb ) {
    const ref = this.fb.child( `${ctor( obj ).db}/${obj.id}/${field}` );
    return ref.remove().then( () => cb() ).catch( /** @param {string} err */ err => cb( err ) );
  }

  /**
   * Delete user record
   * @param {string} id 
   * @return {Promise}
   */
  deleteUser( id ) {
    const query = this.fb.child( 'users' ).orderByChild( 'id' ).equalTo( id );
    return query.once( 'value', snapshot => {
      if ( snapshot.exists() ) {
        snapshot.forEach( user => {
          user.ref.remove();
        } );
      }
    }, err => {
      console.log( '@/db/db.js/.deleteUser firebase.Query.once', err );  // TODO is just logging error enough?
    } );
  }

  /**
   * @param {File} file 
   * @param {string} prefix 
   * @param {object} meta 
   * @param {function(number): void} progressHandler 
   * @param {Callback} cb 
   * @return {Promise}
   */
  uploadFile( file, prefix, meta, progressHandler, cb ) {
    let folder = 'file';
    if (/image\//.test( file.type )) {
      folder = 'image';
    }
    else if (/audio\//.test( file.type )) {
      folder = 'sound';
    }

    const metadata = meta ? {
      customMetadata: meta,
    } : undefined;

    const uploadTask = this.storage.child( `${folder}/${prefix}${file.name}` ).put( file, metadata );
    uploadTask.on( 'state_changed', /** @param {FirebaseDataSnapshot} snapshot */ snapshot => {
      if ( snapshot.state === firebase.storage.TaskState.PROGRESS && progressHandler ) {
        progressHandler( 100 * ( snapshot.bytesTransferred / snapshot.totalBytes ) );
      }
    }, /** @param {string} err */ err => {
      cb( err );
    }, /** @param {any} _ */ _ => {
      cb( null, uploadTask.snapshot.downloadURL );
    } );

    return uploadTask.then().catch( /** @param {string} err */ err => {
      cb( err ); 
    } );
  }

/**
   * @param {Blob} audio 
   * @param {string} name 
   * @param {function(number): void} progressHandler 
   * @param {Callback} cb 
   * @return {Promise}
   */
  uploadAudio( audio, name, progressHandler, cb ) {
    const uploadTask = this.storage.child( `sound/${name}` ).put( audio );
    uploadTask.on( 'state_changed', /** @param {FirebaseDataSnapshot} snapshot */ snapshot => {
      if ( snapshot.state === firebase.storage.TaskState.PROGRESS && progressHandler ) {
        progressHandler( 100 * ( snapshot.bytesTransferred / snapshot.totalBytes ) );
      }
    }, /** @param {string} err */ err => {
      cb( err );
    }, /** @param {any} _ */ _ => {
      cb( null, uploadTask.snapshot.downloadURL );
    } );

    return uploadTask.then().catch( /** @param {string} err */ err => {
      cb( err );
    } );
  }

  /**
   * @param {string} url 
   * @param {Callback} cb 
   * @return {Promise}
   */
  deleteFile( url, cb ) {
    const pathParts = new window.URL( url ).pathname.split( '/' );
    const filename = pathParts[ pathParts.length - 1 ];
    if ( !filename ) {
      return cb( new Error( 'INTERNAL: invalid url' ) );
    }

    return this.storage
      .child( decodeURIComponent( filename ) )
      .delete()
      .then( /** @param {any} _ */ _ => cb() )
      .catch( /** @param {string} err */ err => cb( err ) );
  }

  /**
   * @param {FBUser} user 
   */
  _onUserChanged( user ) {
    eventBus.$emit( 'connected', { user } );
    this._connected = true;

    if ( user ) {
      // switch user back if needed
      if ( this.ignoreUserSwitch ) {
        this.ignoreUserSwitch = false;
        setTimeout( () => {
          this.auth.signInWithEmailAndPassword( this.user.email, this.currentPassword ).catch( /** @param {string} err */ err => {
            if ( err ) {
              console.log( '@/db/db.js/._onUserChanged firebase.Auth.signInWithEmailAndPassword', err );  // TODO is just logging error enough?
            }
            this.logOut();
          } );
        }, 100 );
        return;
      }

      // otherwise get the user record, if it exists
      this.fb.child( `users/${user.uid}` ).once( 'value', snapshot => {             // TODO - replace by this.get
        const userRef = new User( snapshot.val(), user.uid, user.uid === ADMIN_UID );
        UserCreator.create( user, userRef, /** @param {Error} err; @param {UserBase} result*/ ( err, result ) => {
          if ( err ) {
            this.logOut();
          }

          this._user = result;
          eventBus.$emit( 'login' );
        } );
      } );
    }
    else if ( this._user ) {
      this._user = null;
      eventBus.$emit( 'logout' );
    }
  }

  /**
   * @param {any} obj 
   * @returns {Array}
   */
  _toArray( obj ) {
    let result;
    if ( obj instanceof Array ) {
      result = obj;
    }
    else if ( typeof obj === 'object' ) {
      result = [];
      for ( let key in obj ) {
        result.push( key );
      }
    }
    else if ( typeof obj === 'boolean' ||
                 typeof obj === 'number' ||
                 typeof obj === 'string' ) {
      result = [ obj ];
    }
    else {
      result = [];
    }

    return result;
  }

}

const db = new DB();
export default db;
