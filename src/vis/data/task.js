import DBTask from '@/model/task.js';

export default class Task {

  constructor( id, name ) {
    this.id = id;
    this.name = name;
    this.students = new Set();  // ( ./Student )
    this.sessions = [];         // [ ./Session ]
    this.hasQuestionnaire = false;

    DBTask.get( id, ( err, task ) => {
      if ( !err ) {
        this.hasQuestionnaire = task.questionnaire && task.questionnaire.length;
      }
      else {
        console.log( '@/model/task.js/.ctor DBTask.get', err );
      }
    } );
  }

};
