<template lang="pug">
  #assignments.section
    article.message.is-danger(v-if="student && student.deleted")
      .message-body This student account was removed from all schools and is considered as frozen. No tasks will be assigned to this account in future.

    nav.panel(v-else)
      p.panel-heading Tasks waiting to be completed
      .panel-block
        .container(v-if="assignments === null")
          loading
        .container(v-else-if="!assignments.length")
          i No assigned tasks yet
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
                  a.card-footer-item(@click="start( assignment )") Start

    nav.panel
      p.panel-heading Completed tasks
      .panel-block
        .container(v-if="sessions === null")
          loading
        .container(v-else-if="!sessions.length")
          i No completed tasks yet
        table.table(v-else)
          thead
            tr
              th Class
              th Task
              th WPM
              th Date
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

import Loading from '@/components/widgets/Loading';
import TemporalNotification from '@/components/widgets/TemporalNotification';

export default {
  name: 'assignments',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError ],

  data() {
    return {
      student: null,
      assignments: null,  // [{cls, task}]
      sessions: null,     // [{cls, task, session}]
      assignment: '',
    };
  },

  filters: {
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
      this.student.loadAssignments( ( err, assignments ) => {
        this.assignments = [];
        if ( err ) {
          return this.setError( err, 'Failed to load assignments' );
        }

        this.assignments = assignments;
      } );
    },

    loadSessions() {
      this.student.loadSessions( ( err, sessions ) => {
        this.sessions = [];
        if ( err ) {
          return this.setError( err, 'Failed to load sessions' );
        }

        this.sessions = sessions;
      } );
    },

    checkAccess() {
      if ( !Student.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    start( assignment, e ) {
      if ( Student.MULTICLASS ) {
        this.$router.replace( `/assignment/${assignment.task.id}` );
      }
      else {
        this.$router.replace( `/assignment/${assignment.cls.id}` );
      }
    },

    getWPM( data ) {
      // TODO: same piece of code as in components/vis/StudentSummary.vue:calculateStatistics
      const pages = data.pages;

      let firstPage;
      let lastPage;
      let wordCount = 0;
      pages.forEach( page => {
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
