import Recordable from './commons/recordable.js';

import db from '@/db/db.js';

// ts-check-only 
import { IntroCreateParams } from './commons/createParams.js';

export default class Intro extends Recordable {

  /**
   * @param {string} [id]
   */
  constructor( id ) {
    super( id );

    /** @type {string} teacher ID */
    this.owner = '';
    /** @type {string} */
    this.name = '';
    /** @type {string} */
    this.calibInstruction = '';
    /** @type {string} */
    this.startInstruction = '';
    /** @type {string[]} */
    this.firstPage = [];
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
        startInstruction: '',
        firstPage: [],
      };
    }
    else {
      return {
        calibInstruction: texts.calibInstruction || '',
        startInstruction: texts.startInstruction || '',
        firstPage: texts.firstPage ? texts.firstPage.split( '\n' ).map( line => line.trim() ) : [],
      };
    }
  }

  /** @returns {string} */
  textsSummary() {
    let result = [];
    const MAX_CHARS_START = 40;
    const MAX_CHARS_END = 20;
    const MAX_CHARS = MAX_CHARS_START + MAX_CHARS_END;

    /**
     * @param {string} text 
     */
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
    this.startInstruction = fields.startInstruction;
    this.firstPage = fields.firstPage;

    fields.name = name;

    return db.updateFields( this, fields, cb );
  }

}

Recordable.apply( Intro );
