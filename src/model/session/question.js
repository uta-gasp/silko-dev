export class QuestionType {
  /**
   * @param {string} name 
   * @param {string} text 
   */
  constructor( name, text) {
    this.name = name;
    this.text = text;
  }
}

const TYPES = {
  text: new QuestionType( 'text', 'whole text' ),
  word: new QuestionType( 'word', 'long-gazed word' ),
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
    /** @type {AnswerCandidate} */
    this.answer = null;
  }

  /** @returns {Record<string, QuestionType>} */
  static get types() {
    return TYPES;
  }

};
