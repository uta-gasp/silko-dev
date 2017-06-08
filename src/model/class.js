import Recordable from './commons/recordable.js';

import Task from './task.js';
import Student from './student.js';

import db from '@/db/db.js';

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
        task.syllab.exceptions = Task.textToSyllabs( task.syllabExceptions );

        db.add( Task, {
            name: task.name,
            owner: this.owner,
            cls: this.id,
            type: 'text',
            intro: task.intro,
            pages: Task.textToPages( task.text ),
            syllab: task.syllab,
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

    deleteTask( task, cb ) {
        this.tasks = this.tasks.filter( item => item !== task.id );

        db.updateField( this, 'tasks', this.tasks, cb );

        db.getFromIDs( Student, this.students, (err, students) => {
            if (err) {
                return console.log( err );
            }

            students.forEach( student => {
                // student.removeClass( this.id, err => {
                //     if (err) {
                //         return console.log( err );
                //     }
                // });

                if (student.assignments[ this.id ] === task.id) {
                    student.setAssignment( this.id, null, err => {
                        if (err) {
                            return console.log( err );
                        }
                    });
                }
            });
        });

        db.delete( task, err => {
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

                db.getFromIDs( Student, ids, (err, students) => {
                    if (err) {
                        return console.log( err );
                    }

                    students.forEach( student => {
                        student.addClass( this.id, err => {
                            if (err) {
                                return console.log( err );
                            }
                        });
                    });
                })
            }

            cb( err );
        });
    }

    removeStudent( student, cb ) {
        this.students = this.students.filter( item => item !== student.id );

        db.updateField( this, 'students', this.students, cb );

        db.get( Student, student.id, (err, _student) => {
            if (err) {
                return console.log( err );
            }

            student.removeClass( this.id, err => {
                if (err) {
                    return console.log( err );
                }
            });

            student.setAssignment( this.id, null, err => {
                if (err) {
                    return console.log( err );
                }
            });
        })
    }
}

Recordable.apply( Class );
