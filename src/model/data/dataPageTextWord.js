import Rect from './rect.js';

export default class DataPageTextWord {

  constructor( id, text, rect ) {
    this.id = id;       // int (in text)
    this.text = text;   // string
    this.rect = rect;   // Rect
  }

  static from( el, id ) {
    return el ? new DataPageTextWord( id, el.textContent, Rect.from( el ) ) : null;
  }

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
