import Recordable from './commons/recordable.js';

export default class Session {
    constructor( id, student, cls, text, font, feedback, data ) {
        this.id = id;
        this.date = (new Date()).toJSON();
        this.student = student;     // id
        this.cls = cls;             // id
        this.text = text;           // id
        this.font = font;           // Font
        this.feedbacks = feedbacks; // Feedbacks
        this.data = data;           // id
    }
}

Recordable.apply( Session );
