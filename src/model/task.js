import Recordable from './commons/recordable.js';

import Intro from './intro.js';

import db from '@/db/db.js';

export default class Task {
    constructor( id ) {
        this.id = id;
        this.name = '';
        this.owner = '';
        this.cls = '';
        this.type = '';
        this.intro = '';
        this.pages = [];    // array of arrays of strings
        this.syllab = '';
        this.syllabExceptions = {};
        this.speech = '';
    }

    static get db() {
        return 'tasks';
    }

    static get hyphen() {
        return String.fromCharCode( 0x00B7 );
    }

    static get syllabSep() {
        return '=';
    }

    static textToPages( text ) {
        if (!text) {
            return [];
        }

        let page = [];
        const pages = [ page ];
        const lines = text.split( '\n' );

        lines.forEach( line => {
            line = line.trim();

            if (!line) {
                if (page.length > 0) {
                    page = [];
                    pages.push( page );
                }
                return;
            }

            page.push( line );
        });

        if (!page.length) {
            pages.pop();
        }

        return pages;
    }

    static pagesToText( pages ) {
        return pages.map( page => page.join( '\n' ) ).join( '\n\n' );
    }

    static textToSyllabs( text ) {
        if (!text) {
            return {};
        }

        const result = {};
        const lines = text.split( '\n' );

        lines.forEach( line => {
            line = line.trim();
            const parts = line.split( Task.syllabSep );
            if (parts.length != 2) {
                return;
            }

            const word = parts[0].trim();
            const syllabText = parts[1].trim();
            if (!word || !syllabText || word.split( ' ' ).length > 1) {
                return;
            }

            const syllabs = syllabText.split( ' ' ).filter( item => item.length );

            result[ word ] = syllabs.join( Task.hyphen );
        });

        return result;
    }

    static syllabsToText( syllabs ) {
        const result = [];
        for (let word in syllabs) {
            const parts = syllabs[ word ].split( Task.hyphen );
            result.push( `${word}${Task.syllabSep}${parts.join( ' ' )}` );
        }
        return result.join( '\n' );
    }

    update( task, cb ) {
        db.updateFields( this, {
            intro: task.intro,
            pages: Task.textToPages( task.text ),
            syllab: task.syllab,
            syllabExceptions: Task.textToSyllabs( task.syllabExceptions ),
            speech: task.speech
        }, cb);
    }

    getIntro( cb ) {
        return db.get( Intro, this.intro, cb );
    }
}

Recordable.apply( Task );
