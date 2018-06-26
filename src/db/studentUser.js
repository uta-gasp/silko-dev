import UserBase from './userBase.js';

// ts-check-only
import Student from '@/model/student.js';
import { User } from '@/model/user.js';

export default class StudentUser extends UserBase {

  /**
   * @param {FBUser} user 
   * @param {Student} student
   * @param {User} _user
   */
  constructor( user, student, _user ) {
    super( user, _user );

    this._ref = student;
  }

  /**
   * @override 
   * @returns {boolean} 
   */
  get isStudent() {
    return true;
  }

}
