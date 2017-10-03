import Recordable from './commons/recordable.js';

import Intro from './intro.js';

import db from '@/db/db.js';

class Threshold {

  constructor( value, smart, min, max, adjustForWordLength ) {
    this.value = value;
    this.smart = smart;
    this.min = min;
    this.max = max;
    this.adjustForWordLength = adjustForWordLength;
  }

};

export default class Task {

  constructor( id ) {
    this.id = id;
    this.name = '';
    this.owner = '';
    this.cls = '';
    this.type = '';
    this.intro = '';
    this.pages = [];    // array of arrays of strings
    this.syllab = Task.defaultSyllab;
    this.speech = Task.defaultSpeech;
    this.questionnaire = [];
  }

  static get db() {
    return 'tasks';
  }

  static get( id, cb ) {
    return db.get( Task, id, cb );
  }

  static get wordSyllabSeparator() {
    return '=';
  }

  static get syllabSeparator() {
    return ' ';
  }

  static get defaultSyllab() {
    return  {
      language: '',
      exceptions: {},
      mode: 'colors',
      temporary: false,
      threshold: new Threshold( 3000, false, 1500, 3000, false ),
    };
  }

  static get defaultSpeech() {
    return {
      language: '',
      threshold: new Threshold( 4000, false, 3000, 4000, false ),
    };
  }

  static textToPages( text ) {
    if ( !text ) {
      return [];
    }

    let page = [];
    const pages = [ page ];
    const lines = text.split( '\n' );

    lines.forEach( line => {
      line = line.trim();

      if ( !line ) {
        if ( page.length > 0 ) {
          page = [];
          pages.push( page );
        }
        return;
      }

      page.push( line );
    } );

    if ( !page.length ) {
      pages.pop();
    }

    return pages;
  }

  static pagesToText( pages ) {
    return pages.map( page => page.join( '\n' ) ).join( '\n\n' );
  }

  static textToSyllabs( text ) {
    if ( !text ) {
      return {};
    }

    const result = {};
    const lines = text.split( '\n' );

    lines.forEach( line => {
      line = line.trim();
      const parts = line.split( Task.wordSyllabSeparator );
      if ( parts.length !== 2 ) {
        return;
      }

      const word = parts[0].trim();
      const syllabText = parts[1].trim();
      if ( !word || !syllabText || word.split( Task.syllabSeparator ).length > 1 ) {
        return;
      }

      result[ word ] = syllabText.split( Task.syllabSeparator )
        .filter( item => item.length )
        .join( Task.syllabSeparator );
    } );

    return result;
  }

  static syllabsToText( syllabs ) {
    const result = [];
    for ( let word in syllabs ) {
      result.push( `${word}${Task.wordSyllabSeparator}${syllabs[ word ]}` );
    }
    return result.join( '\n' );
  }

  update( task, cb ) {
    const _task = {
      intro: task.intro,
      pages: Task.textToPages( task.text ),
      syllab: task.syllab,
      speech: task.speech,
      questionnaire: task.questionnaire,
    };

    _task.syllab.exceptions = Task.textToSyllabs( task.syllab.exceptions );

    db.updateFields( this, _task, cb );
  }

  getIntro( cb ) {
    if (this.intro) {
      return db.get( Intro, this.intro, cb );
    }
    else {
      cb();
    }
  }

}

Recordable.apply( Task );
