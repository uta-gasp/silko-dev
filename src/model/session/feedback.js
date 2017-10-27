// ts-check-only
import { Threshold } from './feedbacks';

/**
 * @typedef {Object} FeedbackOptions
 * @property {boolean} enabled
 * @property {string} language
 * @property {Threshold} threshold
 */

export default class Feedback {

  /**
   * @param {FeedbackOptions} options 
   */
  constructor( options ) {
    this.enabled = options.enabled;
    this.language = options.language;
    this.threshold = {
      value: options.threshold.value,
      smart: options.threshold.smart,
      adjustForWordLength: options.threshold.adjustForWordLength,
    };
  }

}
