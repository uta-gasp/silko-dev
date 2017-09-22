const functions = require( 'firebase-functions' );
const admin = require( 'firebase-admin' );

admin.initializeApp( functions.config().firebase );

const db = admin.database();

exports.isTaskLocked = functions.https.onRequest((req, res) => {

  if (req.method !== 'GET') {
    res.status(403).send('Forbidden!');
  }

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
