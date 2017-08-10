export default class Record {

    constructor( session, data ) {
        this.student = session.student;     // model/Student
        this.session = session.ref;         // model/Session
        this.task = session.task;           // ./Task
        this.cls = session.cls;             // ./Class
        this.data = data.find( item => item.id === session.ref.data );  // model/Data
    }

};
