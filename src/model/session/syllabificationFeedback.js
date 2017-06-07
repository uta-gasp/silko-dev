import Feedback from './feedback.js';

export default class SyllabificationFeedback extends Feedback {
    constructor( enabled, threshold, hyphen ) {
        super( enabled, threshold );
        this.hyphen = hyphen;       // string
    }
}
