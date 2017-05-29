export default class DataPage {
    constructor( fixations, words, syllabifications, speech ) {
        this.fixations = fixations;                 // array of Fixation
        this.words = words;                         // array of DataWord
        this.syllabifications = syllabifications;   // array of FeedbackEvent
        this.speech = speech;                       // array of FeedbackEvent
    }
}
