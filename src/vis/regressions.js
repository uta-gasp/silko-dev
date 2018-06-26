/**
 * Word
 * @typedef {Object} Word
 * @property {number} id
 * @property {string} text
 */

/**
 * MappedFixation
 * @typedef {Object} MappedFixation
 * @property {number} ts
 * @property {number} duration
 * @property {number} line
 * @property {Word} word
 * @property {Boolean} isRegression
 */

export default class Regressions {

  /**
   * Adds "isRegression: Boolean" to fixations that
   * @param {MappedFixation[]} mappedFixations 
   * @returns {number} number of regressions
   */
  static compute( mappedFixations ) {
    let regressionCount = 0;
    let lastWordID = -1;
    let lastWordLine = -1;
    let isPrevFixProgressive = true;

    mappedFixations.forEach( fix => {
      if ( !fix.word ) {
        lastWordID = -1;
        lastWordLine = -1;
        isPrevFixProgressive = true;
        return;
      }

      const direction = fix.word.id - lastWordID;
      if ( direction < 0 && lastWordLine === fix.line ) {
        fix.isRegression = true;
        if ( isPrevFixProgressive ) {
          regressionCount++;
        }
        isPrevFixProgressive = false;
      }
      else {
        isPrevFixProgressive = true;
      }

      lastWordID = fix.word.id;
      lastWordLine = fix.line;
    } );

    return regressionCount;
  }

};
