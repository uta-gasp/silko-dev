import db from './db.js';

import Admin from '@/model/admin.js';
import School from '@/model/school.js';
import Teacher from '@/model/teacher.js';
import Student from '@/model/student.js';

import AdminUser from './adminUser.js';
import SchoolUser from './schoolUser.js';
import TeacherUser from './teacherUser.js';
import StudentUser from './studentUser.js';

// ts-check-only
import User from '@/model/user.js';

export default class UserCreator {

  /**
   * @param {FBUser} user 
   * @param {User} ref 
   * @param {Callback} cb 
   */
  static create( user, ref, cb ) {
    if ( ref.id === 'admin' ) {
      console.log( 'logged as admin' );
      return cb( null, new AdminUser( user, new Admin() ) );
    }
    else if ( ref && ref.path ) {
      // for each type of user get the corresponding object
      if ( ref.path === School.db ) {
        console.log( 'logged as school' );
        return db.get( School, ref.id, ( err, school ) => {
          if ( !err ) {
            return cb( null, new SchoolUser( user, school ) );
          }
          cb( err );
        } );
      }
      else if ( ref.path === Teacher.db ) {
        console.log( 'logged as teacher' );
        return db.get( Teacher, ref.id, ( err, teacher ) => {
          if ( !err ) {
            return cb( null, new TeacherUser( user, teacher ) );
          }
          cb( err );
        } );
      }
      else if ( ref.path === Student.db ) {
        console.log( 'logged as student' );
        return db.get( Student, ref.id, ( err, student ) => {
          if ( !err ) {
            return cb( null, new StudentUser( user, student ) );
          }
          cb( err );
        } );
      }
    }

    cb( new Error( 'invalid reference' ) );
  }

}
