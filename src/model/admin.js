import School from '@/model/school.js';

import db from '@/db/db.js';

// ts-check-only
import Student from '@/model/student.js';
import Teacher from '@/model/teacher.js';

export default class Admin {

  constructor() {
    /** @type {string} */
    this.name = 'Admin';
  }

  /** @return {boolean} */
  static get isLogged() {
    return db.user && db.user.isAdmin;
  }

  /**
   * @param {string} name 
   * @param {string} email 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static createSchool( name, email, cb ) {
    return db.add( School, {
      name: name,
      email: email,
      teachers: {},
      students: {},
    }, ( err, id ) => {
      cb( err, id );
    } );
  }

  /**
   * @param {Student} student 
   * @param {string} newSchoolID 
   * @param {School[]} schools 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static moveStudent( student, newSchoolID, schools, cb ) {
    return Admin.move( student, newSchoolID, schools, 'students', cb );
  }

  /**
   * @param {Teacher} teacher
   * @param {string} newSchoolID 
   * @param {School[]} schools 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static moveTeacher( teacher, newSchoolID, schools, cb ) {
    return Admin.move( teacher, newSchoolID, schools, 'teachers', cb );
  }

  /**
   * @param {Student | Teacher} user
   * @param {string} newSchoolID 
   * @param {School[]} schools 
   * @param {string} list - database path
   * @param {Callback} cb 
   * @returns {Promise}
   */
  static move( user, newSchoolID, schools, list, cb ) {
    const prevSchoolID = user.school;
    user.school = newSchoolID;

    return db.updateField( user, 'school', newSchoolID, err => {
      if ( err ) {
        user.school = prevSchoolID;
        return cb( err );
      }

      const prevSchool = schools.find( school => school.id === prevSchoolID );
      const newSchool = schools.find( school => school.id === newSchoolID );

      delete prevSchool[ list ][ user.id ];
      newSchool[ list ][ user.id ] = user.name;

      db.updateField( newSchool, `${list}/${user.id}`, user.name, err => {
        if ( err ) {
          return cb( err );
        }

        db.deleteField( prevSchool, `${list}/${user.id}`, err => {
          if ( err ) {
            return cb( err );
          }

          cb( null );
        } );
      } );
    } );
  }

};
