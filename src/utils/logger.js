const enabled = !!window[ 'webpackHotUpdate' ];

function random( max, step = 1, min = 0 ) {
  min = Math.ceil( min );
  max = Math.floor( max );
  let result = Math.round( Math.random() * ( max - min ) );
  result = Math.round( result / step ) * step;
  return result + min + 0;
}

class Logger {

  /**
   * @param {string} name 
   */
  constructor( name ) {
    /** @type {boolean} */
    this.enabled = true;

    /** @type {string} */
    this._name = name;
    /** @type {string} */
    this._css = [
      `background: hsl( ${random( 360, 10 )}, ${random( 100, 20 )}%, ${random( 100, 20 )}% )`,
      'display: inline-block',
    ].join( ';' );

    this.info( `${this._name}: __module_created___` );
  }

  /**
   * @param {...any} args
   */
  info( ...args ) {
    if ( this.enabled ) {
      const _args = this._stringify( args );
      console.info( `%c  `, this._css, this._format( _args ) );
    }
  }

  /**
   * @param {...any} args
   */
  ok( ...args ) {
    if ( this.enabled ) {
      const _args = this._stringify( args );
      console.log( `%c  `, this._css, this._format( _args ) );
    }
  }

  /**
   * @param {...any} args
   */
  error( ...args ) {
    if ( this.enabled ) {
      const _args = this._stringify( args );
      console.error( `%c  `, this._css, this._format( _args ) );
    }
  }

  /**
   * @param {object} args 
   * @returns {string}
   */
  _stringify( args ) {
    return Array.from( args ).map( arg => ( typeof arg === 'object' ? JSON.stringify( arg ) : arg ) ).join( ' ' );
  }

  /**
   * @param {string} args 
   */
  _format( args ) {
    return `${this._name}: ${args}`;
  }

}

/**
 * @param {string} module 
 */
export default function( module ) {
  /* eslint no-unused-vars: ["error", { "args": "none" } ] */
  return enabled ? new Logger( module ) : { info( ...args ) {}, ok( ...args ) {}, error( ...args ) {} };
};
