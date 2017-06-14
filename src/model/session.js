import Recordable from './commons/recordable.js';

export default class Session {
    constructor( id ) {
        this.id = id;
        this.date = (new Date()).toJSON();
        this.student = '';          // id
        this.cls = '';              // id
        this.task = '';             // id
        this.font = null;           // Font
        this.feedbacks = null;      // Feedbacks
        this.screen = null;         // ScreenSize
        this.data = '';             // id
    }

    static get db() {
        return 'sessions';
    }
}

Recordable.apply( Session );
