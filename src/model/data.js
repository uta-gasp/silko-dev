import Recordable from './commons/recordable.js';

export default class Data {

    constructor( id, task, student, pages, text ) {
        this.id = id;
        this.task = task;
        this.student = student;
        this.pages = pages; // array of DataPage
    }

    static get db() {
        return 'data';
    }

}

Recordable.apply( Data );
