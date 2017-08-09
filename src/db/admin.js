import User from './user.js';

class AdminUser extends User {

  constructor( user, admin ) {
    super( user );

    this._ref = admin;
  }

  get isAdmin() {
    return true;
  }

}

export default AdminUser;
