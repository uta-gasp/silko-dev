import Recordable from './commons/recordable.js';

import School from './school.js';
import Student from './student.js';
import Intro from './intro.js';
import Class from './class.js';
import Task from './task.js';

import db from '@/db/db.js';

export default class Teacher {
    constructor( id, name, email, school ) {
        this.id = id;
        this.name = name;       // ""
        this.email = email;     // ""
        this.school = school;   // id
        this.intros = [];       // array of ids of Intro
        this.classes = [];      // array of ids of Class
    }

    static get db() {
        return 'teachers';
    }

    static get isLogged() {
        return db.user && db.user.isTeacher;
    }

    static get instance() {
        return (db.user && db.user.isTeacher) ? db.user.ref : null;
    }

    static list( cb ) {
        return db.getAll( Teacher, cb );
    }

    getSchool( cb ) {
        return db.get( School, this.school, cb );
    }

    createStudent( name, email, grade, cb ) {
        db.add( Student, {
            name: name,
            email: email,
            grade: grade,
            school: this.school,
            classes: [],
            sessions: [],
            assignments: {}
        }, (err, id) => {
            if (err) {
                return cb( err );
            }

            db.get( School, this.school, (err, school) => {
                if (err) {
                    return cb( err );
                }

                school.students.push( id );

                db.updateField( school, 'students', school.students, errUpdate => {
                    err = errUpdate;
                });

                cb( err, id );
            });
        });
    }

    createIntro( name, texts, cb ) {
        const introTexts = Intro.validateTexts( texts );

        db.add( Intro, {
            name: name,
            owner: this.id,
            calibInstruction: introTexts.calibInstruction,
            calibStart: introTexts.calibStart,
            calibSkip: introTexts.calibSkip,
            startInstruction: introTexts.startInstruction,
            startRun: introTexts.startRun,
            startCancel: introTexts.startCancel,
            firstPage: introTexts.firstPage,
            next: introTexts.next,
            finish: introTexts.finish,
            finished: introTexts.finished,
        }, (err, id) => {
            if (err) {
                return cb( err );
            }

            this.intros.push( id );
            db.updateField( this, 'intros', this.intros, err => {
                if (err) {
                    this.intros.pop();
                }

                cb( err );
            });
        });
    }

    getIntros( cb ) {
        db.getFromIDs( Intro, this.intros, cb );
    }

    deleteIntro( intro, cb ) {
        this.intros = this.intros.filter( item => item !== intro.id );

        db.updateField( this, 'intros', this.intros, cb );

        db.getFromIDs( Class, this.classes, (err, classes) => {
            if (err) {
                return console.log( err );
            }

            classes.forEach( cls => {
                db.getFromIDs( Task, cls.tasks, (err, tasks) => {
                    if (err) {
                        return console.log( err );
                    }

                    tasks.forEach( task => {
                        if (task.intro === intro.id ) {
                            task.intro = '';
                            db.updateField( task, 'intro', task.intro, err => {
                                if (err) {
                                    return console.log( err );
                                }
                            });
                        }
                    })
                })
            })
        });

        db.delete( intro, err => {
            // ignore the error
        });
    }

    createClass( name, cb ) {
        db.add( Class, {
            name: name,
            owner: this.id,
            tasks: [],
            students: []
        }, (err, id) => {
            if (err) {
                return cb( err );
            }

            this.classes.push( id );
            db.updateField( this, 'classes', this.classes, err => {
                if (err) {
                    this.classes.pop();
                }

                cb( err );
            });
        });
    }

    getClasses( cb ) {
        return db.getFromIDs( Class, this.classes, cb);
    }

    deleteClass( cls, cb ) {
        this.classes = this.classes.filter( item => item !== cls.id );

        db.updateField( this, 'classes', this.classes, cb );

        db.deleteItems( Task, cls.tasks );

        db.getFromIDs( Student, cls.students, (err, students) => {
            if (err) {
                return console.log( err );
            }

            students.forEach( student => {
                student.removeClass( cls.id, err => {
                    if (err) {
                        return console.log( err );
                    }
                });
            });
        });

        db.delete( cls, err => {
            // ignore the error
        });
    }

    getListOfClasses( classes ) {
        return classes.filter( cls => this.classes.includes( cls.id ) );
    }
}

Recordable.apply( Teacher );
