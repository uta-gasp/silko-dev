export default class Fixation {
    constructor( ts, tsSynch, x, y, duration ) {
        this.ts = ts;               // ms
        this.tsSynch = tsSynch;     // ms
        this.x = x;                 // px
        this.y = y;                 // px
        this.duration = duration;   // ms
    }
}