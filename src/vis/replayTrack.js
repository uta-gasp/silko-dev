import Colors from '@/vis/colors.js';

let colorIndex = 0;

const FIXATION_GROW_INTERVAL = 100;

export default class ReplayTrack {

    constructor( root, userName, session ) {
        this.root = root;
        this.name = userName;
        this.session = session;
        this.color = Colors.colors[ colorIndex++ % Colors.colors.length ];

        this.pointerSize = 8;
        this.fixationEndTimer = null;
        this.fixationGrowTimer = null;
        this.nextTimer = null;
        this.syllabTimer = null;

        this.fixations = null;
        this.currentFixation = null;
        this.currentDuration = 0;
        this.fixationIndex = -1;

        this.callbacks = {};
        this.syllabifications = null;
        this.nextSyllabificationIndex = 0;
        this.pointer = null;

        this._lastPause = 0;

        this.__next = this._next.bind( this );
    }

    start( pageIndex, callbacks ) {
        this.callbacks = callbacks || {};
        this.callbacks.fixation = this.callbacks.fixation || (() => {});
        this.callbacks.completed = this.callbacks.completed || (() => {});
        this.callbacks.syllabification = this.callbacks.syllabification || (() => {});

        this.fixations = this.session[ pageIndex ].fixations;
        if (!this.fixations) {
            this.callbacks.completed();
            return;
        }

        this.syllabifications = this.session[ pageIndex ].syllabifications;
        this.nextSyllabificationIndex = this.syllabifications ? 0 : -1;

        this.fixationIndex = 0;

        this.pointer = document.createElement( 'div' );
        this.pointer.classList.add( 'track-pointer' );
        this.pointer.classList.add( 'invisible' );
        this.root.appendChild( this.pointer );

        this.nextTimer = setTimeout( this.__next, 1500);
    };

    stop() {
        this._stopFixationTimers();

        if (this.nextTimer) {
            clearTimeout( this.nextTimer );
            this.nextTimer = null;
        }

        if (this.pointer) {
            this.root.removeChild( this.pointer );
            this.pointer = null;
        }
    };

    togglePause() {
        if (!this.pointer) {
            return false;
        }

        if (this.nextTimer) {
            this._stopFixationTimers();

            clearTimeout( this.nextTimer );
            this.nextTimer = null;

            return true;
        }
        else {
            this.nextTimer = setTimeout( this.__next, this._lastPause );
            this._moveFixation( this.currentFixation );

            return false;
        }
    }

    static resetColors() {
        colorIndex = 0;
    }

    // private

    _stopFixationTimers() {
        if (this.fixationEndTimer) {
            clearTimeout( this.fixationEndTimer );
            this.fixationEndTimer = null;
        }

        if (this.fixationGrowTimer) {
            clearInterval( this.fixationGrowTimer );
            this.fixationGrowTimer = null;
        }

        if (this.syllabTimer) {
            clearTimeout( this.syllabTimer );
            this.syllabTimer = null;
        }
    };

    _next() {
        let fixation = this.fixations[ this.fixationIndex ];

        this._moveFixation( fixation );

        this.fixationIndex++;
        if (this.fixationIndex < this.fixations.length) {
            this._lastPause = this.fixations[ this.fixationIndex ].ts - fixation.ts;
            this.nextTimer = setTimeout( this.__next, this._lastPause );
        }
        else {
            this.callbacks.completed();
            this.root.removeChild( this.pointer );
            this.pointer = null;
            this.nextTimer = null;
        }
    };

    _moveFixation( fixation ) {
        this._stopFixationTimers();

        if (fixation) {
            this._checkSyllabification( fixation );

            this.callbacks.fixation( fixation, this.pointer );

            if (fixation.x > 0 && fixation.y > 0) {
                this.currentDuration = 100;
                this._updatePointer();
                this.pointer.classList.remove( 'invisible' );
            }

            this.fixationEndTimer = setTimeout( () => {
                this._stopFixationTimers();
                if (this.pointer) {
                    this.pointer.classList.add( 'invisible' );
                }
            }, fixation.duration );

            this.fixationGrowTimer = setInterval( () => {
                this._updatePointer();
            }, FIXATION_GROW_INTERVAL );
        }
        else {
            this.pointer.classList.add( 'invisible' );
        }

        this.currentFixation = fixation;
    };

    _updatePointer() {
        if (!this.currentFixation || !this.pointer) {
            return;
        }

        const size = Math.round( Math.sqrt( this.currentDuration ) );
        this.pointer.style = `left: ${this.currentFixation.x - size / 2}px;
                              top: ${this.currentFixation.y - size / 2}px;
                              width: ${size}px;
                              height: ${size}px;
                              border-radius: ${size / 2}px;
                              background-color: ${this.color};`;

        this.currentDuration += FIXATION_GROW_INTERVAL;
    };

    _checkSyllabification( fixation ) {
        if (this.nextSyllabificationIndex < 0) {
            return;
        }

        const syllabification = this.syllabifications[ this.nextSyllabificationIndex ];
        const fixationEndsAt = fixation.tsSync + fixation.duration;
        if (syllabification.ts < fixationEndsAt) {
            this.nextSyllabificationIndex++;
            if (this.nextSyllabificationIndex === this.syllabifications.length) {
                this.nextSyllabificationIndex = -1;
            }

            this.syllabTimer = setTimeout( () => {
                this.syllabTimer = null;
                this.callbacks.syllabification( syllabification );
            }, (fixationEndsAt - syllabification.ts) );
        }
    };

};
