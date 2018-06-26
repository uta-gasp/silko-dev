<template lang="pug">
  #questionnaire-results
    .list(v-if="questionnaire")
      table.table
        thead
          tr
            th Student
            th.is-narrow Date
            th(v-for="question in questionnaire.questions") {{ question }}
            th.is-narrow Total
            //- th(v-for="record in data.records") {{ getRecordName( record ) }}

        tbody
          tr(v-for="(answers, id) in questionnaire.sessions")
            td {{ id | name }}
            td.is-narrow {{ id | date }}
            td.is-paddingless(v-for="question in questionnaire.questions")
              .answer(:class="getAnswerClass( answers, question )") {{ getAnswerText( answers, question ) }}
            td.is-narrow
              .total {{ getTotal( answers ) }}

    control-panel(
      :title="title"
      @close="close")

</template>

<script>
import DataUtils from '@/utils/data-utils.js';

import ControlPanel from '@/components/vis/controlPanel.vue';

// ts=check-onlt
import { AnswerCandidate } from '@/model/session/question.js';
import VisDataRecord from '@/vis/data/record.js';
import VisData from '@/vis/data/data.js';

/**
 * @typedef {Object.<string, AnswerCandidate>} Answers
 */

/**
 * @typedef {Object} Questionnaire
 * @property {Object.<string, Object.<string, AnswerCandidate>>} sessions
 * @property {string[]} questions
 */

/** @type {Questionnaire} */
const __needed_only_to_make_vscode_happy_about_Questionnaire__ = null;

/**
 * @fires close
 */
export default {
  name: 'questionnaire-results',

  components: {
    'control-panel': ControlPanel,
  },

  data() {
    return {
      /** @type {Questionnaire} */
      questionnaire: null,
    };
  },

  props: {
    data: {   // vis/Data/Data
      type: VisData,
      required: true,
    },
  },

  computed: {
    /** @returns {string} */
    title() {
      const r = this.data.records[0];
      return `Questionnaire results in "${r.task.name}"`;
    },
  },

  filters: {
    /**
     * @param {string} id
     * @returns {string} 
     */
    name( id ) {
      return id.split( ',' )[0];
    },

    /**
     * @param {string} id
     * @returns {string} 
     */
    date( id ) {
      return id.split( ',' )[1];
    },
  },

  methods: {
    /** @param {Event} e */
    close( e ) {
      this.$emit( 'close' );
    },

    /**
     * @param {Object.<string, AnswerCandidate>} answers 
     * @param {string} question 
     * @returns {{isCorrect?: boolean, isIncorrect?: boolean}}
     */
    getAnswerClass( answers, question ) {
      if ( answers[ question ] ) {
        const isCorrect = answers[ question ].isCorrect;
        return {
          isCorrect: isCorrect,
          isIncorrect: !isCorrect,
        };
      }
      else {
        return {};
      }
    },

    /**
     * @param {Object.<string, AnswerCandidate>} answers 
     * @param {string} question 
     * @returns {string}
     */
    getAnswerText( answers, question ) {
      if ( answers[ question ] ) {
        return answers[ question ].text;
      }
      else {
        return '';
      }
    },

    /**
     * @param {Object.<string, AnswerCandidate>} answers 
     * @returns {string}
     */
    getTotal( answers ) {
      let correct = 0;
      let total = 0;
      for ( let question in answers ) {
        if ( !answers[ question ] ) {
          continue;
        }

        total++;
        correct += answers[ question ].isCorrect ? 1 : 0;
      }

      return ( correct / total * 100 ).toFixed( 1 );
    },

    /**
     * @param {VisDataRecord} record 
     * @returns {string}
     */
    getRecordName( record ) {
      return `${record.student.name},${DataUtils.sessionDate( record.session.date )}`;
    },

    /** @returns {Questionnaire} */
    createQuestionnaire() {
      /** @type {Object.<string, Object.<string, AnswerCandidate>>}>} */
      const sessions = {};
      /** @type {Set<string>} */
      const _questions = new Set();

      this.data.records.forEach( record => {
        if ( !record.data.questionnaire ) {
          return;
        }

        const id = this.getRecordName( record );

        /** @type {Object.<string, AnswerCandidate>} */
        const answers = {};

        record.data.questionnaire.forEach( question => {
          _questions.add( question.question );
          answers[ question.question ] = question.answer;
        } );

        sessions[ id ] = answers;
      } );

      /** @type {string[]} */
      const questions = [];
      for ( let q of _questions ) {
        questions.push( q );
      }

      return { sessions, questions };
    },
  },

  mounted() {
    console.log( 'Questionnaire results created' );

    // this.questions = this.createList();
    this.questionnaire = this.createQuestionnaire();
  },
};
</script>

<style lang="less" scoped>
  @import "../../styles/visualization.less";

  #questionnaire-results {
    .visualization();

    .list {
      position: fixed;
      left: 0;
      right: 0;
      top: 52px;
      bottom: 8px;
      max-width: 100vw;

      overflow-y: auto;
      padding: 0.3em 0.5em;

      font-family: Calibri, Arial, sans-serif;
      font-size: 20px;

      table {
        padding: 8px;

        border-collapse: collapse;
        border: 1px solid #ccc;

        thead {
          th,
          td {
            background-color: #eee;
            border-width: 1 0 1px;
            font-weight: bold;
          }
          th:not(:first-of-type):not(:nth-of-type(2)):not(:last-of-type) {
            color: #a40;
          }
        }

        th,
        td {
          border: 1px solid #ccc;
          text-align: center;
          padding: 0 4px;

          .answer {
            text-overflow: ellipsis;

            &.isCorrect {
              background-color: #cfc;
            }

            &.isIncorrect {
              background-color: #fcc;
            }
          }
        }

        td:first-of-type {
          text-align: right;
        }

        td:last-of-type {
          font-weight: bold;
        }
      }
    }
  }
</style>
