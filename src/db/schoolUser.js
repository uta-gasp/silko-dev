import UserBase from './userBase.js';

// ts-check-only
import School from '@/model/school.js';

class SchoolUser extends UserBase {

  /**
   * @param {FBUser} user 
   * @param {School} school
   */
  constructor( user, school ) {
    super( user );

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

export default SchoolUser;
