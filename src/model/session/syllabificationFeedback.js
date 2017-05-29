import Feedback from './feedback.js';

export default class SyllabificationFeedback extends Feedback {
    constructor( enabled = false, threshold = 3000, hyphen = '-' ) {
        super( enabled, threshold );
        this.hyphen = hyphen;       // string
    }
}
