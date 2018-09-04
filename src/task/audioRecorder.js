// exports a propmise resolving to { start(), stop() } object

/**
 * @returns {Promise}
 */
export default function() {
  /*
  return new Promise( resolve => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then( stream => {
        let audioChunks = [];

        let audioCtx = new AudioContext();

        let source = audioCtx.createMediaStreamSource( stream );
        source.connect( audioCtx.destination );
        source.addEventListener( 'audioprocess', e => {
          console.dir( e.inputBuffer );
          audioChunks.push( e.inputBuffer );
        });
        source.addEventListener( 'ended', e => {
          console.dir( 'ended', e );
        });
        source.addEventListener( 'complete', e => {
          console.dir( 'complete', e );
        });
        source.addEventListener( 'message', e => {
          console.dir( 'message', e );
        });

        const start = cb => {
          audioChunks = [];
          console.log( 'start', 'time', audioCtx.currentTime);
          cb();
        };

        const stop = () => {
          console.log( 'stop', 'time', audioCtx.currentTime);
          return new Promise( resolve => {
            const audioBlob = new Blob( audioChunks );
            resolve( audioBlob );
          });
        };

        resolve({ start, stop });
      });
  });
  */

  /*
  if (window.WebAudioRecorder) {
    console.log('WebAudioRecorder enabled');

    /** @type {MediaElementAudioSourceNode} *
    let audioIn = null;

    const audioContext = new AudioContext();
    const mixer = audioContext.createGain();
    const audioInLevel = audioContext.createGain();
    audioInLevel.gain.value = 0.5;
    audioInLevel.connect( mixer );

    mixer.connect( audioContext.destination );

    const audioRecorder = new WebAudioRecorder( mixer, {
      timeLimit: 600,
      workerDir: '/static/',
    });

    audioRecorder.setEncoding( 'mp3' );
    audioRecorder.setOptions({
      encodeAfterRecord: false,
      mp3: {
        bitRate: 160,
      },
    });

    audioRecorder.onError = function(recorder, message) {
      console.error('WebAudioRecorder', message);
    };

    return new Promise( resolve => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then( stream => {
          if (audioIn != null) {
            audioIn.disconnect();
          }

          audioIn = audioContext.createMediaStreamSource( stream );
          audioIn.connect( audioInLevel );

          const start = () => {
            console.log('WebAudioRecorder', 'started');
            audioRecorder.startRecording();
          };
  
          const stop = () => {
            console.log('WebAudioRecorder', 'stopping');
            return new Promise( resolve => {
              console.log('WebAudioRecorder', 'stopping...');
              audioRecorder.onComplete = function( recorder, audioBlob ) {
                console.log('WebAudioRecorder', 'stopped', audioBlob.size);
                resolve( audioBlob );
                audioRecorder.onComplete = null;
              };
            
              audioRecorder.finishRecording();
            });
          };
  
          resolve({ start, stop });
      });
    });
  }*/

  return new Promise( resolve => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then( stream => {
        /** @type {MediaRecorder} */
        let mediaRecorder = null;
        /** @type {Blob[]} */
        let audioChunks = [];

        const start = /** @param {Callback} cb */ cb => {
          if (mediaRecorder) {
            return console.error( 'AudioRecorder', 'cannot start new recorder' );
          }

          mediaRecorder = new MediaRecorder( stream );
          mediaRecorder.addEventListener( 'dataavailable', /** @param {MediaRecorderDataEvent} e */ e => {
            audioChunks.push( e.data );
          });
          mediaRecorder.addEventListener( 'start', () => {
            cb();
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
