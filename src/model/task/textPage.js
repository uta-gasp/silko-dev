export default class TextPage {

  /**
   * @param {number | string} id 
   */
  constructor( id ) {
    this.id = id;       // index
    this.lines = [];    // [String]
    this.images = [];   // [TextPageImage]
  }

};
