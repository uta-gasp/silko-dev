import UserCreator from './user-creator.js';

import eventBus  from '@/utils/event-bus.js';

const config = require( `@/config/db.${process.env.NODE_ENV}.js` ).config;

class DB {
    // Constructor
    constructor() {
        if (!window['firebase']) {
            return window.alert( 'Cannot access Firebase' );
        }

        if (!firebase.apps.length) {
            this._init( firebase.initializeApp( config ) );
        }
        else {  // In HOT-RELOAD db objects still sits in memory, therefore the default database must be released
            firebase.apps[0].delete().then( () => {
                this._init( firebase.initializeApp( config ) );
            }).catch( err => {
                console.log( 'DB', err );
            });
        }
    }

    _init( app ) {
        this.fb = firebase.database( app ).ref();

        this.auth = firebase.auth();
        this._user = null;
        this.ignoreUserSwitch = false;
        this.currentPassword = '';

        // this.r = (new Date()).toString().match(/\s(\d+:\d+:\d+)\s/)[1];

        this.auth.onAuthStateChanged( this._onUserChanged.bind( this ) );
    }

    // Returns current user
    get user() {
        return this._user;
    }

    // Signs in with email and password
    // @param email - email
    // @param password - password
    // @param cb - callback( err, user )
    logIn( email, password, cb ) {
        if (!this.fb) {
            cb( {code: 'conn/database-access', message: 'Not connected to the database' } );
        }

        this.auth.signInWithEmailAndPassword( email, password ).then( user => {
            this.currentPassword = password;
            cb( undefined, user );
        }).catch( err => {
            cb( err );
        });
    }

    // logs the user out
    logOut() {
        if (!this.fb) {
            cb( {code: 'conn/database-access', message: 'Not connected to the database' } );
        }

        this.auth.signOut();
    }

    // Adds a new record
    // @param cls - class
    // @param obj - object to store
    // @param cb - callback( err )
    // @return - id of the created record
    add( cls, obj, cb ) {
        if (cls.validate && !cls.validate( obj )) {
            return cb( `${JSON.stringify( obj )} is not of a class '${cls.name}'` );
        }

        if (obj.email) {
            // 1. create a new user,
            // 2. Send password reset email
            // 3. log in back to the current user
            this.ignoreUserSwitch = true;
            this.auth.createUserWithEmailAndPassword( obj.email, 'gdfvgdfv' ).then( user => {
                //user.sendEmailVerification();

                setTimeout( () => {
                    if (obj.email.indexOf( '@fake.') < 0) {    // TODO: remove this
                        this.auth.sendPasswordResetEmail( obj.email );
                    }
                } , 1000 );

                const ref = this.fb.child( cls.db ).push( obj );

                // add user record
                const userRecord = {};
                userRecord[ user.uid ] = {
                    path: cls.db,
                    id: ref.key
                };
                this.fb.child( 'users' ).update( userRecord );

                cb( undefined, ref.key );
            }).catch( err => {
                cb( err );
            });
        }
        else {
            const ref = this.fb.child( cls.db ).push( obj );
            cb( undefined, ref.key );
        }
    }

    // Update record
    // @param path - db path
    // @param value - value to store
    // @param cb - callback( err )
    // @return - Promose
    update( path, value, cb ) {
        const updates = {};
        updates[ path ] = value;
        return this.fb.update( updates, cb );
    }

    // Update a record
    // @param obj - instance of a class to update
    // @param field - field to update
    // @param value - value to store
    // @param cb - callback( err )
    // @return - Promose
    updateField( obj, field, value, cb ) {
        const updates = {};
        updates[ `/${obj.__proto__.constructor.db}/${obj.id}/${field}` ] = value;
        return this.fb.update( updates, cb );
    }

    // Update a record
    // @param obj - instance of a class to update
    // @param upd - [ { field, value } ]
    // @param cb - callback( err )
    // @return - Promose
    updateFields( obj, upd, cb ) {
        const updates = {};

        if (upd instanceof Array) {
            upd.forEach( item => {
                updates[ `/${obj.__proto__.constructor.db}/${obj.id}/${item.field}` ] = item.value;
            });
        }
        else {
            for (let field in upd) {
                updates[ `/${obj.__proto__.constructor.db}/${obj.id}/${field}` ] = upd[ field ];
            }
        }

        return this.fb.update( updates, cb );
    }

    // Sets a new value for a field
    // @param obj - instance of a class to update
    // @param field - field to update
    // @param value - value to store
    // @param cb - callback( err )
    // @return - Promose
    setField( obj, field, value, cb ) {
        const ref = this.fb.child( `/${obj.__proto__.constructor.db}/${obj.id}` );
        return ref.child( field ).set( value, cb );
    }

    // Gets a record to DB
    // @param cls - class
    // @param id - object id
    // @param cb - callback( err, obj )
    // @return - Promise
    get( cls, id, cb ) {
        const ref = this.fb.child( `${cls.db}/${id}` );
        return ref.once( 'value', snapshot => {
            if (!snapshot.exists()) {
                return cb( `${cls.db}/${id} do not exist` );
            }

            cb( undefined, cls.from( snapshot ) );

        }, err => {
            cb( err );
        });
    }

    // Gets several items from DB
    // @param cls - class
    // @param ids - array of ids
    // @param cb - callback( err, obj )
    // @return - Promise
    getFromIDs( cls, ids, cb ) {
        const results = [];
        const promises = [];
        const errors = [];

        this._toArray( ids ).forEach( id => {
            const ref = this.fb.child( `${cls.db}/${id}` );
            promises.push( ref.once( 'value', snapshot => {
                if (!snapshot.exists()) {
                    return  errors.push( `${cls.db}/${id}` );
                }

                results.push( cls.from( snapshot ) );

            }, err => {
                errors.push( err );
            }));
        });

        return Promise.all( promises ).then( values => {
            cb( errors.join(', '), results );
        });
    }

    // Gets an array of objects
    // @param path - path in DB
    // @param cls - class
    // @param cb - callback( err, obj )
    // @return - Promise
    getFieldAll( path, cls, cb ) {
        const ref = this.fb.child( path ); // `${cls.db}/${id}/${field}`
        return ref.once( 'value', snapshot => {
            const objs = [];

            snapshot.forEach( childSnapshot => {
                objs.push( cls.from( childSnapshot ) );
            });

            cb( undefined, objs );

        }, err => {
            cb( err );
        });
    }

    // Returns all records of the given class
    // @param cls - class
    // @param cb - callback( err, arr ), where arr is an array of the records
    // @return - Promise
    getAll( cls, cb ) {
        const ref = this.fb.child( cls.db );
        return ref.once( 'value', snapshot => {
            if (!snapshot.exists()) {
                return cb( `${cls.db} do not exist` );
            }

            const objs = [];

            snapshot.forEach( childSnapshot => {
                objs.push( cls.from( childSnapshot ) );
            });

            cb( undefined, objs );

        }, err => {
            cb( err );
        });
    }

    deleteItems( cls, ids ) {
        const promises = [];

        this._toArray( ids ).forEach( id => {
            const ref = this.fb.child( `${cls.db}/${id}` );
            promises.push( ref.remove() );
        });

        return Promise.all( promises );
    }

    delete( obj, cb ) {
        const ref = this.fb.child( `${obj.__proto__.constructor.db}/${obj.id}` );
        return ref.remove().then( () => cb() ).catch( err => cb( err ) );
    }

    deleteField( obj, field, cb ) {
        const ref = this.fb.child( `${obj.__proto__.constructor.db}/${obj.id}/${field}` );
        return ref.remove().then( () => cb() ).catch( err => cb( err ) );
    }

    _onUserChanged( user ) {
        if (user) {
            // switch user back if needed
            if (this.ignoreUserSwitch) {
                this.ignoreUserSwitch = false;
                return setTimeout( () => {
                    this.auth.signInWithEmailAndPassword( this.user.email, this.currentPassword ).catch( err => {
                        if (err) {
                            console.dir( 'TODO handle error', err );
                        }
                        this.logOut();
                    });
                }, 100);
            }

            // otherwise get the user record, if it exists
            this.fb.child( `users/${user.uid}` ).once( 'value', snapshot => {
                let userRef = snapshot.val();
                if (!userRef && user.uid === 'd1wjPNPQ0CVOssWFwqSm1r1inC62') {
                    userRef = 'admin';
                }

                UserCreator.create( user, userRef, (err, result) => {
                    if (err) {
                        this.logOut();
                    }

                    this._user = result;
                    eventBus.$emit( 'login' );
                });
            });
        } else if (this._user) {
            this._user = null;
            eventBus.$emit( 'logout' );
        }
    }

    _toArray( obj ) {
        let result;
        if (obj instanceof Array) {
            result = obj;
        }
        else if (typeof obj === 'object') {
            result = [];
            for (let key in obj) {
                result.push( key );
            }
        }
        else if (typeof obj === 'boolean'
              || typeof obj === 'number'
              || typeof obj === 'string') {
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