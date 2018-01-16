export default class Font {

  /**
   * @param {string} family 
   * @param {string} size 
   * @param {string} style 
   * @param {string} weight 
   */
  constructor( family, size, style, weight ) {
    this.family = family;
    this.size = size;
    this.style = style;
    this.weight = weight;
  }

  /**
   * @param {Object.<string,string>} style 
   * @returns {Font}
   */
  static from( style ) {
    console.log(style);
    return new Font(
      style['font-family'],
      style['font-size'],
      style['font-style'],
      style['font-weight']
    );
  }

}
