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
import { Feedbacks } from '@/model/session/feedbacks.js';
import { TextPageImage } from '@/model/task/textPageImage.js';
import { Question } from '@/model/session/question.js';

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

  /** @returns {number} */
  get value() {
    return Math.round( window.performance.now() - this._start );
  }

  /** @returns {string} */
  get date() {
    return this._date;
  }

}

class Page {

  /**
   * @param {boolean} isIntroPage 
   */
  constructor( isIntroPage ) {
    /** @type {Map<HTMLElement,DataPageFocusedWord>} */
    this.words = new Map();
    /** @type {DataPage} */
    this.data = new DataPage();
    /** @type {boolean} */
    this.data.isIntro = isIntroPage;
  }

}

class Pages {

  /**
   * @param {boolean} hasIntroPage 
   */
  constructor( hasIntroPage ) {
    /** @type {boolean} */
    this.hasIntroPage = hasIntroPage;
    /** @type {Page[]} */
    this.items = [];
    /** @type {number} */
    this.pageIndex = -1;
  }

  /**
   * @param {number} index 
   * @returns {Page}
   */
  page( index ) {
    return this.items[ index ];
  }

  /** @returns {Page} */
  get current() {
    return this.items[ this.pageIndex ];
  }

  /** @returns {Page} */
  get last() {
    return this.items[ this.items.length - 1 ];
  }

  /** @returns {boolean} */
  get ready() {
    return this.pageIndex >= 0;
  }

  /** @returns {Page} */
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

class DataCollectorSession {

  /**
   * @param {ModelStudent} student 
   * @param {ModelTask} task 
   * @param {Font} font 
   * @param {Feedbacks} feedbacks 
   */
  constructor( task, student, font, feedbacks ) {
    /** @type {string} */
    this.date = ( new Date() ).toJSON();
    /** @type {string} ID */
    this.student = student.id;
    /** @type {string} ID */
    this.task = task.id;
    /** @type {string} ID */
    this.cls = task.cls;
    /** @type {Font} */
    this.font = font;
    /** @type {Feedbacks} */
    this.feedbacks = feedbacks;
    /** @type {ScreenSize} */
    this.screen = ScreenSize.full;
    /** @type {string} */
    this.data = null;
    /** @type {string[]} IDs */
    this.files = [];
  }

}

export default class DataCollector {

  /**
   * @param {ModelTask} task 
   * @param {ModelStudent} student 
   * @param {Font} font 
   * @param {Feedbacks} feedbacks 
   */
  constructor( task, student, font, feedbacks ) {
    /** @type {DataCollectorSession} */
    this._session = new DataCollectorSession( task, student, font, feedbacks );

    /** @type {Pages} */
    this._pages = new Pages( !!task.intro );
    /** @type {Timer} */
    this._timer = new Timer();

    /** @type {HTMLElement} */
    this._focusedElem = null;
    /** @type {DataPageFocusedWord} */
    this._currentWord = null;
    /** @type {string[]} */
    this._audioFiles = null;
  }

  start() {
    // if ( !this._pages.ready ) {
    //   this._pages.add();
    // }
    this._timer.start();
  }

  /**
   * @param {Callback} cb 
   */
  stop( cb ) {
    this.setFocusedWord( null );
    this._pages.done();
    this._save( cb );
  }

  nextPage() {
    this._closeImages();
    this._pages.add().data.ts = this._timer.value;
  }

  /**
   * @param {number} threshold 
   * @returns {string[]}
   */
  longGazedWords( threshold ) {
    /** @type {string[]} */
    const result = [];
    const re = /\b([\w$%&]+\S*\b)/;
    this._pages.items.forEach( page => {
      page.words.forEach( word => {
        if ( word.focusing.duration >= threshold ) {
          const arr = re.exec( word.text );
          if (arr && arr.length > 0) {
            result.push( arr[0] );
          }
          else {
            console.log('DataCollector.longGazedWords ??', word.text);
          }
        }
      } );
    } );

    return result;
  }

  /** @returns {{text: string, duration: number}} */
  get focusedWord() {
    if ( !this._currentWord ) {
      return null;
    }
    else {
      return {
        text: this._currentWord.text,
        duration: this._currentWord.focusing.currentDuration( this._timer.value ),
      };
    }
  }

  /** @returns {number} */
  get wordReadingDuration() {
    const page = this._pages.current;
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
    if ( this._focusedElem === el || !this._pages.ready ) {
      return null;
    }

    if ( this._currentWord ) {
      this._currentWord.focusing.stop( this._timer.value );
      this._currentWord = null;
    }

    if ( el ) {
      const page = this._pages.current;
      this._currentWord = page.words.get( el );
      if ( !this._currentWord ) {
        this._currentWord = new DataPageFocusedWord( el, this._pages.pageIndex );
        page.words.set( el, this._currentWord );
      }

      this._currentWord.focusing.start( this._timer.value );
    }

    this._focusedElem = el;

    return this._currentWord ? this._currentWord.text : null;
  }

  /**
   * @param {GTFixation} gazePoint 
   */
  addGazePoint( gazePoint ) {
    if ( !this._pages.ready ) {
      return;
    }

    this._pages.current.data.fixations.push(
      Fixation.from( gazePoint, this._timer.value )
    );
  }

  /**
   * @param {HTMLElement} el 
   */
  syllabified( el ) {
    if ( !el || !this._pages.ready ) {
      return;
    }

    const page = this._pages.current;
    const word = page.words.get( el );

    if ( word ) {
      word.feedback.syllabified = true;
      page.data.syllabifications.push( new FeedbackEvent(
        this._timer.value,
        word.text,
        word.rect
      ) );
    }
  }

  /**
   * @param {HTMLElement} el 
   */
  pronounced( el ) {
    if ( !el || !this._pages.ready ) {
      return;
    }

    const page = this._pages.current;
    const word = page.words.get( el );

    if ( word ) {
      word.feedback.pronounced = true;
      page.data.speech.push( new FeedbackEvent(
        this._timer.value,
        word.text,
        word.rect
      ) );
    }
  }

  /**
   * @param {TextPageImage} image 
   */
  imageShow( image ) {
    console.log('DC', 'shown');
    const page = this._pages.current;
    page.data.images.push( new Image( image, this._timer.value ) );
    console.log('DC', '---');
  }

  /**
   * @param {TextPageImage} image 
   */
  imageHide( image ) {
    console.log('DC', 'hidden');
    const page = this._pages.current || this._pages.last;
    const currentImage = page.data.images.find( img => img.src === image.src && img.isCurrent );

    if ( currentImage ) {
      currentImage.hide( this._timer.value );
    }

    console.log('DC', '---');
  }

  /**
   * @param {string[]} urls
   */
  setAudioFiles( urls ) {
    this._audioFiles = urls;
    urls.forEach( url => {
      this._session.files.push( url );
    })
  }

  _closeImages() {
    const page = this._pages.current || this._pages.last;
    if ( !page ) {
      return;
    }

    page.data.images.forEach( img => {
      if ( img.isCurrent ) {
        img.hide( this._timer.value );
      }
    } );
  }

  /**
   * @param {Callback} cb 
   */
  _save( cb ) {
    // DEBUG-LINES
    // PROD: remove next line
    // return cb();

    const data = {
      task: this._session.task,
      student: this._session.student,
      pages: this._pages.items.map( (page, index) => {
        page.data.filterFixations( MIN_FIXATION_DURATION );
        page.data.setWords( page.words );
        if (this._audioFiles) {
          page.data.audio = this._audioFiles[ index ] || null;
        }
        return page.data;
      } ),
      /** @type {Question[]} */
      questionnaire: null,
    };

    db.add( Data, data, ( err, dataKey ) => {
      if ( err ) {
        return cb( err );
      }

      this._session.data = dataKey;
      db.add( Session, this._session, ( err, sessionKey ) => {
        if ( err ) {
          return cb( err );
        }

        cb( null, { data: dataKey, session: sessionKey } );
      } );
    } );
  }

};
