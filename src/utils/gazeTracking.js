/**
 * @external GazeTargets
 * @see {@link https://lexasss.github.com/etudriver-web/}
 */

/**
 * @typedef {Function} GTCallback
 * @param {any} arg
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
  /** @type {GTCallback} */
  started: null,
  /** @type {GTCallback} */
  stopped: null,
  /** @type {GTCallback} */
  stateUpdated: null,
  /** @type {GTCallback} */
  wordFocused: null,
  /** @type {GTCallback} */
  wordLeft: null,
  /** @type {GTCallback} */
  gazePoint: null,
};

for ( let name in callbacks ) {
  callbacks[ name ] = /** @param {any} arg */ arg => {
    for ( let id in callbackLists[ name ] ) {
      callbackLists[ name ][ id ]( arg );
    }
  };
}

// let device = '';
let lastState = {};

class GazeTracking {

  constructor() {
    /** @type {NodeJS.Timer} */
    this._serviceCheckTimer = null;

    /** @type {boolean} */
    this._wsOK = GazeTargets.init( {
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
      state: /** @param {any} state */ state => {
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

      target:
        /** 
         * @param {string} event
         * @param {Element} target 
         * */ 
        ( event, target ) => {
          if ( event === 'focused' ) {
            callbacks.wordFocused( target );
          }
          else if ( event === 'left' ) {
            callbacks.wordLeft( target );
          }
        },

      /**
       * @param {GTFixation} fix
       */
      fixation: fix => {
        callbacks.gazePoint( fix );
      },
    } );
  }

  /** @returns {boolean} */
  get isWebSocketOK() {
    return this._wsOK;
  }

  /** @returns {object} */
  get state() {
    return lastState;
  }

  /** @returns {string[]} */
  listCallbacks() {
    return Object.keys( callbacks );
  }

  /**
   * @param {string} name 
   * @param {string} id 
   * @param {function(string | HTMLElement | GTFixation )} cb 
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
    if ( this._serviceCheckTimer ) {
      return;
    }

    this._serviceCheckTimer = setTimeout( () => {
      this._serviceCheckTimer = null;
      if ( !lastState.isServiceRunning ) {
        this.wsOK = GazeTargets.reconnect();
      }
    }, RECONNECT_INTERVAL );
  }

}

const gazeTracking = new GazeTracking();

export default gazeTracking;
