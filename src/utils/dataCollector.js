import Data from '../model/data.js';
import Session from '../model/session.js';
import Fixation from '../model/data/fixation.js';
import DataPage from '../model/data/dataPage.js';
import DataWord from '../model/data/dataWord.js';
import FeedbackEvent from '../model/data/feedbackEvent.js';
import db from '../model/db.js';

const MIN_FIXATION_DURATION = 80;

class Timer {
    constructor() {
        this._date = null;
        this._start = 0;
    }

    start() {
        this._date = (new Date()).toJSON();
        this._start = window.performance.now();
    }

    get value() {
        return Math.round( window.performance.now() - this._start );
    }

    get date() {
        return this._date;
    }
}

class Page {
    constructor() {
        this.words = new Map();
        this.data = new DataPage();
    }
}

class Pages {
    constructor() {
        this.items = [];
        this.pageIndex = -1;
    }

    page( index ) {
        return this.items[ index ];
    }

    get current() {
        return this.items[ this.pageIndex ];
    }

    get ready() {
        return this.pageIndex >= 0;
    }

    add() {
        const page = new Page();
        this.items.push( page );
        this.pageIndex++;
        return page;
    }

    done() {
        this.pageIndex = -1;
    }
};

export default class DataCollector {
    constructor( task, student, font, feedbacks ) {
        this.session = {
            date: (new Date()).toJSON(),
            student: student.id,
            task: task.id,
            cls: task.cls,
            font: font,
            feedbacks: feedbacks,
            data: null
        };

        this.pages = new Pages();
        this.timer = new Timer();

        this.focusedElem = null;
        this.currentWord = null;
    }

    start() {
        if (!this.pages.ready) {
            this.pages.add();
        }
        this.timer.start();
    }

    stop( cb ) {
        this.setFocusedWord( null );
        this.pages.done();
        this._save( cb );
    }

    nextPage() {
        this.pages.add();
    }

    // Loggers

    // Propagates the highlighing if the focused word is the next after the current
    // Arguments:
    //        word:         - the focused word  (DOM element)
    setFocusedWord( el ) {

        if (this.focusedElem === el || !this.pages.ready) {
            return;
        }

        if (this.currentWord) {
            this.currentWord.focusing.stop( this.timer.value );
            this.currentWord = null;
        }

        if (el) {
            const page = this.pages.current;
            this.currentWord = page.words.get( el );
            if (!this.currentWord) {
                this.currentWord = new DataWord( el, this.pages.pageIndex );
                page.words.set( el, this.currentWord );
            }

            this.currentWord.focusing.start( this.timer.value );
        }

        this.focusedElem = el;
    };

    addGazePoint( gazePoint ) {
        if (!this.pages.ready) {
            return;
        }

        this.pages.current.data.fixations.push( Fixation.from( gazePoint, this.timer.value ) );
    };

    syllabified( el ) {
        if (!el || !this.pages.ready) {
            return;
        }

        const page = this.pages.current;
        const word = page.words.get( el );

        if (word) {
            word.feedback.syllabified = true;
            page.data.syllabifications.push( new FeedbackEvent(
                this.timer.value,
                word.text,
                word.rect
            ));
        }
    };

    pronounced( el ) {
        if (!el || !this.pages.ready) {
            return;
        }

        const page = this.pages.current;
        const word = page.words.get( el );

        if (word) {
            word.feedback.pronounced = true;
            page.data.speech.push( new FeedbackEvent(
                this.timer.value,
                word.text,
                word.rect
            ));
        }
    };


    // Other methods

    getAvgWordReadingDuration() {
        const page = this.pages.page( 0 );
        if (!page) {
            return 500;
        }

        let sum = 0;
        let count = 0;
        page.words.forEach( word => {
            if (word.focusing.duration > 200 && word.focusing.duration < 2000) {
                sum += word.focusing.duration;
                count++;
            }
        });

        if (!count) {
            return 500;
        }

        return sum / count;
    };

    // private

    /*
    Statistics.prototype._saveLocal = function () {
        var data = document.querySelector( this.root + ' textarea' ).value;
        var blob = new Blob([data], {type: 'text/plain'});

        var downloadLink = document.createElement("a");
        downloadLink.download = 'results.txt';
        downloadLink.innerHTML = 'Download File';

        var URL = window.URL || window.webkitURL;
        downloadLink.href = URL.createObjectURL( blob );
        downloadLink.onclick = function(event) { // self-destrly
            document.body.removeChild(event.target);
        };
        downloadLink.style.display = 'none';
        document.body.appendChild( downloadLink );

        downloadLink.click();
    };*/

    _save( cb ) {

        // const textSetup = _services.getTextSetup();
        // const textHash = murmurhash3_32_gc( textSetup.text, 1837832);

        const data = {
            task: this.session.task,
            student: this.session.student,
            pages: this.pages.items.map( page => {
                page.data.filterFixations( MIN_FIXATION_DURATION );
                page.data.setWords( page.words );
                return page.data;
            })
        };

        db.add( Data, data, (err, key) => {
            if (err) {
                return cb( err );
            }

            this.session.data = key;
            db.add( Session, this.session, (err, key) => {
                if (err) {
                    return cb( err );
                }

                cb( undefined, key );
            });
        });

        // const textPages = this.pages.items.map( page => page.text );



        //setTimeout( () => cb( data ), 2000 );

        /*
        const userSessions = app.firebase.child( 'users/' + name + '/sessions' );
        const sessionKey = userSessions.push({
            date: this.startDate,
            text: textHash,
            textTitle: textSetup.title,
            lineSize: textSetup.lineSize,
            font: textSetup.font,
            interaction: _services.getInteractionSetup()
        }).key;

        const updates = {};
        updates[ '/sessions/' + sessionKey ] = session;
        updates[ '/texts/' + textHash ] = text;

        app.firebase.update( updates, () => {
        });*/
    };
}