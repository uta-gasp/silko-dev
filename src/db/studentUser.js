import UserBase from './userBase.js';

// ts-check-only
import Student from '@/model/student.js';

class StudentUser extends UserBase {

  /**
   * @param {FBUser} user 
   * @param {Student} student
   */
  constructor( user, student ) {
    super( user );

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

export default StudentUser;
