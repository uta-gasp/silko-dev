<template lang="pug">
  #session-edit-box
    table.table
      tbody
        tr(v-for="session in student.sessions")
          td
            .name.is-inline-block {{ sessionToString( session ) }}
          td
            button.button.is-danger(@click="showDeleteWarning( session )")
              i.fa.fa-remove

    remove-warning(v-if="sessionToDelete" object="session" :name="toDeleteName" @close="removeWarningClosed")

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
</template>

<script>
import dataUtils from '@/utils/data-utils.js';

import ActionError from '@/components/mixins/actionError.js';

import TemporalNotification from '@/components/widgets/TemporalNotification.vue';
import RemoveWarning from '@/components/widgets/RemoveWarning.vue';

// ts-check-only
import Session from '@/vis/data/session.js';
import Student from '@/vis/data/student.js';

export default {
  name: 'session-edit-box',

  components: {
    'temporal-notification': TemporalNotification,
    'remove-warning': RemoveWarning,
  },

  mixins: [ ActionError ],

  data() {
    return {
      /** @type {Session} */
      sessionToDelete: null,
    };
  },

  props: {
    student: {
      type: Student,
      required: true,
    },
  },

  computed: {
    /** @returns {string} */
    toDeleteName() {
      return this.sessionToString( this.sessionToDelete );
    },
  },

  methods: {
    /**
     * @param {Session} session
     * @returns {string}
     */
    sessionToString( session ) {
      if ( !session ) {
        return '';
      }

      return `${session.task.name} at ${dataUtils.sessionDate( session.ref.date )}`;
    },

    /**
     * @param {Session} session
     */
    showDeleteWarning( session ) {
      this.sessionToDelete = session;
    },

    deleteSession() {
      const sessionID = this.sessionToDelete.ref.id;
      this.student.ref.deleteSession( sessionID, /** @param {Error | string} err */ err => {
        if ( err ) {
          return this.setError( err, 'Failed to delete the session' );
        }

        this.student.sessions = this.student.sessions.filter( session => session.ref.id !== sessionID );
        this.$emit( 'deleted', { session: sessionID } );
      } );

      this.sessionToDelete = null;
    },

    cancel() {
      this.sessionToDelete = null;
    },

    /** @param {{confirm: boolean}} e */
    removeWarningClosed( e ) {
      if ( e.confirm ) {
        this.deleteSession();
      }
      else {
        this.cancel();
      }
    },
  },
};
</script>

<style lang="less" scoped>
  #session-edit-box {
    min-height: 20em;
    max-height: 90vh;
    margin-bottom: 1em;
    overflow-y: auto;
  }

  .name {
    line-height: 36px;
  }
</style>
