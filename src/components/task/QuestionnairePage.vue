<template lang="pug">
  #questionnaire-page
    section.section
      .container
        h2.title.is-3 Questionnaire
        .content.is-large
          p {{ question.question }}

        .answers
          button.button.answer.is-large.is-light(v-for="answer in question.answers" @click="reply( answer )") {{ answer }}
</template>

<script>

  export default {
    name: 'questionnaire-page',

    data() {
      return {
        questionIndex: 0,
        questions: this.questionnaire.map( question => Object.assign( { answer: null }, question ) )
      };
    },

    props: {
      questionnaire: {
        type: Array,
        required: true,
        default: () => []
      }
    },

    computed: {
      question() {
        return this.questionIndex >= 0 && this.questionIndex < this.questions.length ?
          this.questions[ this.questionIndex ] : {};
      }
    },

    methods: {
      reply( answer ) {
        this.question.answer = answer;

        if (this.questionIndex === this.questions.length - 1) {
          return this.$emit( 'finished', { questions: this.questions } );
        }

        this.questionIndex++;
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
    display: block;
    width: 100%;
    height: auto;
    margin: 2px auto;
    white-space: normal;
  }

</style>