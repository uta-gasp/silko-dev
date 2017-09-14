function mapDurationToAlpha( word, maxDuration ) {
  let result = 0;
  if ( word.focusing && word.focusing.duration > DURATION_TRANSPARENT ) {
    result = ( word.focusing.duration - DURATION_TRANSPARENT ) / ( maxDuration - DURATION_TRANSPARENT );
  }
  return result;
}

function mapCharSpeedTAlpha( word, maxCharSpeed ) {
  let result = 0;
  if ( word.reading && word.reading.charSpeed > 0 ) {
    result = 1 - word.reading.charSpeed / maxCharSpeed;
  }
  return result;
}

function mapFocusCountToAlpha( word, mapFocusCount ) {
  let result = 0;
  if ( word.focusing && word.focusing.count > 0 ) {
    result = 1 - word.focusing.count / mapFocusCount;
  }
  return result;
}

// function mapSyllableSpeedToAlpha( word, maxSyllableSpeed ) {
//   let result = 0;
//   if ( word.reading && word.reading.syllableSpeed > 0 ) {
//     result = 1 - word.reading.syllableSpeed / maxSyllableSpeed;
//   }
//   return result;
// }

const DURATION_TRANSPARENT = 100;

const Type = {
  NONE: 'none',
  DURATION: 'duration',
  CHAR_SPEED: 'char speed',
  FOCUS_COUNT: 'focus count',
  // SYLL_SPEED: 'syllable speed',
};

const alphaComputers = new Map();
alphaComputers.set( Type.NONE, () => 0 );
alphaComputers.set( Type.DURATION, mapDurationToAlpha );
alphaComputers.set( Type.CHAR_SPEED, mapCharSpeedTAlpha );
alphaComputers.set( Type.FOCUS_COUNT, mapFocusCountToAlpha );
// alphaComputers.set( Type.SYLL_SPEED, mapSyllableSpeedToAlpha );

export default class Metric {

  static computeRange( words, metricType ) {
    let maxRange = 0;

    if (metricType === Metric.Type.NONE ) {
      return maxRange;
    }

    words.forEach( word => {
      if ( word.focusing ) {
        // const wordText = syllabifier.unprepare( word.text );
        word.reading = {
          charSpeed: 1000 * word.text.length / word.focusing.duration,
          syllableSpeed: 1000 * word.text.length / 2.5 / word.focusing.duration,
        };

        let metricValue = 0;
        switch ( metricType ) {
        case Metric.Type.DURATION:
          metricValue = word.focusing.duration;
          break;
        case Metric.Type.CHAR_SPEED:
          metricValue = word.reading.charSpeed;
          break;
        case Metric.Type.FOCUS_COUNT:
          metricValue = word.focusing.count;
          break;
        // case Metric.Type.SYLL_SPEED:
        //   metricValue = word.reading.syllableSpeed;
        //   break;
        }

        if ( maxRange < metricValue ) {
          maxRange = metricValue;
        }
      }
    } );

    return maxRange;
  }

  static getAlpha( word, metricType, metricRange ) {
    return alphaComputers.get( metricType )( word, metricRange );
  }

  static get Type() {
    return Type;
  }

  static get Types() {
    const result = [];
    for (let key in Type) {
      result.push( Type[ key ] );
    }
    return result;
  }

};
