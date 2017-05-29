import Feedback from './feedback.js';

export default class SpeechFeedback extends Feedback {
    constructor( enabled = false, threshold = 3000 ) {
        super( enabled, threshold );
    }
}
