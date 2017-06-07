export default class WordFocusing {
    constructor() {
        this.count = 0;      // int
        this.first = 0;      // ms
        this.last = 0;       // ms
        this.duration = 0;   // ms
    }

    start( ts ) {
        this.last = ts;
        if (!this.count) {
            this.first = this.last;
        }
        this.count++;
    }

    stop( ts ) {
        this.duration += ts - this.last;
    }
}
