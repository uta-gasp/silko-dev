import Recordable from './commons/recordable.js';
import Class from './class.js';
import Task from './task.js';
import db from './db.js';

export default class Student {
    constructor( id, name, school, grade ) {
        this.id = id;
        this.name = name;
        this.school = school;
        this.grade = grade;
        this.classes = [];
        this.sessions = [];
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

    addClass( cls, cb ) {
        this.classes.push( cls );
        return db.updateField( this, 'classes', this.classes, cb );
    }

    removeClass( cls, cb ) {
        this.classes = this.classes.filter( item => item !== cls );

        this.setAssignment( cls, null, err => {
            if (err) {
                return console.log( err );
            }
        });

        return db.updateField( this, 'classes', this.classes, cb );
    }

    setAssignment( cls, task, cb ) {
        const prevAssignment = this.assignments[ cls ];
        this.assignments[ cls ] = task;

        const onDone = err => {
            if (err) {
                this.assignments[ cls ] = prevAssignment;
                return console.log( 'Stiudent.setAssignment', err );
            }

            cb( err );
        }

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
                        return console.log( 'db.get Class', err );
                    }
                    result.push( { cls, task } );
                }));
            });

            Promise.all( promises ).then( values => {
                cb( undefined, result );
            });
        });
    }

    loadTask( task, cb ) {
        return db.get( Task, task, cb );
    }

    getListOfClasses( classes ) {
        return classes.filter( cls => this.classes.includes( cls.id ) );
    }
}

Recordable.apply( Student );
