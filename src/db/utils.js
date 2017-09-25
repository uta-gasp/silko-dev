// TODO remove the first line, uncomment the other
// const config = require( `@/config/db.development.js` ).config;
const configName = process.env.IS_DEV ? 'development' : process.env.NODE_ENV;
const config = require( `@/config/db.${configName}.js` ).config;

const path = `https://us-central1-${config.projectId}.cloudfunctions.net/`;

export default class DBUtils {

  static _get( fnc, params, cb ) {
    const headers = new window.Headers();
    headers.append( 'Content-Type', 'text/json' );

    const init = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'no-cache',
    };

    const query = [];
    for ( let name in params ) {
      query.push( `${name}=${params[name]}` );
    }

    const request = new window.Request( path + fnc + '?' + query.join( '&' ) );

    if ( window.fetch ) {
      window.fetch( request, init ).then( response => {
        if ( !response ) {
          return cb( new Error( 'not response' ) );
        }
        return response.json();
      } ).then( response => {
        cb( null, response );
      } ).catch( err => {
        console.error( err );
      } );
    }
    else {
      cb( new Error( 'not supported' ) );
    }
  }

  static _parseResponse( json ) {
    let err = null;
    let response = null;

    try {
      response = typeof json === 'string' ? JSON.parse( json ) : json;

      if ( !response || response.err || !( 'result' in response ) ) {
        err = response.err || 'no result';
      }
      else {
        response = response.result;
      }
    }
    catch ( e ) {
      err = e && e.message ? e.message : 'unknown error';
    }

    return { err, response };
  }

  static isTaskLocked( id, cb ) {
    DBUtils._get( 'isTaskLocked', { id }, ( error, json ) => {
      if ( error ) {
        return cb( error.message );
      }

      const { err, response } = DBUtils._parseResponse( json );
      cb( err, response );
    } );
  }

  static areTasksLocked( ids, cb ) {
    DBUtils._get( 'areTasksLocked', { ids: ids.join( ',' ) }, ( error, json ) => {
      if ( error ) {
        return cb( error.message );
      }

      const { err, response } = DBUtils._parseResponse( json );
      cb( err, response );
    } );
  }

}
