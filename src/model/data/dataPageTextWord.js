import Rect from './rect.js';

export default class DataPageTextWord {

  /**
   * @param {number} id 
   * @param {string} text 
   * @param {Rect} rect 
   */
  constructor( id, text, rect ) {
    this.id = id;
    this.text = text;
    this.rect = rect;
  }

  /**
   * @param {Element} el 
   * @param {number} id 
   * @returns {DataPageTextWord}
   */
  static from( el, id ) {
    return el ? new DataPageTextWord( id, el.textContent, Rect.from( el ) ) : null;
  }

  /**
   * @param {string} selector - CSS selector
   * @returns {DataPageTextWord[]}
   */
  static fromAll( selector ) {
    const list = [];
    const words = document.querySelectorAll( selector );

    for ( let i = 0; i < words.length; i += 1 ) {
      const word = words.item( i );
      list.push( DataPageTextWord.from( word, i ) );
    }

    return list;
  }

}
