import Recordable from './commons/recordable.js';
import TextPage from './task/textPage.js';
import TextPageImage from './task/textPageImage.js';

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


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default class Task {

  constructor( id ) {
    this.id = id;
    this.name = '';
    this.owner = '';
    this.cls = '';
    this.type = '';
    this.intro = '';
    this.pages = [];      // [TextPage]
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

  static get FILE_ID_SPLITTER() {
    return '_';
  }

  static textToPages( text ) {
    if ( !text ) {
      return [];
    }

    let pageIndex = 0;
    let page = new TextPage( pageIndex );

    const pages = [ page ];
    const lines = text.split( '\n' );

    lines.forEach( line => {
      line = line.trim();

      if ( !line ) {
        if ( page.lines.length > 0 ) {
          page = new TextPage( ++pageIndex );
          pages.push( page );
        }
        return;
      }

      page.lines.push( line );
    } );

    if ( !page.lines.length ) {
      pages.pop();
    }

    return pages;
  }

  static pagesToText( pages ) {
    return pages.map( page => {
      const lines = page.lines || page;   // backward compatibility with format where Task.pages=[[String]]
      return lines.join( '\n' )
    }).join( '\n\n' );
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

  // pages: [model/task/TextPage]
  // images: [model/task/TextPageImage || {src, page, location, on: TextPageImageEvent, off: TextPageImageEvent}]
  static embedImagesIntoPages( pages, images ) {
    if (!images) {
      return;
    }

    pages.forEach( page => page.images = [] );

    images.forEach( image => {
      if (image.page < 0) {
        pages.forEach( page => page.images.push( new TextPageImage( image ) ) );
      }
      else {
        const page = pages[ image.page ];
        if (!page) {
          return;
        }

        page.images.push( new TextPageImage( image ) );
      }
    });
  }

  update( task, cb ) {
    const _task = {
      intro: task.intro,
      pages: Task.textToPages( task.text ),
      syllab: task.syllab,
      speech: task.speech,
      questionnaire: task.questionnaire,
    };

    Task.embedImagesIntoPages( _task.pages, task.images );

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

  uploadImage( file, meta, progressHandler, cb ) {
    const uuid = uuidv4();

    db.uploadFile( file, `${uuid}${Task.FILE_ID_SPLITTER}`, meta, progressHandler, cb );
  }

  // @image: TaskPageImage
  deleteImage( image, cb ) {
    db.deleteFile( image.src, cb );
  }
}

Recordable.apply( Task );
