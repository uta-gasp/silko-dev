import Recordable from './commons/recordable.js';
import db from './db.js';

export default class Intro {
    constructor( id, name, owner ) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.lines = [];
    }

    static get db() {
        return 'intros';
    }

    updateText( text ) {
        const lines = text.split( '\n' ).map( line => line.trim() );
        db.update( `${Intro.db}/${this.id}/lines`, lines, cb );
    }
}

Recordable.apply( Intro );
