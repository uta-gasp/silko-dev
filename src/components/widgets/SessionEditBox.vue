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

    .modal(:class="{ 'is-active': sessionToDelete }")
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
export default {
  name: 'session-edit-box',

  data() {
    return {
      sessionToDelete: null,
      _student: this.student || [],
    };
  },

  props: {
    student: {     // [_Student]
      type: Object,
      required: true,
    },
  },

  methods: {
    formatTimeComponent( timeComponent ) {
      let formattedTimeComponent = '' + timeComponent;
      if ( formattedTimeComponent.length < 2 ) {
        formattedTimeComponent = '0' + formattedTimeComponent;
      }
      return formattedTimeComponent;
    },

    formatDate( dateString ) {
      const date = new Date( dateString );
      const hours = this.formatTimeComponent( date.getHours() );
      const minutes = this.formatTimeComponent( date.getMinutes() );
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()} ${hours}:${minutes} `;
    },

    sessionToString( session ) {
      if ( !session ) {
        return '';
      }

      return `${session.task.name} at ${this.formatDate( session.ref.date )}`;
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
    height: 40px;
  }

  .centered {
    width: 100%;
    margin: 0 auto
  }
</style>
