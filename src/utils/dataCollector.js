let _startTime = 0;

function timestamp() {
    return Math.round( window.performance.now() - _startTime );
}

function Page( wordList ) {
    this.wordList = wordList;
    this.words = new Map();
    this.fixations = [];
    this.syllabifications = [];
    this.speech = [];
}

function Record( elem, pageID ) {
    let rect = null;
    if (elem) {
        const box = elem.getBoundingClientRect()
        rect = {
            x: box.left,
            y: box.top,
            width: box.width,
            height: box.height
        };
    }
    this.rect = rect;
    this.text = elem ? elem.textContent : '';
    this.duration = 0;
    this.focusCount = 0;
    this.firstEntry = 0;
    this.lastEntry = 0;
    this.pageID = pageID;
    this.syllabified = false;
    this.pronounced = false;
}

Record.prototype.start = function () {
    this.lastEntry = timestamp();
    if (!this.focusCount) {
        this.firstEntry = this.lastEntry;
    }
    this.focusCount++;
};

Record.prototype.stop = function () {
    this.duration += timestamp() - this.lastEntry;
};

function Fixation (fixation) {
    this.ts = fixation.ts;
    this.tsSync = timestamp();
    this.x = Math.round( fixation.x );
    this.y = Math.round( fixation.y );
    this.duration = fixation.duration;
}

function FeedbackEvent( record ) {
    this.ts = timestamp();
    this.rect = record.rect;
    this.text = record.text;
}






export default class DataCollector {
    constructor( options ) {
        options = options || {};
        this.wordSelector = ('.' + options.wordClass) || '.word';
        this.minFixationDuration = options.minFixationDuration || 80;

        this.currentWord = null;
        this.currentPage = null;
        this.currentRecord = null;
        this.pages = [];

        this.startDate = null;
    }

    start() {
        this.startDate = (new Date()).toJSON();
        _startTime = window.performance.now();
    }

    // Propagates the highlighing if the focused word is the next after the current
    // Arguments:
    //        word:         - the focused word  (DOM element)
    setFocusedWord( word, pageID ) {

        if (this.currentWord != word) {
            if (this.currentRecord) {
                this.currentRecord.stop();
                this.currentRecord = null;
            }

            if (word) {
                const page = this._getPage( pageID );
                this.currentRecord = page.words.get( word );
                if (!this.currentRecord) {
                    this.currentRecord = new Record( word, pageID );
                    page.words.set( word, this.currentRecord );
                }

                this.currentRecord.start();
            }

            this.currentWord = word;
            this.currentPage = pageID;
        }
    };

    // Logs fixation
    logFixation( fixation, pageID ) {
        const page = this._getPage( pageID );
        page.fixations.push( new Fixation( fixation ) );
    };

    save( cb ) {
        const fixations = this._filterFixations( this.minFixationDuration );
        this._saveRemote( fixations, cb );
    };

    syllabified( word ) {
        if (!word || this.currentPage === null) {
            return;
        }

        const page = this._getPage( this.currentPage );
        if (!page) {
            return;
        }

        const record = page.words.get( word );
        if (record) {
            record.syllabified = true;
            page.syllabifications.push( new FeedbackEvent( record ) );
        }
    };

    pronounced( word ) {
        if (!word || this.currentPage === null) {
            return;
        }
        const page = this._getPage( this.currentPage );
        if (!page) {
            return;
        }
        const record = page.words.get( word );
        if (record) {
            record.pronounced = true;
            page.speech.push( new FeedbackEvent( record ) );
        }
    };

    getAvgWordReadingDuration() {
        const page = this._getPage( 0 );
        if (!page) {
            return 500;
        }

        let sum = 0;
        let count = 0;
        page.words.forEach( record => {
            if (record.duration > 200 && record.duration < 2000) {
                sum += record.duration;
                count++;
            }
        });

        if (!count) {
            return 500;
        }

        return sum / count;
    };

    // private
    _getPage( pageID ) {
        var page = this.pages[ pageID ];
        if (!page) {
            page = new Page( this._getWordsList() );
            this.pages.push( page );
        }

        return page;
    }

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

    _saveRemote( fixations, cb ) {
        if (this.currentRecord) {
            this.currentRecord.stop();
            this.currentRecord = null;
        }

        // const textSetup = _services.getTextSetup();
        // const textHash = murmurhash3_32_gc( textSetup.text, 1837832);

        const session = this.pages.map( (page, pi) => {
            const records = [];
            for (let record of page.words.values()) {
                records.push( record );
            }

            return {
                records: records,
                fixations: fixations[ pi ],
                syllabifications: page.syllabifications,
                speech: page.speech,
            };
        });

        const text = this.pages.map( page => {
            return page.wordList;
        });

        setTimeout( cb, 2000 );

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

    _getWordsList() {
        const list = [];
        const words = document.querySelectorAll( this.wordSelector );

        for (let i = 0; i < words.length; i += 1) {

            const word = words.item(i);
            const rect = word.getBoundingClientRect();

            list.push({
                text: word.textContent,
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height,
                id: i
            });
        }
        return list;
    };

    _filterFixations( durationThreshold ) {
        const result = [];

        let lastFix = null;
        let lastFixContainer = null;

        this.pages.forEach( page => {
            const pageFixations = [];
            let fixTimestamp = 0;
            let fixTimestampSync = 0;

            page.fixations.forEach( fixation => {
                if (fixation.duration < durationThreshold) {
                    return;
                }

                if (!lastFix) {
                    lastFixContainer = pageFixations;
                }
                else if (lastFix.ts !== fixation.ts) {
                    lastFix.tsSync = fixTimestampSync;
                    lastFixContainer.push( lastFix );
                    lastFixContainer = pageFixations;
                }

                if (fixTimestamp !== fixation.ts) {
                    fixTimestamp = fixation.ts;
                    fixTimestampSync = fixation.tsSync;
                }

                lastFix = fixation;
            });

            result.push( pageFixations );
        });

        if (lastFix && lastFixContainer) {
            lastFixContainer.push( lastFix );
        }

        return result;
    }

}