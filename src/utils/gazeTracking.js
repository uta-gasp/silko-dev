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
    gazePoint: null
};

for (let name in callbacks) {
    callbacks[ name ] = arg => {
        for (let cb in callbackLists[ name ]) {
            // console.log( name, cb, callbackLists[ name ][ cb ]);
            callbackLists[ name ][ cb ]( arg );
        }
    };
}

let device = '';
let lastState = {};

class GazeTracking {

    constructor() {

        window.GazeTargets.init({
            etudPanel: {
               show: false
            },
            pointer: {
                show: false
            },
            targets: [
                {
                    selector: '.word',
                    selection: {
                        type: GazeTargets.selection.types.none
                    },
                    mapping: {
                        className: ''
                    }
                }
            ],
            mapping: {
                type: GazeTargets.mapping.types.expanded,
                source: GazeTargets.mapping.sources.samples,
                //readingModel: GazeTargets.mapping.readingModel.campbell,
                expansion: 30,
                // reading: {
                //     maxSaccadeLength: 250,
                //     maxSaccadeAngleRatio: 0.7,
                //     fixedText: true
                // }
            }
        }, {
            state: state => {
                lastState = state;
                if (state.device) {
                    device = state.device
                }
                else if (!state.isConnected) {
                    device = '';
                }

                if (state.isTracking) {
                    if (callbacks.started)
                        callbacks.started();
                }
                else if (state.isStopped) {
                    if (callbacks.stopped)
                        callbacks.stopped();
                }

                if (callbacks.stateUpdated) {
                    callbacks.stateUpdated( state );
                }
            },

            target: (event, target) => {
                if (event === 'focused') {
                    if (callbacks.wordFocused)
                        callbacks.wordFocused( target );
                }
                else if (event === 'left') {
                    if (callbacks.wordLeft)
                        callbacks.wordLeft( target );
                }
            },

            fixation: fix => {
                if (callbacks.gazePoint) {
                    callbacks.gazePoint( fix );
                }
            }
        });
    }

    listCallbacks() {
        return Object.keys( callbacks );
    }

    setCallback( name, id, cb ) {
        callbackLists[ name ][ id ] = cb;
    }

    clearCallback( name, id ) {
        delete callbackLists[ name ][ id ];
    }

    get state() {
        return lastState;
    }

    showOptions() {
        window.GazeTargets.ETUDriver.showOptions();
    }

    calibrate() {
        window.GazeTargets.ETUDriver.calibrate();
    }

    start() {
        if (!lastState.isTracking) {
            window.GazeTargets.ETUDriver.toggleTracking();
        }
    }

    stop() {
        if (lastState.isTracking) {
            window.GazeTargets.ETUDriver.toggleTracking();
        }
    }

    updateTargets() {
        window.GazeTargets.updateTargets();
    }
}

const gazeTracking = new GazeTracking();
export default gazeTracking;