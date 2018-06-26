// ts-check-only
import { Threshold } from './feedbacks';

export class FeedbackOptions {

  /** 
   * @param {boolean} enabled
   * @param {string} language
   * @param {Threshold} threshold
   */
  constructor( enabled = false, language = '', threshold = null ) {
    this.enabled = enabled;
    this.language = language;
    this.threshold = threshold;
  }

}

export class Feedback {

  /**
   * @param {FeedbackOptions} options 
   */
  constructor( options ) {
    this.enabled = options.enabled;
    this.language = options.language;
    this.threshold = Object.assign( {}, options.threshold );  /*{
      value: options.threshold.value,
      smart: options.threshold.smart,
      adjustForWordLength: options.threshold.adjustForWordLength,
    };*/
  }

}
