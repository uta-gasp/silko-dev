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

    static get isLogged() {
        return db.user && db.user.isStudent;
    }

    static get instance() {
        return (db.user && db.user.isStudent) ? db.user.ref : null;
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
            if (err) {
                return console.error( err );
            }
        });

        return db.deleteField( this, `classes/${id}`, cb );
    }

    setAssignment( cls, task, cb ) {
        const prevAssignment = this.assignments[ cls ];
        if (!task) {
            delete this.assignments[ cls ];
        }
        else {
            this.assignments[ cls ] = task;
        }

        const onDone = err => {
            if (err) {
                this.assignments[ cls ] = prevAssignment;
                return console.log( 'Stiudent.setAssignment', err );
            }

            cb( err );
        };

        if (task) {
            return db.setField( this, `assignments/${cls}`, task, onDone );
        }
        else {
            return db.deleteField( this, `assignments/${cls}`, onDone );
        }
    }

    loadAssignments( cb ) {
        const taskIDs = [];
        for (let cls in this.assignments) {
            taskIDs.push( this.assignments[ cls ] );
        }

        return db.getFromIDs( Task, taskIDs, (err, tasks) => {
            if (err) {
                return cb( err );
            }

            const result = [];
            const promises = [];
            tasks.forEach( task => {
                promises.push( db.get( Class, task.cls, (err, cls) => {
                    if (err) {
                        return console.log( 'TODO db.get Class', err );
                    }
                    result.push( { cls, task } );
                }));
            });

            Promise.all( promises ).then( values => {
                cb( null, result );
            });
        });
    }

    loadTask( task, cb ) {
        return db.get( Task, task, cb );
    }

    taskDone( task, session, cb ) {
        this.sessions[ session ] = task;
        db.updateField( this, `sessions/${session}`, task, err => {
            if (err) {
                return cb( err );
            }

            // TODO enable this in production and remove the other line
            // this.setAssignment( task, null, cb );
            cb();
        });
    }

    addQuestionnaire( dataKey, questionnaire, cb ) {
        db.update( `/${Data.db}/${dataKey}/questionnaire`, questionnaire, err => {
            if (err) {
                return cb( err );
            }

            cb();
        });
    }

    getSessions( cb ) {
        db.getFromIDs( Session, this.sessions, cb );
    }

    static getData( ids, cb ) {
        db.getFromIDs( Data, ids, cb );
    }

}

Recordable.apply( Student );
