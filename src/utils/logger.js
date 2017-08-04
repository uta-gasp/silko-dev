const enabled = !!window['webpackHotUpdate'];

function random( max, step = 1, min = 0) {
    min = Math.ceil( min );
    max = Math.floor( max );
    let result = Math.round( Math.random() * (max - min) );
    result = Math.round( result / step ) * step;
    return result + min + 0;
}

class Logger {

    constructor( name ) {
        this.name = name;
        this.enabled = true;
        this.format = [
            `background: hsl( ${random(360, 10)}, ${random(100, 20)}%, ${random(100, 20)}% )`,
            'display: inline-block'
        ].join(';');

        this.info( `${this.name}: __module_created___` );
    }

    info() {
        if (this.enabled) {
            const args = this._stringify( arguments );
            console.info( `%c  `, this.format, this._format( args ) );
        }
    }

    ok() {
        if (this.enabled) {
            const args = this._stringify( arguments );
            console.log( `%c  `, this.format, this._format( args ) );
        }
    }

    error() {
        if (this.enabled) {
            const args = this._stringify( arguments );
            console.error( `%c  `, this.format, this._format( args ) );
        }
    }

    _stringify( args ) {
        return Array.from( args ).map( arg => (typeof arg === 'object' ? JSON.stringify( arg ) : arg ) ).join( ' ' );
    }

    _format( args ) {
        return `${this.name}: ${args}`;
    }

}

export default function( module ) {
    return enabled ? new Logger( module ) : { info() {}, ok() {}, error() {} };
};
