/**
 * @typedef {Object} SelectionBoxItemArg
 * @property {string} id 
 * @property {string} text 
 * @property {any} selected 
 * @property {string} [group]
 */

export default class SelectionBoxItem {

  constructor( /** @type {SelectionBoxItemArg} */ { id = '', text = '', selected = false, group = '' } ) {
    /** @type {string} */
    this.id = id;
    /** @type {string} */
    this.text = text;
    /** @type {boolean} */
    this.selected = !!selected;
    /** @type {string} */
    this.group = group;
  }

};
