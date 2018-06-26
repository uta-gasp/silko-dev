import Recordable from './commons/recordable';
import db from '@/db/db.js';

export class UserPrefs {
  /**
   * @param {UserPrefs} [source]
   */
  constructor( source ) {
    /** @type {string} */
    this.lang = source ? source.lang : 'en';
  }
}

export class User extends Recordable {

  /**
   * @param {any} obj
   * @param {string} uid
   * @param {boolean} isAdmin
   */
  constructor( obj, uid, isAdmin ) {
    super( obj ? obj.id : ( isAdmin ? 'admin' : '' ) );

    this.uid = uid;

    /** @type {string} */
    this.path = obj ? obj.path : '';

    this.prefs = obj ? obj.prefs : null;
    if (!this.prefs) {
      this.prefs = new UserPrefs();
    }
  }

  /** @returns {string} */
  static get db() {
    return 'users';
  }

  /**
   * @param {Callback} cb 
   */
  update( cb ) {  
    db.update( `/${User.db}/${this.uid}/prefs`, this.prefs, cb );
  }
}
