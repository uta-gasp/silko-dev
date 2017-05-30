import db from '../db.js';
import School from '../school.js';
import Teacher from '../teacher.js';
import Student from '../student.js';

import Admin from './admin.js';
import SchoolUser from './school.js';
import TeacherUser from './teacher.js';
import StudentUser from './student.js';

export default class UserCreator {
    static create( user, ref, cb ) {
        if (ref === 'admin') {
            console.log( 'logged as admin' );
            return cb( undefined, new Admin( user ) );
        }
        else if (ref && ref.path) {
            // for each type of user get the corresponding object
            if (ref.path === School.db) {
                console.log( 'logged as school' );
                return db.get( School, ref.id, (err, school) => {
                    if (!err) {
                        return cb( undefined, new SchoolUser( user, school ) );
                    }
                    cb( err );
                });
            }
            else if (ref.path === Teacher.db) {
                console.log( 'logged as teacher' );
                return db.get( Teacher, ref.id, (err, teacher) => {
                    if (!err) {
                        return cb( undefined, new TeacherUser( user, teacher ) );
                    }
                    cb( err );
                });
            }
            else if (ref.path === Student.db){
                console.log( 'logged as student' );
                return db.get( Student, ref.id, (err, student) => {
                    if (!err) {
                        return cb( undefined, new StudentUser( user, student ) );
                    }
                    cb( err );
                });
            }
        }

        cb( 'UserCreator: Invalid reference' );
    }
}