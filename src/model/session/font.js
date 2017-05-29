export default class Font {
    constructor( family = "Arial", size = "22pt", style = "normal", weight = 700 ) {
        this.family = family;   // string
        this.size = size;       // string
        this.style = style;     // string
        this.weight = weight;   // number | string
    }
}
