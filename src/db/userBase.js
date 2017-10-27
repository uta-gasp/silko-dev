// ts-check-only
import Admin from '@/model/admin.js';
import School from '@/model/school.js';
import Teacher from '@/model/teacher.js';
import Student from '@/model/student.js';

export default class UserBase {

  /**
   * @param {FBUser} user 
   */
  constructor( user ) {
    if ( !user ) {
      return;
    }

    /** @type {string} */
    this.name = user.displayName || user.email;
    /** @type {string} */
    this.email = user.email;
    /** @type {Admin | School | Teacher | Student} */
    this._ref = null;
  }

  /** @return {object} - Admin | School | Teacher | Student */
  get ref() {
    return this._ref;
  }

  /** @returns {boolean} */
  get isAdmin() {
    return false;
  }

  /** @returns {boolean} */
  get isSchool() {
    return false;
  }

  /** @returns {boolean} */
  get isTeacher() {
    return false;
  }

  /** @returns {boolean} */
  get isStudent() {
    return false;
  }

}
