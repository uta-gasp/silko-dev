import UserBase from './userBase.js';

// ts-check-only
import Admin from '@/model/admin.js';

class AdminUser extends UserBase {

  /**
   * @param {FBUser} user 
   * @param {Admin} admin
   */
  constructor( user, admin ) {
    super( user );

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
