<template lang="pug">
  #assignments.section
    article.message.is-danger(v-if="student && student.deleted")
      .message-body {{ tokens[ 'message_removed_account' ] }}

    nav.panel(v-else)
      p.panel-heading {{ tokens[ 'assignments_title' ] }}
      .panel-block
        .container(v-if="assignments === null")
          loading
        .container(v-else-if="!assignments.length")
          i {{ tokens[ 'assignments_0' ] }}
        .tile.is-ancestor(v-else)
          .tile.is-parent(v-for="assignment in assignments")
            .tile.is-child
              .card
                header.card-header.notification.is-info.is-paddingless
                  .card-header-title {{ assignment.cls.name }}
                  .card-header-icon
                    span.icon(v-if="assignment.task.syllab.language" title="Syllabification")
                      i.fa.fa-ellipsis-h
                    span.icon(v-if="assignment.task.speech.language" title="Voice")
                      i.fa.fa-headphones
                .card-content
                  .content {{ assignment.task.name }}
                .card-footer
                  a.card-footer-item(@click="start( assignment )") {{ tokens[ 'assignments_start' ] }}

    nav.panel
      p.panel-heading {{ tokens[ 'completed_title' ] }}
      .panel-block
        .container(v-if="sessions === null")
          loading
        .container(v-else-if="!sessions.length")
          i {{ tokens[ 'completed_0' ] }} 
        table.table(v-else)
          thead
            tr
              th {{ tokens[ 'completed_col_class' ] }}
              th {{ tokens[ 'completed_col_task' ] }}
              th {{ tokens[ 'completed_col_wpm' ] }}
              th {{ tokens[ 'completed_col_date' ] }}
          tbody
            tr(v-for="session in sessions")
              td {{ session.cls.name }}
              td {{ session.task.name }}
              td {{ getWPM( session.data ) }}
              td {{ session.session.date | prettifyDate }}

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';

import Student from '@/model/student.js';

import ActionError from '@/components/mixins/actionError';

import Loading from '@/components/widgets/Loading.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';

import { i10n } from '@/utils/i10n.js';

// ts-check-only
import Data from '@/model/data.js';
import DataPage from '@/model/data/dataPage.js';
import Class from '@/model/class.js';
import Task from '@/model/task.js';

/**
 * @typedef Assignment
 * @property {Class} cls
 * @property {Task} task
 */

/**
 * @typedef Session
 * @property {Class} cls
 * @property {Task} task
 * @property {string} session
 */

 /** @type {Assignment} */
const __needed_only_to_make_vscode_happy_about_Assignment__ = null;
 /** @type {Session} */
const __needed_only_to_make_vscode_happy_about_Session__ = null;

export default {
  name: 'assignments',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError ],

  data() {
    return {
      /** @type {Student}  */
      student: null,
      /** @type {Assignment[]}  */
      assignments: null,  // [{cls, task}]
      /** @type {Session[]}  */
      sessions: null,     // [{cls, task, session}]
      assignment: '',

      tokens: i10n( 'assignments' ),
    };
  },

  filters: {
    /** 
     * @param {string} value
     * @returns {string}
     */
    prettifyDate( value ) {
      return dataUtils.sessionDate( value );
    },
  },

  methods: {
    init() {
      this.student = Student.instance;
      if ( this.student ) {
        this.loadAssignments();
        this.loadSessions();
      }
    },

    loadAssignments() {
      this.student.loadAssignments( /** @param {Error} err, @param {Assignment[]} assignments */ ( err, assignments ) => {
        this.assignments = [];
        if ( err ) {
          return this.setError( err, this.tokens[ 'message_failed_assignments' ] );
        }

        this.assignments = assignments;
      } );
    },

    loadSessions() {
      this.student.loadSessions( /** @param {Error} err, @param {Session[]} sessions */ ( err, sessions ) => {
        this.sessions = [];
        if ( err ) {
          return this.setError( err, this.tokens[ 'message_failed_sessions' ] );
        }

        this.sessions = sessions;
      } );
    },

    checkAccess() {
      if ( !Student.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    /** 
     * @param {Assignment} assignment
     * @param {Event} e
     */
    start( assignment, e ) {
      if ( Student.MULTICLASS ) {
        this.$router.replace( `/assignment/${assignment.task.id}` );
      }
      else {
        this.$router.replace( `/assignment/${assignment.cls.id}` );
      }
    },

    /** 
     * @param {Data} data
     */
    getWPM( data ) {
      // TODO: same piece of code as in components/vis/StudentSummary.vue:calculateStatistics
      const pages = data.pages;

      /** @type {DataPage} */
      let firstPage;
      /** @type {DataPage} */
      let lastPage;
      let wordCount = 0;
      pages.forEach( /** @param {DataPage} page */ page => {
        if ( !firstPage && page.fixations ) {
          firstPage = page;
        }
        if ( page.fixations ) {
          lastPage = page;
          wordCount += page.text.length;
        }
      } );

      if ( !firstPage || !lastPage ) {
        return '-';
      }

      const firstFixation = firstPage.fixations[0];
      const lastFixation = lastPage.fixations[ lastPage.fixations.length - 1 ];
      const duration = ( lastFixation.ts + lastFixation.duration ) - firstFixation.ts;

      return ( wordCount / ( duration / 60000 ) ).toFixed( 0 );
    },
  },

  created() {
    console.log( 'Assignments component created' );
    eventBus.$on( 'logout', () => {
      this.checkAccess();
    } );
    eventBus.$on( 'login', () => {
      this.init();
    } );
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'assignments' );
    } );

    this.checkAccess();
  },

  mounted() {
    this.init();
  },
};
</script>

<style lang="less" scoped>
  header {
    margin-bottom: 0 !important;
  }

  .card-header-title {
    color: #fff;
  }

  .card-header-icon {
    cursor: default;
  }
</style>
