export default class SelectionBoxItem {

    constructor( { id, text, selected, group } ) {
        this.id = id;       // any
        this.text = text;   // String
        this.selected = !!selected; // Boolean
        this.group = group; // String | undefindex
    }

};
