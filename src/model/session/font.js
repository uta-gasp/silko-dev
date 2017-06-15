export default class Font {
    constructor( family, size, style, weight ) {
        this.family = family;   // string
        this.size = size;       // string
        this.style = style;     // string
        this.weight = weight;   // number | string
    }

    static from( style ) {
        return new Font(
            style['font-family'],
            style['font-size'],
            style['font-style'],
            style['font-weight']
        );
    }
}
