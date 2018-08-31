// exports a propmise resolving to { start(), stop() } object

export default function() {
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
        let audioChunks = [];

        const start = cb => {
          if (mediaRecorder) {
            return console.error( 'AudioRecorder', 'cannot start new recorder' );
          }

          mediaRecorder = new MediaRecorder( stream );
          mediaRecorder.addEventListener( 'dataavailable', event => {
            audioChunks.push( event.data );
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
