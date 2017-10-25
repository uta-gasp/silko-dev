/**
   * @typedef {Object} SelectionBoxItemArg
   * @property {string} id 
   * @property {string} text 
   * @property {any} selected 
   * @property {string} [group]
   */

export default class SelectionBoxItem {

  /**
   * @param {SelectionBoxItem} param0 
   */
  constructor( { id, text, selected, group } ) {
    this.id = id;               // String
    this.text = text;           // String
    this.selected = !!selected; // Boolean
    this.group = group;         // String | undefined
  }

};
