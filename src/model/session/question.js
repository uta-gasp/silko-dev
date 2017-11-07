/**
 * @typedef {Object} QuestionType
 * @property {string} name
 * @property {string} text
 */

const TYPES = {
  text: { name: 'text', text: 'whole text' },
  word: { name: 'word', text: 'long-gazed word' },
};

export class AnswerCandidate {

  /**
   * @param {string} text 
   * @param {boolean} isCorrect 
   */
  constructor( text, isCorrect ) {
    this.text = text;
    this.isCorrect = isCorrect;
  }

}

export class Question {

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

  /** @returns {Record<string, QuestionType>} */
  static get types() {
    return TYPES;
  }

};
