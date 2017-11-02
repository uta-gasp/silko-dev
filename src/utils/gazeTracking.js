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
  customValue: {}
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
  /** @type {GTCallback} */
  customValue: null,
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
      /** 
       * @param {any} state 
       * */ 
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

      /** 
       * @param {string} event
       * @param {Element} target 
       * */ 
      target: ( event, target ) => {
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

      /**
       * @param {number} code
       * @param {any} value
       */
      customValue: (code, value) => {
        callbacks.customValue( { code, value } );
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

  /**
   * @param {ETUDCustomValueType} customValueType 
   * @param {Callback} cb
   */
  getCustomValue( customValueType, cb ) {
    const tempID = '' + Math.random();
    callbackLists[ 'customValue' ][ tempID ] = /** @param {ETUDCustomValueCallbackArg} e */ e => {
      delete callbackLists[ 'customValue' ][ tempID ];
      cb( null, e );
    };

    GazeTargets.ETUDriver.getCustomValue( customValueType );
  }

  /**
   * @param {ETUDCustomValueType} customValueType 
   * @param {any} value
   */
  setCustomValue( customValueType, value ) {
    GazeTargets.ETUDriver.setCustomValue( customValueType, value );
  }

  /** @returns {Record<string, ETUDCustomValueType>} */
  listCustomValueTypes() {
    return GazeTargets.ETUDriver.listAvailableCustomValue();
  }

}

const gazeTracking = new GazeTracking();

export default gazeTracking;
