import School from '@/model/school.js';

import db from '@/db/db.js';

export default class Admin {
    constructor() {
        this.name = 'Admin';
    }

    static get isLogged() {
        return db.user && db.user.isAdmin;
    }

    static createSchool( name, email, cb ) {
        db.add( School, {
            name: name,
            email: email,
            teachers: [],
            students: []
        }, (err, id) => {
            cb( err, id );
        });
    }

    static moveStudent( student, newSchoolID, schools ) {
        Admin.move( student, newSchoolID, schools, 'students' );
    }

    static moveTeacher( teacher, newSchoolID, schools ) {
        Admin.move( teacher, newSchoolID, schools, 'teachers' );
    }

    static move( user, newSchoolID, schools, list ) {
        const prevSchoolID = user.school;
        user.school = newSchoolID;

        db.updateField( user, 'school', newSchoolID, err => {
            if (err) {
                return console.log( err ); // TODO handle error
            }

            const prevSchool = schools.find( school => school.id === prevSchoolID );
            const newSchool = schools.find( school => school.id === newSchoolID );

            prevSchool[ list ] = prevSchool[ list ].filter( id => id !== user.id );
            newSchool[ list ].push( user.id );

            db.updateField( newSchool, list, newSchool[ list ], err => {
                if (err) {
                    return console.log( err ); // TODO handle error
                }

                db.updateField( prevSchool, list, prevSchool[ list ], err => {
                    if (err) {
                        return console.log( err ); // TODO handle error
                    }
                });
            });
        });
    }
};
