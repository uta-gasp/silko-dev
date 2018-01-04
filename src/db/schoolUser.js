import UserBase from './userBase.js';

// ts-check-only
import School from '@/model/school.js';
import { User } from '@/model/user.js';

export default class SchoolUser extends UserBase {

  /**
   * @param {FBUser} user 
   * @param {School} school
   * @param {User} _user
   */
  constructor( user, school, _user ) {
    super( user, _user );

    this._ref = school;
  }

  /**
   * @override 
   * @returns {boolean} 
   */
  get isSchool() {
    return true;
  }

}
