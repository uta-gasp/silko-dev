import DataCollector from '../../src/utils/dataCollector.js';
const dataCollector = new DataCollector();

// Pages

let pageIndex = -1;
const pages = [
    'She was very young at this age',
    'This is the second page'
].map( page => {
    return page.split(' ').map( word => `<span class="word">${word}</span>` ).join( '&nbsp;');
});

// Actions

class Action {
    constructor( delay, fn ) {
        this.delay = delay;
        this.fn = fn;
    }

    run( cb ) {
        setTimeout( () => {
            this.fn();
            cb();
        }, this.delay );
    }
};

function nextPage() {
    return () => {
        pageIndex++;
        console.log( 'nextPage', pageIndex );
        document.querySelector( '#text' ).innerHTML = pages[ pageIndex ];

        if (pageIndex < 0) {
            dataCollector.start();
        }
        else {
            dataCollector.nextPage();
        }
    };
}
function focus( index ) {
    return () => {
        const word = document.querySelector( `.word:nth-child(${index})` );
        console.log( 'focus', index, word ? word.textContent : '???' );
        dataCollector.setFocusedWord( word, pageIndex );
    };
}
function unfocus() {
    return () => {
        console.log( 'unfocus' );
        dataCollector.setFocusedWord( null );
    };
}
function syllabify( index ) {
    return () => {
        const word = document.querySelector( `.word:nth-child(${index})` );
        console.log( 'syllabify', index, word ? word.textContent : '???' );
        dataCollector.syllabified( word );
    };
}

function run( index ) {
    const action = actions[ index ];
    if (!action) {
        clearInterval( sampleTimer );
        dataCollector.stop( result => {
            console.log( 'stopped ');
            console.dir(result);
        });
        return; // finished
    }

    action.run( () => {
        run( index + 1 );
    });
}

// Sample generator

let ts = 500;
let x = 0;
let y = 0;
let fixSize = 0;
function sample() {
    if (fixSize > 30) {
        x += 20;
        ts += fixSize * 30;
        fixSize = 0;
    }

    fixSize++;
    const sample = { ts, x, y, duration: fixSize * 30 };

    if (pageIndex >= 0) {
        dataCollector.addGazePoint( sample, pageIndex );
    }
}


// Sequence of events

const actions = [
    new Action( 500, nextPage() )
];

for (let i = 1; i <= 3; i++) {
    actions.push( new Action( 200, focus(i) ) );
    actions.push( new Action( 1000, unfocus() ) );
}

actions.push( new Action( 1000, focus(4) ) );
actions.push( new Action( 3000, syllabify(4) ) );
actions.push( new Action( 500, unfocus() ) );

for (let i = 3; i <= 7; i++) {
    actions.push( new Action( 200, focus(i) ) );
    actions.push( new Action( 1000, unfocus() ) );
}

actions.push( new Action( 1000, nextPage() ) );

for (let i = 1; i <= 5; i++) {
    actions.push( new Action( 200, focus(i) ) );
    actions.push( new Action( 1000, unfocus() ) );
}

// Run

run(0);

let sampleTimer = setInterval( sample, 30 );