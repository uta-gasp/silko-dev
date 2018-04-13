export default class WordFont {

  /**
   * @param {string} color
   * @param {string} size 
   * @param {string} style 
   * @param {string} weight 
   */
  constructor( color, size, style, weight ) {
    this.color = color;
    this.size = size;
    this.style = style;
    this.weight = weight;
  }

  /**
   * @param {Element} el
   * @returns {WordFont}
   */
  static fromEl( el ) {
    const style = window.getComputedStyle( el );
    return new WordFont(
      style.color,
      style.fontSize,
      style.fontStyle,
      style.fontWeight
    );
  }

}
