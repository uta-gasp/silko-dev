export default class WordFocus {

  /**
   * @param {HTMLElement} el
   */
  constructor( el ) {
    this.accumulatedTime = 0;
    this.focusCount = 0;        // count of fixations > 150ms
    this.focusRecorded = false;
    this.entries = 1;
    this.lastSample = window.performance.now();
    this.syllabified = false;
    this.pronounced = false;
    this.word = this._getWordFromElement( el );
  }

  /**
   * @param {HTMLElement} el 
   * @returns {string}
   */
  _getWordFromElement( el ) {
    const textNodes = Array.from( el.childNodes ).filter( node => {
      if ( node.nodeType === window.Node.TEXT_NODE ) {
        return true;
      }
      if ( node.nodeType === window.Node.ELEMENT_NODE ) {
        return !node.classList.contains( 'hyphens' );
      }
      return false;
    } );

    return textNodes.map( node => node.textContent.trim() ).join( '' );
    // return textNodes[0].textContent.trim();
  }

};
