<template lang="pug">
  #questionnaire-page
    section.section
      .container
        .content.is-large
          p {{ question.question }}

        .answers
          button.button.answer.is-large.is-light(
            :class="asnwerRevealedClass( answer )"
            v-for="answer in question.answers"
            @click="reply( answer )") {{ answer.text }}
</template>

<script>
  import Question from '@/model/session/question.js';

  export default {
    name: 'questionnaire-page',

    data() {
      return {
        questionIndex: 0,
        questions: this.questionnaire
            .map( question => Object.assign( { answer: null }, question ) )
            .filter( question => question.type === Question.types.text.name || this.longGazedWords.includes( question.word ) )
      };
    },

    props: {
      questionnaire: {
        type: Array,
        required: true,
        default: () => []
      },
      longGazedWords: {
        type: Array,
        default: () => []
      }
    },

    computed: {
      question() {
        return this.questionIndex >= 0 && this.questionIndex < this.questions.length
          ? this.questions[ this.questionIndex ] : {};
      },
    },

    methods: {
      asnwerRevealedClass( answer ) {
        return {
          'is-success': this.question.answer && this.question.answer.text === answer.text && answer.isCorrect,
          'is-danger': this.question.answer && this.question.answer.text === answer.text && !answer.isCorrect
        };
      },

      reply( answer ) {
        if (this.question.answer) {
          return;
        }

        this.question.answer = answer;

        window.setTimeout( () => {
          if (this.questionIndex === this.questions.length - 1) {
            this.$emit( 'finished', { questionnaire: this.questions } );
            return;
          }

          this.questionIndex++;
        }, 2000 );
      }
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
