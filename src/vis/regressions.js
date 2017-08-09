export default class Regressions {

  // adds "isRegression: Boolean" to fixations that
  // returns the number of regressions
  static compute( mappedFixations ) {
    let regressionCount = 0;
    let lastWordID = -1;
    let isPrevFixProgressive = true;

    mappedFixations.forEach( fix => {
      if ( !fix.word ) {
        lastWordID = -1;
        isPrevFixProgressive = true;
        return;
      }

      const direction = fix.word.id - lastWordID;
      if ( direction < 0 ) {
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
    } );

    return regressionCount;
  }

};
