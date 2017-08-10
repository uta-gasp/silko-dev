export default class Session {

  constructor( ref, student, task, cls ) {
    this.ref = ref;           // model/Session
    this.student = student;   // model/Student
    this.task = task;         // ./Task
    this.cls = cls;           // ./Class
  }

};
