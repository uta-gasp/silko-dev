import db from '@/db/db.js';

class Login {

  /**
   * @param {string} email 
   * @param {string} password 
   * @param {function} cb 
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
   * @param {function} cb 
   */
  resetPassword( email, cb ) {
    return db.resetPassword( email, cb );
  }

  /**
   * @returns {string}
   */
  get user() {
    return db.user;
  }

  /**
   * @returns {string}
   */
  get DEFAULT_EMAIL_DOMAIN() {
    return db.FAKE_EMAIL_DOMAIN;
  }

}

const login = new Login();
export default login;
