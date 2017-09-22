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
      const sessions = snapshot.val();
      let isLocked = false;
      for (let id in sessions) {
          const session = sessions[ id ];
          if (session.task === taskID ) {
            isLocked = true
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
