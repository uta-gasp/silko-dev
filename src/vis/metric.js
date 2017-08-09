function mapDurationToAlpha( word, maxDuration ) {
  let result = 0;
  if ( word.duration > DURATION_TRANSPARENT ) {
    result = ( word.duration - DURATION_TRANSPARENT ) / ( maxDuration - DURATION_TRANSPARENT );
  }
  return result;
}

function mapCharSpeedTAlpha( word, maxCharSpeed ) {
  let result = 0;
  if ( word.charSpeed > 0 ) {
    result = 1 - word.charSpeed / maxCharSpeed;
  }
  return result;
}

function mapSyllableSpeedToAlpha( word, maxSyllableSpeed ) {
  let result = 0;
  if ( word.syllableSpeed > 0 ) {
    result = 1 - word.syllableSpeed / maxSyllableSpeed;
  }
  return result;
}

const alphaComputers = [
  () => 0,      // for NONE
  mapDurationToAlpha,
  mapCharSpeedTAlpha,
  mapSyllableSpeedToAlpha,
];

const DURATION_TRANSPARENT = 100;

const Type = {
  NONE: 0,
  DURATION: 1,
  CHAR_SPEED: 2,
  SYLL_SPEED: 3,
};

export default class Metric {

  static compute( words, metricType ) {
    let maxRange = 0;

    words.forEach( word => {
      if ( word.fixations ) {
        const params = word.fixations.reduce( ( sum, fix ) => {
          sum.duration += fix.duration;
          sum.regressionCount += fix.isRegression ? 1 : 0;
          return sum;
        }, {
          duration: 0,
          regressionCount: 0,
        } );

        // const wordText = syllabifier.unprepare( word.text );
        word.duration = params.duration;
        word.regressionCount = params.regressionCount;
        word.charSpeed = 0; // 1000 * wordText.length / word.duration;
        word.syllableSpeed = 0; // 1000 * syllabifier.syllables( wordText ).length / word.duration;

        let metricValue = 0;
        switch ( metricType ) {
        case Metric.Type.DURATION:
          metricValue = word.duration;
          break;
        case Metric.Type.CHAR_SPEED:
          metricValue = word.charSpeed;
          break;
        case Metric.Type.SYLL_SPEED:
          metricValue = word.syllableSpeed;
          break;
        }

        if ( maxRange < metricValue ) {
          maxRange = metricValue;
        }
      }
    } );

    return maxRange;
  }

  static getAlpha( word, metricType, metricRange ) {
    return alphaComputers[ metricType ]( word, metricRange );
  }

  static get Type() {
    return Type;
  }

};
