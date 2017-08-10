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
    //- .modal(:class="{ 'is-active': sessionToDelete }")
      .modal-background
      .modal-card
        header.modal-card-head
          p.modal-card-title Deleting session
          button.delete(@click="cancel")
        section.modal-card-body.is-paddingless
          .notification.is-danger
            .has-text-centered Delete the session "{{ sessionToString( sessionToDelete ) }}" ?
        footer.modal-card-foot
          .centered
            a.button.is-danger(@click="deleteSession") Yes
            a.button(@click="cancel") No
</template>

<script>
import Formatter from '@/vis/formatter.js';

import RemoveWarning from '@/components/widgets/RemoveWarning';

export default {
  name: 'session-edit-box',

  components: {
    'remove-warning': RemoveWarning,
  },

  data() {
    return {
      sessionToDelete: null,
    };
  },

  props: {
    student: {     // [_Student]
      type: Object,
      required: true,
    },
  },

  computed: {
    toDeleteName() {
      return this.sessionToString( this.sessionToDelete );
    },
  },

  methods: {
    sessionToString( session ) {
      if ( !session ) {
        return '';
      }

      return `${session.task.name} at ${Formatter.sessionDate( session.ref.date )}`;
    },

    showDeleteWarning( session ) {
      this.sessionToDelete = session;
    },

    deleteSession() {
      const sessionID = this.sessionToDelete.ref.id;
      this.student.ref.deleteSession( sessionID, err => {
        if ( err ) {
          return console.log( 'TODO: handle error', err );
        }

        this.student.sessions = this.student.sessions.filter( session => session.ref.id !== sessionID );
        this.$emit( 'deleted', { session: sessionID } );
      } );

      this.sessionToDelete = null;
    },

    cancel() {
      this.sessionToDelete = null;
    },

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

  .centered {
    width: 100%;
    margin: 0 auto
  }
</style>
