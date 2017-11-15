export default {

  methods: {

    /**
     * @param {Element} element 
     */
    makeFullscreen( element ) {
      if ( element.requestFullscreen ) {
        element.requestFullscreen();
      }
      else if ( element.mozRequestFullScreen ) {
        element.mozRequestFullScreen();
      }
      else if ( element.webkitRequestFullscreen ) {
        element.webkitRequestFullscreen();
      }
      else if ( element.msRequestFullscreen ) {
        element.msRequestFullscreen();
      }
    },

    closeFullscreen() {
      if ( document.exitFullscreen ) {
        document.exitFullscreen();
      }
      else if ( document.mozCancelFullScreen ) {
        document.mozCancelFullScreen();
      }
      else if ( document.webkitExitFullscreen ) {
        document.webkitExitFullscreen();
      }
      else if ( document.msExitFullscreen ) {
        document.msExitFullscreen();
      }
    },

    /**
     * @param {function(boolean)} cb 
     */
    onFullscreenChanges( cb ) {
      const handler = /** @param {any} e */ e => {
        /* eslint-disable standard/no-callback-literal */
        if ( document.fullscreenElement ) {
          return cb( !!document.fullscreenElement );
        }
        else if ( document.mozFullScreenEnabled ) {
          return cb( !!document.mozFullScreenEnabled );
        }
        else if ( document.webkitFullscreenEnabled ) {
          return cb( !!document.webkitFullscreenEnabled );
        }
        else if ( document.msFullscreenEnabled ) {
          return cb( !!document.msFullscreenEnabled );
        }
      };

      if ( document.onfullscreenchange !== undefined ) {
        document.onfullscreenchange = handler;
      }
      else if ( document.onmozfullscreenchange !== undefined ) {
        document.onmozfullscreenchange = handler;
      }
      else if ( document.onwebkitfullscreenchange !== undefined ) {
        document.onwebkitfullscreenchange = handler;
      }
      else if ( document.onmsfullscreenchange !== undefined ) {
        document.onmsfullscreenchange = handler;
      }
    },

  },

};
