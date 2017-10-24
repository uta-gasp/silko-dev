export default class SelectionBoxItem {

  /**
   * @param {Object} param0 
   * @param {string} param0.id 
   * @param {string} param0.text 
   * @param {any} param0.selected 
   * @param {string} [param0.group]
   */
  constructor( { id, text, selected, group } ) {
    this.id = id;               // String
    this.text = text;           // String
    this.selected = !!selected; // Boolean
    this.group = group;         // String | undefined
  }

};
