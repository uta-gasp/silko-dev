import Recordable from './commons/recordable.js';
import Task from './task.js';
import Student from './student.js';
import db from './db.js';

export default class Class {
    constructor( id, name, owner ) {
        this.id = id;
        this.name = name;
        this.owner = owner;
        this.tasks = [];
        this.students = [];     // arrays of ids of Student
    }

    static get db() {
        return 'classes';
    }

    createTask( task, type, cb ) {
        db.add( Task, {
            name: task.name,
            owner: this.owner,
            type: 'text',
            intro: task.intro,
            pages: Task.textToPages( task.text ),
            lang: task.lang,
            syllabExceptions: Task.textToSyllabs( task.syllabExceptions ),
            speech: task.speech
        }, (err, id) => {
            if (err) {
                return cb( err );
            }

            this.tasks.push( id );
            db.updateField( this, 'tasks', this.tasks, err => {
                if (err) {
                    this.tasks.pop();
                }

                cb( err, id );
            });
        });
    }

    getTasks( cb ) {
        db.getFromIDs( Task, this.tasks, cb );
    }

    deleteTask( text, cb ) {
        this.tasks = this.tasks.filter( item => item !== text.id );

        db.updateField( this, 'tasks', this.tasks, cb );

        db.delete( text, err => {
            // ignore the error
        });
    }

    getStudents( cb ) {
        db.getFromIDs( Student, this.students, cb );
    }

    addStudents( ids, cb ) {
        const newStudents = this.students.concat( ids );
        db.updateField( this, 'students', newStudents, err => {
            if (!err) {
                this.students = newStudents;
            }

            cb( err );
        });
    }

    removeStudent( student, cb ) {
        this.students = this.students.filter( item => item !== student.id );

        db.updateField( this, 'students', this.students, cb );
    }
}

Recordable.apply( Class );
