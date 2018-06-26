const functions = require( 'firebase-functions' );
const admin = require( 'firebase-admin' );
const cors = require( 'cors' )( { origin: true } );

admin.initializeApp( functions.config().firebase );

const db = admin.database();

exports.isTaskLocked = functions.https.onRequest((req, res) => {

  if (req.method !== 'GET') {
    return cors( req, res, () => { res.status(204).send(''); } );
  }

  cors( req, res, () => {
    const taskID = req.query.id ? req.query.id : '';

    db.ref( '/sessions' ).once( 'value' ).then( snapshot => {
      if (!snapshot.exists()) {
        return res.status(200).send( { result: false } );
      }

      const sessions = snapshot.val();
      let isLocked = false;

      for (let id in sessions) {
          const session = sessions[ id ];
          if (session.task === taskID ) {
            isLocked = true;
            break;
          }
      }

      res.status(200).send( { result: isLocked } );
    });
  });
});

exports.areTasksLocked = functions.https.onRequest((req, res) => {

  if (req.method !== 'GET') {
    return cors( req, res, () => { res.status(204).send(''); } );
  }

  cors( req, res, () => {
    const tasks = (req.query.ids ? req.query.ids : '').split( ',' );

    db.ref( '/sessions' ).once( 'value' ).then( snapshot => {
      if (!snapshot.exists()) {
        return res.status(200).send( { result: [] } );
      }

      const sessions = snapshot.val();

      const usedTasks = new Set();
      for (id in sessions) {
        usedTasks.add( sessions[ id ].task );
      }

      const locked = tasks.filter( task => usedTasks.has( task ));
      res.status(200).send( { result: locked } );
    });
  });
});

exports.deleteTaskSessions = functions.https.onRequest((req, res) => {

  if (req.method !== 'GET') {
    return cors( req, res, () => { res.status(204).send(''); } );
  }

  cors( req, res, () => {
    const taskID = req.query.id ? req.query.id : '';

    db.ref( '/sessions' ).once( 'value' ).then( snapshot => {
      if (!snapshot.exists()) {
        return res.status(200).send( { result: [] } );
      }

      const sessions = snapshot.val();
      const taskSessions = [];
      for (let id in sessions) {
        const session = sessions[ id ];
        if (session.task === taskID ) {
          taskSessions.push( id );
        }
      }

      taskSessions.forEach( id => {
        db.ref( `/sessions/${id}` ).remove();
      });

      res.status(200).send( { result: taskSessions } );
    });
  });
});

exports.deleteStudentTaskSessions = functions.https.onRequest((req, res) => {

  if (req.method !== 'GET') {
    return cors( req, res, () => { res.status(204).send(''); } );
  }

  cors( req, res, () => {
    const taskID = req.query.id ? req.query.id : '';

    db.ref( '/students' ).once( 'value' ).then( snapshot => {
      if (!snapshot.exists()) {
        return res.status(200).send( { result: [] } );
      }

      const students = snapshot.val();
      const toDelete = [];
      for (let studentID in students) {
        const student = students[ studentID ];
        for (let sessionID in student.sessions) {
          if (student.sessions[ sessionID ] === taskID ) {
            toDelete.push( { student: studentID, session: sessionID } );
          }
        }
      }

      toDelete.forEach( item => {
        db.ref( `/students/${item.student}/sessions/${item.session}` ).remove();
      });

      res.status(200).send( { result: toDelete } );
    });
  });
});
