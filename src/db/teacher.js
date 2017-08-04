import User from './user.js';

class TeacherUser extends User {

    constructor( user, teacher ) {
        super( user );

        this._ref = teacher;
    }

    get isTeacher() {
        return true;
    }

}

export default TeacherUser;
