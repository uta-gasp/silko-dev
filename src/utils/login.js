import db from '@/db/db.js';

// ts-check-only
import UserBase from '@/db/userBase';

class Login {

  /**
   * @param {string} email 
   * @param {string} password 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  logIn( email, password, cb ) {
    return db.logIn( email, password, cb );
  }

  logOut() {
    db.logOut();
  }

  /**
   * @param {string} email 
   * @param {Callback} cb 
   */
  resetPassword( email, cb ) {
    return db.resetPassword( email, cb );
  }

  /** @returns {UserBase} */
  get user() {
    return db.user;
  }

  /** @returns {string} */
  get DEFAULT_EMAIL_DOMAIN() {
    return db.FAKE_EMAIL_DOMAIN;
  }

}

const login = new Login();
export default login;
