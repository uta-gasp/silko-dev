export default class Rect {

    constructor( x, y, width, height ) {
        this.x = x;             // px
        this.y = y;             // px
        this.width = width;     // px
        this.height = height;   // px
    }

    static from( el ) {
        if (!el) {
            return null;
        }

        const rect = el.getBoundingClientRect();
        return new Rect( Math.round( rect.x ), Math.round( rect.y ),
            Math.round( rect.width ), Math.round( rect.height ) );
    }

}
