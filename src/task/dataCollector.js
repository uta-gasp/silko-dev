import Data from '@/model/data.js';
import Session from '@/model/session.js';

import ScreenSize from '@/model/session/screenSize.js';

import Fixation from '@/model/data/fixation.js';
import DataPage from '@/model/data/dataPage.js';
import DataPageFocusedWord from '@/model/data/dataPageFocusedWord.js';
import FeedbackEvent from '@/model/data/feedbackEvent.js';
import Image from '@/model/data/image.js';

import db from '@/db/db.js';

// ts-check-only
import ModelTask from '@/model/task.js';
import ModelStudent from '@/model/student.js';
import Font from '@/model/session/font.js';
import Feedbacks from '@/model/session/feedbacks.js';
import { TextPageImage } from '@/model/task/textPageImage.js';

/**
 * @typedef ETUDFixation
 * @property {number} ts
 * @property {number} duration
 * @property {number} x
 * @property {number} y
 */

const MIN_FIXATION_DURATION = 80;

class Timer {

  constructor() {
    this._date = null;
    this._start = 0;
  }

  start() {
    this._date = ( new Date() ).toJSON();
    this._start = window.performance.now();
  }

  /**
   * @returns {number}
   */
  get value() {
    return Math.round( window.performance.now() - this._start );
  }

  /**
   * @returns {string}
   */
  get date() {
    return this._date;
  }

}

class Page {

  /**
   * @param {boolean} isIntroPage 
   */
  constructor( isIntroPage ) {
    this.words = new Map();
    this.data = new DataPage();
    this.data.isIntro = isIntroPage;
  }

}

class Pages {

  /**
   * @param {boolean} hasIntroPage 
   */
  constructor( hasIntroPage ) {
    this.hasIntroPage = hasIntroPage;
    /** @type {Page[]} */
    this.items = [];
    this.pageIndex = -1;
  }

  /**
   * @param {number} index 
   * @returns {Page}
   */
  page( index ) {
    return this.items[ index ];
  }

  /**
   * @returns {Page}
   */
  get current() {
    return this.items[ this.pageIndex ];
  }

  /**
   * @returns {Page}
   */
  get last() {
    return this.items[ this.items.length - 1 ];
  }

  /**
   * @returns {boolean}
   */
  get ready() {
    return this.pageIndex >= 0;
  }

  /**
   * @returns {Page}
   */
  add() {
    const page = new Page( !this.items.length ? this.hasIntroPage : false );
    this.items.push( page );
    this.pageIndex++;
    return page;
  }

  done() {
    this.pageIndex = -1;
  }

};

export default class DataCollector {

  /**
   * 
   * @param {ModelTask} task 
   * @param {ModelStudent} student 
   * @param {Font} font 
   * @param {Feedbacks} feedbacks 
   */
  constructor( task, student, font, feedbacks ) {
    this.session = {
      date: ( new Date() ).toJSON(),
      student: student.id,
      task: task.id,
      cls: task.cls,
      font: font,
      feedbacks: feedbacks,
      screen: ScreenSize.full,
      data: null,
    };

    this.pages = new Pages( !!task.intro );
    this.timer = new Timer();

    this.focusedElem = null;
    this.currentWord = null;
  }

  start() {
    // if ( !this.pages.ready ) {
    //   this.pages.add();
    // }
    this.timer.start();
  }

  /**
   * @param {function} cb 
   */
  stop( cb ) {
    this.setFocusedWord( null );
    this.pages.done();
    this._save( cb );
  }

  nextPage() {
    this._closeImages();
    this.pages.add();
  }

  /**
   * @param {number} threshold 
   * @returns {string[]}
   */
  longGazedWords( threshold ) {
    const result = [];
    const re = /\b([\w$%&]+\S*\b)/;
    this.pages.items.forEach( page => {
      page.words.forEach( word => {
        if ( word.focusing.duration >= threshold ) {
          result.push( re.exec( word.text )[0] );
        }
      } );
    } );

    return result;
  }

  /**
   * @returns {{text: string, duration: number}}
   */
  get focusedWord() {
    if ( !this.currentWord ) {
      return null;
    }
    else {
      return {
        text: this.currentWord.text,
        duration: this.currentWord.focusing.currentDuration( this.timer.value ),
      };
    }
  }

  /**
   * @returns {number}
   */
  get wordReadingDuration() {
    const page = this.pages.current;
    if ( !page ) {
      return null;
    }

    let sum = 0;
    let count = 0;
    page.words.forEach( word => {
      if ( word.focusing.duration > 200 && word.focusing.duration < 2000 ) {
        sum += word.focusing.duration;
        count++;
      }
    } );

    if ( !count ) {
      return null;
    }

    return sum / count;
  }

  // Loggers

  /**
   * Propagates the highlighing if the focused word is the next after the current
   * @param {HTMLElement} el 
   * @returns {string}
   */
  setFocusedWord( el ) {
    if ( this.focusedElem === el || !this.pages.ready ) {
      return null;
    }

    if ( this.currentWord ) {
      this.currentWord.focusing.stop( this.timer.value );
      this.currentWord = null;
    }

    if ( el ) {
      const page = this.pages.current;
      this.currentWord = page.words.get( el );
      if ( !this.currentWord ) {
        this.currentWord = new DataPageFocusedWord( el, this.pages.pageIndex );
        page.words.set( el, this.currentWord );
      }

      this.currentWord.focusing.start( this.timer.value );
    }

    this.focusedElem = el;

    return this.currentWord ? this.currentWord.text : null;
  }

  /**
   * 
   * @param {ETUDFixation} gazePoint 
   */
  addGazePoint( gazePoint ) {
    if ( !this.pages.ready ) {
      return;
    }

    this.pages.current.data.fixations.push( Fixation.from( gazePoint, this.timer.value ) );
  }

  /**
   * @param {HTMLElement} el 
   */
  syllabified( el ) {
    if ( !el || !this.pages.ready ) {
      return;
    }

    const page = this.pages.current;
    const word = page.words.get( el );

    if ( word ) {
      word.feedback.syllabified = true;
      page.data.syllabifications.push( new FeedbackEvent(
        this.timer.value,
        word.text,
        word.rect
      ) );
    }
  }

  /**
   * @param {HTMLElement} el 
   */
  pronounced( el ) {
    if ( !el || !this.pages.ready ) {
      return;
    }

    const page = this.pages.current;
    const word = page.words.get( el );

    if ( word ) {
      word.feedback.pronounced = true;
      page.data.speech.push( new FeedbackEvent(
        this.timer.value,
        word.text,
        word.rect
      ) );
    }
  }

  /**
   * @param {TextPageImage} image 
   */
  imageShow( image ) {
    const page = this.pages.current;
    page.data.images.push( new Image( image, this.timer.value ) );
  }

  /**
   * @param {TextPageImage} image 
   */
  imageHide( image ) {
    const page = this.pages.current || this.pages.last;
    const currentImage = page.data.images.find( img => img.src === image.src && img.isCurrent );

    if ( currentImage ) {
      currentImage.hide( this.timer.value );
    }
  }

  _closeImages() {
    const page = this.pages.current || this.pages.last;
    if ( !page ) {
      return;
    }

    page.data.images.forEach( img => {
      if ( img.isCurrent ) {
        img.hide( this.timer.value );
      }
    } );
  }

  /**
   * @param {function} cb 
   */
  _save( cb ) {
    const data = {
      task: this.session.task,
      student: this.session.student,
      pages: this.pages.items.map( page => {
        page.data.filterFixations( MIN_FIXATION_DURATION );
        page.data.setWords( page.words );
        return page.data;
      } ),
      questionnaire: null,
    };

    db.add( Data, data, ( err, dataKey ) => {
      if ( err ) {
        return cb( err );
      }

      this.session.data = dataKey;
      db.add( Session, this.session, ( err, sessionKey ) => {
        if ( err ) {
          return cb( err );
        }

        cb( null, { data: dataKey, session: sessionKey } );
      } );
    } );
  }

};
