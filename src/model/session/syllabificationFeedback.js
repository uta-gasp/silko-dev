import Feedback from './feedback.js';

export default class SyllabificationFeedback extends Feedback {

    constructor( options ) {
        super( options );
        this.hyphen = options.hyphen;       // string
        this.mode = options.mode;           // string, a key from Syllabifier.MODES
        this.temporary = options.temporary; // boolean
    }

}
