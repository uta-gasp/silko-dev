import UserBase from './userBase.js';

// ts-check-only
import Teacher from '@/model/teacher.js';

class TeacherUser extends UserBase {

  /**
   * @param {FBUser} user 
   * @param {Teacher} teacher 
   */
  constructor( user, teacher ) {
    super( user );

    this._ref = teacher;
  }

  /**
   * @override 
   * @returns {boolean} 
   */
  get isTeacher() {
    return true;
  }

}

export default TeacherUser;
