import Recordable from './commons/recordable.js';
import db from './db.js';

export default class Student {
    constructor( id, name, school, grade ) {
        this.id = id;
        this.name = name;
        this.school = school;
        this.grade = grade;
        this.classes = [];
        this.sessions = [];
        this.assignments = [];
    }

    static get db() {
        return 'students';
    }

    static list( cb ) {
        return db.getAll( Student, cb );
    }

    setAssignment( cls, task, cb ) {
        const prevAssignment = this.assignments[ cls ];
        this.assignments[ cls ] = task;
        console.dir( this.assignments );

        db.setField( this, 'assignments', this.assignments, err => {
            if (err) {
                this.assignments[ cls ] = prevAssignment;
            }

            cb( err );
        });
    }
}

Recordable.apply( Student );
