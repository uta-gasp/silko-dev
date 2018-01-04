import UserBase from './userBase.js';

// ts-check-only
import Teacher from '@/model/teacher.js';
import { User } from '@/model/user.js';

export default class TeacherUser extends UserBase {

  /**
   * @param {FBUser} user 
   * @param {Teacher} teacher 
   * @param {User} _user
   */
  constructor( user, teacher, _user ) {
    super( user, _user );

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
