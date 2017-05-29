import Recordable from './commons/recordable.js';

export default class Text {
    constructor( id, task ) {
        this.id = id;
        this.task = task
        this.lines = []; // array of arrays of TextWord
    }
}

Recordable.apply( Text );
