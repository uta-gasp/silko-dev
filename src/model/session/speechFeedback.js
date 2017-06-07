import Feedback from './feedback.js';

export default class SpeechFeedback extends Feedback {
    constructor( enabled, threshold ) {
        super( enabled, threshold );
    }
}
