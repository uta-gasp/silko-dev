export class Feedbacks {

  constructor( speech, syllabification ) {
    this.speech = speech;                   // SpeechFeedback
    this.syllabification = syllabification; // SyllabificationFeedback
  }

}

export class SyllabOptions {

  constructor() {
    this.language = '';
    this.exceptions = {};
    this.mode = '';
    this.temporary = false;
    this.threshold = null;
  }

}

export class SpeechOptions {

  constructor() {
    this.language = '';
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
