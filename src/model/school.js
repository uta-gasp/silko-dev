import Recordable from './commons/recordable.js';

import Teacher from './teacher.js';
import Student from './student.js';
import Class from './class.js';

import db from '@/db/db.js';

export default class School {
    constructor( id, email, name ) {
        this.id = id;
        this.name = name;   // ""
        this.email = email; // ""
        this.teachers = []; // array o fids of Teacher
        this.students = []; // array of ids of Student
    }

    static get db() {
        return 'schools';
    }

    static get isLogged() {
        return db.user && db.user.isSchool;
    }

    static get instance() {
        return (db.user && db.user.isSchool) ? db.user.ref : null;
    }

    static list( cb ) {
        return db.getAll( School, cb );
    }

    static get( id, cb ) {
        return db.get( School, id, cb );
    }

    createTeacher( name, email, cb ) {
        db.add( Teacher, {
            name: name,
            email: email,
            school: this.id,
            intros: [],
            classes: []
        }, (err, id) => {
            if (!err) {
                this.teachers.push( id );

                db.updateField( this, 'teachers', this.teachers, errUpdate => {
                    err = errUpdate;
                });
            }

            cb( err, id );
        });
    }

    getTeachers( cb ) {
        return db.getFromIDs( Teacher, this.teachers, (err, teachers) => {
            if (err) {
                return cb( err );
            }

            cb( undefined, teachers );
        });
    }

    getStudents( cb ) {
        return db.getFromIDs( Student, this.students, (err, students) => {
            if (err) {
                return cb( err );
            }

            cb( undefined, students );
        });
    }

    getClasses( cb ) {
        const classes = [];
        return this.getTeachers( (err, teachers) => {
            if (err) {
                return cb( err );
            }

            teachers.forEach( teacher => {
                classes.push( ...teacher.classes );
            });
        }).then( values => {
            return db.getFromIDs( Class, classes, cb);
        });
    }

    createStudent( name, email, grade, cb ) {
        db.add( Student, {
            name: name,
            email: email,
            grade: grade,
            school: this.id,
            classes: [],
            sessions: [],
        }, (err, id) => {
            if (!err) {
                this.students.push( id );

                db.updateField( this, 'students', this.students, errUpdate => {
                    err = errUpdate;
                });
            }

            cb( err, id );
        });
    }

    // passTeachersTo( teachers, school, cb ) {
    //     this.teachers = this.teachers.filter( teacher => {
    //         return teachers.indexOf( teacher ) < 0;
    //     });

    //     let _err;

    //     db.updateField( this, 'teachers', this.teachers, err => {
    //         if (err) {
    //             return _err = err;
    //         }

    //         db.get( School, school, (err, anotherSchool) => {
    //             if (err) {
    //                 return _err = err;
    //             }

    //             const anotherSchoolTeachers = anotherSchool.teachers.concat( teachers );
    //             db.updateField( anotherSchool, 'teachers', anotherSchoolTeachers, err => {
    //                 _err = err;

    //                 teachers.forEach( teacher => {
    //                     db.update( `/${Teacher.db}/${teacher}/school`, school );
    //                 });
    //             });
    //         });
    //     });

    //     cb( _err );
    // }
}

Recordable.apply( School );
