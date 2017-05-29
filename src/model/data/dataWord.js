export default class DataWord {
    constructor( text, rect, page, focusing, interaction ) {
        this.text = text;           // string
        this.rect = rect;           // Rect
        this.page = page;           // id
        this.focusing = focusing;   // WordFocusing
        this.feedback = feedback;   // WordFeedback
    }
}
