// exports a propmise resolving to { start(), stop() } object

export default function() {
  return new Promise( resolve => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then( stream => {
        let mediaRecorder = null;
        let audioChunks = [];

        const start = () => {
          if (mediaRecorder) {
            return console.error( 'AudioRecorder', 'cannot start new recorder' );
          }

          mediaRecorder = new MediaRecorder( stream );
          mediaRecorder.addEventListener( 'dataavailable', event => {
            audioChunks.push( event.data );
          });
          mediaRecorder.start();
        };

        const stop = () => {
          return new Promise( resolve => {
            if (!mediaRecorder) {
              return resolve();
            }

            mediaRecorder.addEventListener( 'stop', () => {
              const audioBlob = new Blob( audioChunks );

              resolve( audioBlob );

              mediaRecorder = null;
              audioChunks = [];
            });

            mediaRecorder.stop();
          });
        };

        resolve({ start, stop });
      });
  });
};
