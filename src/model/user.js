import Recordable from './commons/recordable';

export default class User extends Recordable {

  /**
   * @param {any} obj
   * @param {boolean} isAdmin
   */
  constructor( obj, isAdmin ) {
    super( obj ? obj.id : ( isAdmin ? 'admin' : '' ) );

    /** @type {string} */
    this.path = obj ? obj.path : '';
  }

  /** @returns {string} */
  static get db() {
    return 'users';
  }

}
