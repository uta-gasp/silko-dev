import Recordable from './commons/recordable.js';
import db from './db.js';

export default class Intro {
    constructor( id, name, owner ) {
        this.id = id;
        this.owner = owner;
        this.name = name;
        this.calibInstruction = '';
        this.startInstruction = '';
        this.firstPage = [];
    }

    static get db() {
        return 'intros';
    }

    static validateTexts( texts ) {
        if (!texts) {
            return {
                calibInstruction: '',
                startInstruction: '',
                firstPage: []
            };
        }
        else {
            return {
                calibInstruction: texts.calibInstruction || '',
                startInstruction: texts.startInstruction || '',
                firstPage: texts.firstPage ? texts.firstPage.split( '\n' ).map( line => line.trim() ) : []
            };
        }
    }

    firstPageAsText() {
        return this.firstPage ? this.firstPage.join( '\n' ) : '';
    }

    updateTexts( texts, cb ) {
        const fields = Intro.validateTexts( texts );
        this.calibInstruction = fields.calibInstruction;
        this.startInstruction = fields.startInstruction;
        this.firstPage = fields.firstPage;

        db.updateFields( this, fields, cb );
    }
}

Recordable.apply( Intro );
