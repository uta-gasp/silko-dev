export default class Task {

  constructor( id, name ) {
    this.id = id;
    this.name = name;
    this.students = new Set();  // ( ./Student )
    this.sessions = [];         // [ ./Session ]
  }

};
