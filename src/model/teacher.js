import Recordable from './commons/recordable.js';
import School from './school.js';
import Student from './student.js';
import Intro from './intro.js';
import Class from './class.js';
import db from './db.js';

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
        return db.user ? db.user.ref : null;
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
            assignments: []
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

    createIntro( name, text, cb ) {
        db.add( Intro, {
            name: name,
            owner: this.id,
            lines: text.split( '\n' ).map( line => line.trim() )
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
        db.getFromIDs( Class, this.classes, cb);
    }

    deleteClass( cls, cb ) {
        this.classes = this.classes.filter( item => item !== cls.id );

        db.updateField( this, 'classes', this.classes, cb );

        db.delete( cls, err => {
            // ignore the error
        });
    }
}

Recordable.apply( Teacher );
