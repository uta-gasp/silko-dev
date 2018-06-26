import UserBase from './userBase.js';

// ts-check-only
import Admin from '@/model/admin.js';
import { User } from '@/model/user.js';

class AdminUser extends UserBase {

  /**
   * @param {FBUser} user 
   * @param {Admin} admin
   * @param {User} _user
   */
  constructor( user, admin, _user ) {
    super( user, _user );

    this._ref = admin;
  }

  /**
   * @override 
   * @returns {boolean} 
   */
  get isAdmin() {
    return true;
  }

}

export default AdminUser;
