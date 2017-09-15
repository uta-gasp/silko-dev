import Recordable from './commons/recordable.js';

import db from '@/db/db.js';

export default class Intro {

  constructor( id, name, owner ) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.calibInstruction = '';
    this.calibStart = 'Calibrate';
    this.calibSkip = 'Skip';
    this.startInstruction = '';
    this.startRun = 'Start';
    this.startCancel = 'Cancel';
    this.firstPage = [];
    this.next = 'Next';
    this.finish = 'Finish';
    this.finished = 'Thank you!';
  }

  static get db() {
    return 'intros';
  }

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

  firstPageAsText() {
    return this.firstPage ? this.firstPage.join( '\n' ) : '';
  }

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

    db.updateFields( this, fields, cb );
  }

}

Recordable.apply( Intro );
