export default class Fixation {
    constructor( ts, tsSync, x, y, duration ) {
        this.ts = ts;               // ms
        this.tsSync = tsSync;       // ms
        this.x = x;                 // px
        this.y = y;                 // px
        this.duration = duration;   // ms
    }

    static from( etudFixation, ts ) {
        return new Fixation(
            etudFixation.ts,
            ts,
            Math.round( etudFixation.x ),
            Math.round( etudFixation.y ),
            etudFixation.duration
        );
    }
}