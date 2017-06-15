export default class WordFocus {
    constructor( el ) {
        this.accumulatedTime = 0;
        this.focusCount = 1;
        this.syllabified = false;
        this.pronounced = false;
        this.word = this._getWordFromElement( el );
    }

    _getWordFromElement( el ) {
        const textNodes = Array.from( el.childNodes ).filter( node =>
            node.nodeType === Node.TEXT_NODE ||
            !node.classList.contains( 'hyphens' )
        );

        return textNodes[0].textContent.trim();
    }
}
