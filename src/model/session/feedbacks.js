// ts-check-only
import SpeechFeedback from './speechFeedback';
import SyllabificationFeedback from './syllabificationFeedback';

export class Feedbacks {

  /**
   * @param {SpeechFeedback} speech 
   * @param {SyllabificationFeedback} syllabification 
   */
  constructor( speech, syllabification ) {
    this.speech = speech;
    this.syllabification = syllabification;
  }

}

export class SyllabOptions {

  constructor() {
    /** @type {string} */
    this.language = '';
    /** @type {object} - { 'original word': 'syllabified word' } */
    this.exceptions = {};
    /** @type {string} */
    this.mode = '';
    /** @type {boolean} */
    this.temporary = false;
    /** @type {Threshold} */
    this.threshold = null;
  }

  /**
   * @param {SyllabificationFeedback} feedback 
   * @returns {SyllabOptions}
   */
  static from( feedback ) {
    const result = new SyllabOptions();
    result.language = feedback.language;
    result.mode = feedback.mode;
    result.threshold = feedback.threshold;
    result.temporary = feedback.temporary;
    result.exceptions = feedback.exceptions;
    return result;
  }
}

export class SpeechOptions {

  constructor() {
    /** @type {string} */
    this.language = '';
    /** @type {Threshold} */
    this.threshold = null;
  }

}

export class Threshold {

  /**
   * @param {number} value 
   * @param {boolean} smart 
   * @param {number} min 
   * @param {number} max 
   * @param {boolean} adjustForWordLength 
   */
  constructor( value, smart, min, max, adjustForWordLength ) {
    this.value = value;
    this.smart = smart;
    this.min = min;
    this.max = max;
    this.adjustForWordLength = adjustForWordLength;
  }

};
