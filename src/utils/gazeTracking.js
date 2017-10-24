/**
 * @external GazeTargets
 */

const RECONNECT_INTERVAL = 3000;

const callbackLists = {
  started: {},
  stopped: {},
  stateUpdated: {},
  wordFocused: {},
  wordLeft: {},
  gazePoint: {},
};

const callbacks = {
  started: null,
  stopped: null,
  stateUpdated: null,
  wordFocused: null,
  wordLeft: null,
  gazePoint: null,
};

for ( let name in callbacks ) {
  callbacks[ name ] = arg => {
    for ( let id in callbackLists[ name ] ) {
      callbackLists[ name ][ id ]( arg );
    }
  };
}

// let device = '';
let lastState = {};

class GazeTracking {

  constructor() {
    this.serviceCheckTimer = null;

    this.wsOK = GazeTargets.init( {
      etudPanel: {
        show: false,
      },
      pointer: {
        show: false,
      },
      targets: [
        {
          selector: '.word',
          selection: {
            type: GazeTargets.selection.types.none,
          },
          mapping: {
            className: '',
          },
        },
      ],
      mapping: {
        type: GazeTargets.mapping.types.expanded,
        source: GazeTargets.mapping.sources.samples,
        expansion: 30,
      },
    }, {
      state: state => {
        lastState = state;
        // if ( state.device ) {
        //   device = state.device;
        // }
        // else if ( !state.isConnected ) {
        //   device = '';
        // }

        if ( state.isTracking ) {
          callbacks.started();
        }
        else if ( state.isStopped ) {
          callbacks.stopped();
        }

        callbacks.stateUpdated( state );

        if ( state.isDisconnected ) {
          this.scheduleReconnection();
        }
      },

      target: ( event, target ) => {
        if ( event === 'focused' ) {
          callbacks.wordFocused( target );
        }
        else if ( event === 'left' ) {
          callbacks.wordLeft( target );
        }
      },

      fixation: fix => {
        callbacks.gazePoint( fix );
      },
    } );
  }

  /**
   * @returns {string[]}
   */
  listCallbacks() {
    return Object.keys( callbacks );
  }

  /**
   * @param {string} name 
   * @param {string} id 
   * @param {function} cb 
   */
  setCallback( name, id, cb ) {
    callbackLists[ name ][ id ] = cb;
  }

  /**
   * @param {string} name 
   * @param {string} id 
   */
  clearCallback( name, id ) {
    delete callbackLists[ name ][ id ];
  }

  /**
   * @returns {object}
   */
  get state() {
    return lastState;
  }

  showOptions() {
    GazeTargets.ETUDriver.showOptions();
  }

  calibrate() {
    GazeTargets.ETUDriver.calibrate();
  }

  start() {
    if ( !lastState.isTracking ) {
      GazeTargets.ETUDriver.toggleTracking();
    }
  }

  stop() {
    if ( lastState.isTracking ) {
      GazeTargets.ETUDriver.toggleTracking();
    }
  }

  updateTargets() {
    GazeTargets.updateTargets();
  }

  scheduleReconnection() {
    if ( this.serviceCheckTimer ) {
      return;
    }

    this.serviceCheckTimer = setTimeout( () => {
      this.serviceCheckTimer = null;
      if ( !lastState.isServiceRunning ) {
        this.wsOK = GazeTargets.reconnect();
      }
    }, RECONNECT_INTERVAL );
  }

}

const gazeTracking = new GazeTracking();

export default gazeTracking;
