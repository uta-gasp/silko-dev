import User from './user.js';

class StudentUser extends User {

  constructor( user, student ) {
    super( user );

    this._ref = student;
  }

  get isStudent() {
    return true;
  }

}

export default StudentUser;
