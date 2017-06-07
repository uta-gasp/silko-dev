import Recordable from './commons/recordable.js';

export default class Session {
    constructor( id, student, cls, task, font, feedbacks, data ) {
        this.id = id;
        this.date = (new Date()).toJSON();
        this.student = student;     // id
        this.cls = cls;             // id
        this.task = task;           // id
        this.font = font;           // Font
        this.feedbacks = feedbacks; // Feedbacks
        this.data = data;           // id
    }

    static get db() {
        return 'sessions';
    }
}

Recordable.apply( Session );
