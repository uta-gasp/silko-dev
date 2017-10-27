/**
 * @typedef {Object} QuestionType
 * @property {string} name
 * @property {string} text
 */

const TYPES = {
  text: { name: 'text', text: 'whole text' },
  word: { name: 'word', text: 'long-gazed word' },
};

/**
 * @typedef {Object} AnswerCandidate
 * @property {string} text
 * @property {boolean} isCorrect
 */
export default class Question {

  /**
   * @param {string} type - a key from 'Question.types'
   * @param {string} word 
   * @param {string} question 
   * @param {AnswerCandidate[]} answers 
   */
  constructor( type, word, question, answers ) {
    this.type = type;
    this.word = word;
    this.question = question;
    this.answers = answers;
  }

  /** @returns {object} - QuestionType */
  static get types() {
    return TYPES;
  }

};
