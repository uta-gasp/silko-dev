<template lang="pug">
  #questionnaire-page
    section.section
      .container(v-if="question")
        .content.is-large
          p {{ question.question }}

        .answers
          button.button.answer.is-large.is-light(
            :class="asnwerRevealedClass( answer )"
            v-for="answer in question.answers"
            @click="reply( answer )") {{ answer.text }}
</template>

<script>
import { Question, AnswerCandidate } from '@/model/session/question.js';

/**
 * @fires finished
 */
export default {
  name: 'questionnaire-page',

  data() {
    return {
      questionIndex: 0,
      /** @type {Question[]} */
      questions: /** @type {Question[]} */ (this.questionnaire)
        .map( question => Object.assign( { answer: null }, question ) )
        .filter( question => question.type === Question.types.text.name || /** @type {string[]} */ (this.longGazedWords).includes( question.word ) ),
    };
  },

  props: {
    questionnaire: {
      type: Array,
      required: true,
      default: /** @returns {Array} */ () => [],
    },
    longGazedWords: {
      type: Array,
      default: /** @returns {Array} */ () => [],
    },
  },

  computed: {
    /** @returns {Question} */
    question() {
      return this.questionIndex >= 0 && this.questionIndex < this.questions.length ?
          this.questions[ this.questionIndex ] : null;
    },
  },

  methods: {
    /** 
     * @param {AnswerCandidate} answer
     * @returns {object} 
     */
    asnwerRevealedClass( answer ) {
      return {
        'is-success': this.question.answer && this.question.answer.text === answer.text && answer.isCorrect,
        'is-danger': this.question.answer && this.question.answer.text === answer.text && !answer.isCorrect,
      };
    },

    /** 
     * @param {AnswerCandidate} answer
     */
    reply( answer ) {
      if ( this.question.answer ) {
        return;
      }

      this.question.answer = answer;

      window.setTimeout( () => {
        if ( this.questionIndex === this.questions.length - 1 ) {
          this.$emit( 'finished', { questionnaire: this.questions } );
          return;
        }

        this.questionIndex++;
      }, 2000 );
    },
  },
};
</script>

<style lang="less" scoped>

  .answers {
    min-width: 250px;
    max-width: 400px;
    margin: 0 auto;
  }

  .answer {
    display: flex;
    width: 100%;
    height: auto;
    line-height: 1.25em;
    margin: 2px auto;
    white-space: normal;
  }

</style>
