import { i10n } from '@/utils/i10n.js';

const tokens = i10n( 'db' );

// TODO remove the first line, uncomment the other
// const config = require( `@/config/db.development.js` ).config;
const configName = process.env.IS_DEV ? 'development' : process.env.NODE_ENV;
const config = require( `@/config/db.${configName}.js` ).config;

const path = `https://us-central1-${config.projectId}.cloudfunctions.net/`;

export default class DBUtils {

  /**
   * @param {string} id - ID
   * @param {Callback} cb 
   */
  static isTaskLocked( id, cb ) {
    DBUtils._call( 'isTaskLocked', { id }, cb );
  }

  /**
   * @param {string[]} ids - IDs
   * @param {Callback} cb 
   */
  static areTasksLocked( ids, cb ) {
    DBUtils._call( 'areTasksLocked', { ids: ids.join( ',' ) }, cb );
  }

  /**
   * @param {string} id - ID
   * @param {Callback} cb 
   */
  static deleteTaskSessions( id, cb ) {
    DBUtils._get( 'deleteTaskSessions', { id }, cb );
  }

  /**
   * @param {string} id - ID
   * @param {Callback} cb 
   */
  static deleteStudentTaskSessions( id, cb ) {
    DBUtils._get( 'deleteStudentTaskSessions', { id }, cb );
  }

  // Private

  /**
   * @param {string} fnc 
   * @param {object} params 
   * @param {Callback} cb 
   */
  static _get( fnc, params, cb ) {
    const headers = new Headers();
    headers.append( 'Content-Type', 'text/json' );

    /** @type {RequestMode} */
    const mode = 'cors';
    /** @type {RequestCache} */
    const cache = 'no-cache';

    const init = {
      method: 'GET',
      headers: headers,
      mode,
      cache,
    };

    const query = [];
    for ( let name in params ) {
      query.push( `${name}=${params[name]}` );
    }

    const request = new Request( path + fnc + '?' + query.join( '&' ) );

    if ( window.fetch ) {
      window.fetch( request, init ).then( response => {
        if ( !response ) {
          return cb( new Error( tokens[ 'err_no_resp' ] ) );
        }
        return response.json();
      } ).then( response => {
        cb( null, response );
      } ).catch( err => {
        console.error( err );
      } );
    }
    else {
      cb( new Error( tokens[ 'err_not_supported' ] ) );
    }
  }

  /**
   * @param {string} json 
   * @returns {{err: string, response: any}}
   */
  static _parseResponse( json ) {
    let err = null;
    let response = null;

    try {
      response = typeof json === 'string' ? JSON.parse( json ) : json;

      if ( !response || response.err || !( 'result' in response ) ) {
        err = response.err || tokens[ 'err_no_results' ];
      }
      else {
        response = response.result;
      }
    }
    catch ( e ) {
      err = e && e.message ? e.message : tokens[ 'err_unknown' ];
    }

    return { err, response };
  }

  /**
   * 
   * @param {string} name 
   * @param {object} params 
   * @param {Callback} cb 
   */
  static _call( name, params, cb ) {
    DBUtils._get( name, params, ( error, json ) => {
      if ( error ) {
        return cb( error );
      }

      const { err, response } = DBUtils._parseResponse( json );
      cb( err, response );
    } );
  }

}
