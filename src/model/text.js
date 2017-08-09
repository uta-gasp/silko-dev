import Recordable from './commons/recordable.js';

export default class Text {

  constructor( id, task, student ) {
    this.id = id;
    this.task = task;
    this.student = student;
    this.pages = []; // array of arrays of TextWord
  }

}

Recordable.apply( Text );
