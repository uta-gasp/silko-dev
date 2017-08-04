export default class Feedback {

    constructor( options ) {
        this.enabled = options.enabled;         // boolean
        this.language = options.language;       // boolean
        this.threshold = {
            value: options.threshold.value,     // int
            smart: options.threshold.smart,     // boolean
            adjustForWordLength: options.threshold.adjustForWordLength, // boolean
        };
    }

}
