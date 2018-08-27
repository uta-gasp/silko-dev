import DataPageTextWord from './dataPageTextWord.js';

// ts-check-only
import DataPageFocusedWord from './dataPageFocusedWord';
import Fixation from './fixation';
import FeedbackEvent from './feedbackEvent';
import Image from './image';

const WORD_SELECTOR = '.word';

export default class DataPage {

  constructor() {
    /** @type {DataPageTextWord[]} */
    this.text = DataPageTextWord.fromAll( WORD_SELECTOR );
    /** @type {DataPageFocusedWord[]} */
    this.words = [];
    /** @type {Fixation[]} - history of fixations updates before 'filterFixations' is called, final fixations after */
    this.fixations = [];
    /** @type {FeedbackEvent[]} */
    this.syllabifications = [];
    /** @type {FeedbackEvent[]} */
    this.speech = [];
    /** @type {Image[]} */
    this.images = [];
    /** @type {boolean} */
    this.isIntro = false;
    /** @type {string} */
    this.audio = null;
  }

  /**
   * This function must be called after the tracking stops
   * @param {number} threshold - min fixation duration
   */
  filterFixations( threshold ) {
    /** @type {Fixation[]} */
    const result = [];

    /** @type {Fixation} */
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

      // tsSync changes with every update, we have to memorize the first in the fixation
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

  /**
   * @param {Map<HTMLElement,DataPageFocusedWord>} words
   */
  setWords( words ) {
    const focusedWords = [];
    for ( let word of words.values() ) {
      focusedWords.push( word );
    }

    this.words = focusedWords;
  }

}
