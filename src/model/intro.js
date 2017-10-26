import Recordable from './commons/recordable.js';

import db from '@/db/db.js';

// ts-check-only 
import { IntroCreateParams } from './commons/createParams.js';

export default class Intro {

  /**
   * @param {string} [id]
   */
  constructor( id ) {
    /** @type {string} ID */
    this.id = id;
    /** @type {string} teacher ID */
    this.owner = '';
    /** @type {string} */
    this.name = '';
    /** @type {string} */
    this.calibInstruction = '';
    /** @type {string} */
    this.calibStart = 'Calibrate';
    /** @type {string} */
    this.calibSkip = 'Skip';
    /** @type {string} */
    this.startInstruction = '';
    /** @type {string} */
    this.startRun = 'Start';
    /** @type {string} */
    this.startCancel = 'Cancel';
    /** @type {string[]} */
    this.firstPage = [];
    /** @type {string} */
    this.next = 'Next';
    /** @type {string} */
    this.finish = 'Finish';
    /** @type {string} */
    this.finished = 'Thank you!';
  }

  /** @returns {string} */
  static get db() {
    return 'intros';
  }

  /**
   * @param {IntroCreateParams} texts 
   */
  static validateTexts( texts ) {
    if ( !texts ) {
      return {
        calibInstruction: '',
        calibStart: '',
        calibSkip: '',
        startInstruction: '',
        startRun: '',
        startCancel: '',
        firstPage: [],
        next: '',
        finish: '',
        finished: '',
      };
    }
    else {
      return {
        calibInstruction: texts.calibInstruction || '',
        calibStart: texts.calibStart || '',
        calibSkip: texts.calibSkip || '',
        startInstruction: texts.startInstruction || '',
        startRun: texts.startRun || '',
        startCancel: texts.startCancel || '',
        firstPage: texts.firstPage ? texts.firstPage.split( '\n' ).map( line => line.trim() ) : [],
        next: texts.next || '',
        finish: texts.finish || '',
        finished: texts.finished || '',
      };
    }
  }

  /** @returns {string} */
  textsSummary() {
    let result = [];
    const MAX_CHARS_START = 40;
    const MAX_CHARS_END = 20;
    const MAX_CHARS = MAX_CHARS_START + MAX_CHARS_END;

    function copressText( text ) {
      text = text.replace( /\n/g, ' ' );
      const length = text.length;

      if ( length > MAX_CHARS ) {
        const spaceTo = text.indexOf( ' ', MAX_CHARS_START );
        const spaceFrom = text.slice( 0, -MAX_CHARS_END ).lastIndexOf( ' ' );
        text = text.substr( 0, spaceTo ) + ' ... ' + text.slice( -length + spaceFrom );
      }

      return text;
    }

    if ( this.calibInstruction ) {
      result.push( copressText( this.calibInstruction ) );
    }
    if ( this.startInstruction ) {
      result.push( copressText( this.startInstruction ) );
    }
    if ( this.firstPage && this.firstPage[0] ) {
      result.push( copressText( this.firstPage.join( ' ' ) ) );
    }

    return result.join( '\n' );
  }

  /** @returns {string} */
  firstPageAsText() {
    return this.firstPage ? this.firstPage.join( '\n' ) : '';
  }

  /**
   * @param {string} name 
   * @param {IntroCreateParams} texts 
   * @param {Callback} cb 
   * @returns {Promise}
   */
  update( name, texts, cb ) {
    this.name = name;

    const fields = Intro.validateTexts( texts );
    this.calibInstruction = fields.calibInstruction;
    this.calibStart = fields.calibStart;
    this.calibSkip = fields.calibSkip;
    this.startInstruction = fields.startInstruction;
    this.startRun = fields.startRun;
    this.startCancel = fields.startCancel;
    this.firstPage = fields.firstPage;
    this.next = fields.next;
    this.finish = fields.finish;
    this.finished = fields.finished;

    fields.name = name;

    return db.updateFields( this, fields, cb );
  }

}

Recordable.apply( Intro );
