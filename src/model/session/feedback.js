export default class Feedback {
    constructor( enabled, threshold ) {
        this.enabled = enabled || false;     // bool
        this.threshold = threshold || 3000;  // int
    }
}
