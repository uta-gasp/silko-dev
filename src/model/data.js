import Recordable from './commons/recordable.js';

export default class Data {

  constructor( id ) {
    this.id = id;
    this.task = null;           // id
    this.student = null;        // id
    this.pages = null;          // [ DataPage ]
    this.questionnaire = null;  // [ Question ]
  }

  static get db() {
    return 'data';
  }

}

Recordable.apply( Data );
