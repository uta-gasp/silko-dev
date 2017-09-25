// TODO remove the first line, uncomment the other
// const config = require( `@/config/db.development.js` ).config;
const config = require( `@/config/db.${process.env.NODE_ENV}.js` ).config;

const path = `https://us-central1-${config.projectId}.cloudfunctions.net/`;

export default class DBUtils {
    static _get( fnc, params, cb ) {
        const headers = new Headers();
        headers.append( 'Content-Type', 'text/json' );

        const init = {
            method: 'GET',
            headers: headers,
            mode: 'cors',
            cache: 'no-cache'
        };

        const query = [];
        for (let name in params) {
            query.push( `${name}=${params[name]}` );
        }

        const request = new Request( path + fnc + '?' + query.join( '&' ) );

        if (window.fetch) {
            window.fetch( request, init ).then( response => {
                if (!response) {
                    return cb( { err: "not response" } );
                }
                return response.json();
            }).then( response => {
                cb( response );
            }).catch( err => {
                console.error( err );
            });
        }
        else {
            cb( { err: "not supported" } );
        }
    }

    static _parseResponse( json ) {
        let err = null;
        let response = null;

        try {
            response = typeof json === 'string' ? JSON.parse( json ) : json;

            if (!response || response.err || !('result' in response)) {
                err = response.err || 'no result';
            }
            else {
                response = response.result;
            }
        }
        catch (e) {
            err = e && e.message ? e.message : 'unknown error';
        }

        return { err, response };
    }

    static isTaskLocked( id, cb ) {
        DBUtils._get( 'isTaskLocked', { id }, json => {
            const { err, response } = DBUtils._parseResponse( json );
            cb( err, response );
        });
    }

    static areTasksLocked( ids, cb ) {
        DBUtils._get( 'areTasksLocked', { ids: ids.join( ',' ) }, json => {
            const { err, response } = DBUtils._parseResponse( json );
            cb( err, response );
        });
    }
}
