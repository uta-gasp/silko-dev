<template lang="pug">
  #task-editor-questionnaire
    nav.panel
      //- p.panel-heading.has-text-centered Question
      .panel-block
        .field.control
          p.control
            .columns.is-inlined
              .column.is-narrow
                .control-line For
                .select
                  select(v-model="type")
                    option(v-for="item in types" :value="item") {{ item.text }}
              .column
                input.input(type="text" placeholder="Word" v-model="word" v-show="type === types.word")
          p.control
            input.input(type="text" placeholder="Question" v-model="question")
          p.control
            .columns.is-inlined
              .column(v-for="answer in answers")
                p.control.has-icon
                  input.input(type="text" placeholder="answer" v-model="answer.text")
                  template(v-if="answer.text")
                    span.icon.is-small.is-left.checkbox(v-if="!answer.isCorrect")
                      i.fa.fa-check(@click="selectCorrect( answer )")
                    span.icon.is-small.is-left.checkbox.is-success(v-else)
                      i.fa.fa-check-circle(@click="selectCorrect( answer )")
          p.control
            button.button.is-primary(:disabled="!canAdd" @click="add") Add

      .panel-block.questions.is-paddingless
        table.table
          tbody
            tr(v-for="question in questions" :key="question.question")
              td.is-narrow
                template(v-if="question.type === 'word'")
                  p.word.is-inline-block {{ question.word }}
                template(v-else)
                  .heading.is-inline-block {{ question.type }}
              td
                span.is-inline-block {{ question.question }}
                //- i.is-inline-block.is-pulled-right.answers {{ answersToString( question ) }}
                i.is-inline-block.is-pulled-right.answers
                  span.answer(:class="{ 'is-correct': answer.isCorrect }" v-for="answer in question.answers") {{ answer.text }}
              td.is-narrow
                button.button.is-danger(@click="remove( question )")
                  i.fa.fa-remove

</template>

<script>
import Question from '@/model/session/question.js';

export default {
  name: 'task-editor-questionnaire',

  data() {
    return {
      type: '',
      word: '',
      question: '',
      answers: [],

      questions: this.task ? Array.from( this.task.questionnaire ) : [],

      types: Question.types,
    };
  },

  props: {
    task: {
      type: Object,
      default: () => { return {}; },
    },
  },

  computed: {
    canAdd() {
      return this.type === this.types.word ? this.word.length > 0 : true &&
          this.question.length > 5 &&
          this.answers.every( answer => answer.text.length );
    },

    model() {
      return {
        questionnaire: this.questions,
      };
    },
  },

  watch: {
    questions() {
      this.$emit( 'input', this.model );
    },
  },

  methods: {
    answersToString( question ) {
      return question.answers.map( answer => answer.text ).join( ', ' );
    },

    getEmptyAnswers() {
      return ['', '', '', ''].map( ( _, index ) => ( { text: '', isCorrect: index === 0 } ) );
    },

    add( e ) {
      this.questions.push( new Question(
        this.type.name,
        this.type === this.types.word ? this.word : '',
        this.question,
        this.answers,
      ) );

      this.word = '';
      this.question = '';
      this.answers = this.getEmptyAnswers();
    },

    remove( question ) {
      this.questions = this.questions.filter( item => item !== question );
    },

    selectCorrect( answer ) {
      this.answers.forEach( answer => { answer.isCorrect = false; } );
      answer.isCorrect = true;
    },
  },

  created() {
    this.type = this.types.text;
    this.answers = this.getEmptyAnswers();
  },
};
</script>

<style lang="less" scoped>

  .label:not(:last-child) {
    margin-bottom: 0;
  }

  .control-line {
    display: inline-block;
    margin: 0 0.5em 0 0;
    line-height: 2.25em;
    vertical-align: middle;
    white-space: nowrap;
  }

  .is-inlined,
  .is-inlined .column {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .questions {
    overflow-y: auto;
    max-height: 240px;
    display: block;
  }

  .answers {
    font-size: 0.8em;
  }

  .is-correct {
    color: #23d160;
  }

  .answer + .answer:before {
    content: ', ';
    color: black;
  }

  // overwrite Bulma
  .control.has-icon .input:focus + .icon {
    color: #dbdbdb;
  }

  .control.has-icon .input + .icon.is-success,
  .control.has-icon .input:focus + .icon.is-success {
    color: #23d160;
  }

  .control.has-icon .icon.checkbox {
    pointer-events: auto;
  }

  // --- end ---

  .column:not(:first-of-type) {
    padding-left: 0.25em;
  }

  .column:not(:last-of-type) {
    padding-right: 0.25em;
  }

  .table {
    margin-bottom: 0;

    td,
    th {
      border: 1px solid #dbdbdb;
      // border: 1px solid red;
      border-width: 1px 0;

      line-height: 1.75em;
      vertical-align: middle;

      &:first-of-type {
        background-color: whitesmoke;
        border-right-width: 1px;
      }

      .word {
        word-break: break-all;
        display: block;
        min-width: 5em;
        white-space: normal;
      }
    }

    tr:first-of-type td {
        // border-top-width: 0;
    }
  }

</style>
