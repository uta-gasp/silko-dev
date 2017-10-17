import DataPageTextWord from './dataPageTextWord.js';

const WORD_SELECTOR = '.word';

export default class DataPage {

  constructor( text, words, fixations, syllabifications, speech, images ) {
    this.text = text || DataPageTextWord.fromAll( WORD_SELECTOR );  // [DataPageTextWord]
    this.words = words || [];                          // [DataPageFocusedWord]
    this.fixations = fixations || [];                  // [Fixation]
    this.syllabifications = syllabifications || [];    // [FeedbackEvent]
    this.speech = speech || [];                        // [FeedbackEvent]
    this.images = images || [];                        // [Image]
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
      if ( lastFix && lastFix.ts !== fixation.ts ) {
        lastFix.tsSync = fixTimestampSync;
        result.push( lastFix );
        lastFix = null;
      }

      if ( !ignoreTheEntranceFIxation && fixation.duration >= threshold ) {
        lastFix = fixation;
      }

      // tsSync chnages with every sample, we have to memorize the first in the fixation
      if ( fixTimestamp !== fixation.ts ) {
        if ( fixation.duration < threshold ) {
          ignoreTheEntranceFIxation = false;
        }

        fixTimestamp = fixation.ts;
        fixTimestampSync = fixation.tsSync;
      }
    } );

    if ( lastFix ) {
      lastFix.tsSync = fixTimestampSync;
      result.push( lastFix );
    }

    this.fixations = result;
  }

  // words - Map object of { el: DataPageFocusedWord }
  setWords( words ) {
    const focusedWords = [];
    for ( let word of words.values() ) {
      focusedWords.push( word );
    }

    this.words = focusedWords;
  }

}
