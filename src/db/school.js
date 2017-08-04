import User from './user.js';

class SchoolUser extends User {

    constructor( user, school ) {
        super( user );

        this._ref = school;
    }

    get isSchool() {
        return true;
    }

}

export default SchoolUser;
