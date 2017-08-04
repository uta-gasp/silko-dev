const TYPES = {
    text: { name: 'text', text: 'whole text' },
    word: { name: 'word', text: 'long-gazed word' },
};

export default class Question {

    constructor( type, word, question, answers ) {
        this.type = type;
        this.word = word;
        this.question = question;
        this.answers = answers;
    }

    static get types() {
        return TYPES;
    }

};
