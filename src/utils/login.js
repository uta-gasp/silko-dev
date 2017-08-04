import db from '@/db/db.js';

class Login {

    logIn( email, password, cb ) {
        return db.logIn( email, password, cb );
    }

    logOut() {
        return db.logOut();
    }

    get user() {
        return db.user;
    }

}

const login = new Login();
export default login;
