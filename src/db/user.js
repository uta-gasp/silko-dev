export default class User {

  constructor( user ) {
    if ( !user ) {
      return;
    }

    this.name = user.displayName || user.email;
    this.email = user.email;
    this._ref = null;
  }

  get ref() {
    return this._ref;
  }

}
