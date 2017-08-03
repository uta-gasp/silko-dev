import TextWord from '../commons/textWord.js';

const WORD_SELECTOR = '.word';

export default class DataPage {
    constructor( text, words, fixations, syllabifications, speech ) {
        this.text = text || TextWord.fromAll( WORD_SELECTOR )  // array of TextWord
        this.words = words || [];                          // array of DataWord
        this.fixations = fixations || [];                  // array of Fixation
        this.syllabifications = syllabifications || [];    // array of FeedbackEvent
        this.speech = speech || [];                        // array of FeedbackEvent
        this.isIntro = false;
    }

    // this.fixations contain samples, as GazeTracking configures GazeTargets to stream samples :),
    // so this function must be called after the tracking stops
    filterFixations( threshold ) {
        const result = [];

        let lastFix = null;
        let fixTimestamp = 0;
        let fixTimestampSync = 0;
        let ignoreTheEntranceFIxation = true;

        this.fixations.forEach( fixation => {
            // new fixation starts when ts changes
            if (lastFix && lastFix.ts !== fixation.ts) {
                lastFix.tsSync = fixTimestampSync;
                result.push( lastFix );
                lastFix = null;
            }

            if (!ignoreTheEntranceFIxation && fixation.duration >= threshold) {
                lastFix = fixation;
            }

            // tsSync chnages with every sample, we have to memorize the first in the fixation
            if (fixTimestamp !== fixation.ts) {
                if (fixation.duration < threshold) {
                    ignoreTheEntranceFIxation = false;
                }

                fixTimestamp = fixation.ts;
                fixTimestampSync = fixation.tsSync;
            }
        });

        if (lastFix) {
            lastFix.tsSync = fixTimestampSync;
            result.push( lastFix );
        }

        this.fixations = result;
    }

    // words - Map object of { el: DataWord }
    setWords( words ) {
        const focusedWords = [];
        for (let word of words.values()) {
            focusedWords.push( word );
        }

        this.words = focusedWords;
    }
}
