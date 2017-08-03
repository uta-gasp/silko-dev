<template lang="pug">
  #session-select-box
    div.tabs.is-centered.is-boxed(v-if="students.length > 1")
      ul.ul
        li(:class="{ 'is-active': isStudentSelected( student ) }" v-for="student in students" :key="student")
          a(@click="selectStudent( student )") {{ student.name }}
    .sessions
      .has-text-centered(v-if="!isStudentSelected()")
        i Select a student
      div(v-for="student in students" v-if="isStudentSelected( student )")
        .card.session(
          :class="{ 'is-selected' : session.selected }"
          v-if="hasSessions( student )"
          v-for="session in student.sessions")
          .card-content.title.is-6(@click="selectSession( session, $event )")
            .task "{{ session.task }}"
            span &nbsp;at&nbsp;
            .date {{ formatDate( session.ref.date ) }}
        .has-text-centered(v-if="!hasSessions( student )")
          i No available sessions
    .field
      p.control
        .level
          .level-left
            .level-item
              button.button.is-primary(@click="accept") Select
            .level-item
          .level-right
            .level-item
              button.button(v-if="multiple" :disabled="!hasSessions()" @click="selectAllSessions") Select all
            .level-item
              button.button(v-if="multiple" :disabled="!hasSessions()" @click="removeAllSessions") Remove all selections
</template>

<script>
  export default {
    name: 'session-select-box',

    data() {
      return {
        currentStudent: null,
      };
    },

    props: {
      students: {     // [{ name, sessions: [{ ref=Session, selected=Boolean }] }]
        type: Array,
        required: true,
        default: []
      },
      multiple: {
        type: Boolean,
        default: true
      },
    },

    methods: {

      selectStudent( student, e ) {
        this.currentStudent = student;
      },

      isStudentSelected( student ) {
        if (!this.currentStudent) {
          return false;
        }

        return student ? this.currentStudent.name === student.name : !!this.currentStudent;
      },

      hasSessions( student ) {
        student = student || this.currentStudent;
        return student && student.sessions ? !!student.sessions.length : false;
      },

      selectMultipleSessions( session, event ) {
        if (event.shiftKey) {
          const index = this.currentStudent.sessions.indexOf( session );
          for (let i = index - 1; i >= 0; i--) {
            const session = this.currentStudent.sessions[i];
            if (session.selected) {
              break;
            }

            session.selected = true;
          }
        }
      },

      selectSession( session, e ) {
        if (!this.multiple) {
          this.students.forEach( student => {
            student.sessions.forEach( session => {
              session.selected = false;
            });
          });
        }

        session.selected = !session.selected;

        if (session.selected) {
          this.selectMultipleSessions( session, e );
        }
      },

      selectAllSessions( e ) {
        this.currentStudent.sessions.forEach( session => {
          session.selected = true;
        });
      },

      removeAllSessions( e ) {
        this.currentStudent.sessions.forEach( session => {
          session.selected = false;
        });
      },

      accept( e ) {
        const selected = {};

        this.students.forEach( student => {
          student.sessions.forEach( session => {
            if (session.selected) {
              selected[ session.ref.id ] = session.ref.date;
            }
          });
        });

        this.$emit( 'accept', { sessions: selected } );
      },

      formatTimeComponent( timeComponent ) {
          let formattedTimeComponent = '' + timeComponent;
          if (formattedTimeComponent.length < 2) {
              formattedTimeComponent = '0' + formattedTimeComponent;
          }
          return formattedTimeComponent;
      },

      formatDate( dateString ) {
          const date = new Date( dateString );
          const hours = this.formatTimeComponent( date.getHours() );
          const minutes = this.formatTimeComponent( date.getMinutes() );
          return `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()} ${hours}:${minutes} `;
      },
    },

    mounted() {
      if (this.students.length === 1) {
        this.selectStudent( this.students[0] );
      }
    }
  };
</script>

<style lang="less" scoped>
  .sessions {
    min-height: 20em;
    max-height: 26em;
    margin-bottom: 1em;
    overflow-y: auto;
  }

  .tabs {
    margin-bottom: 0 !important;
  }

  .session {
    cursor: cell;
    user-select: none;
  }

  .is-selected {
    background-color: #cfc;
  }

  .card-content {
    padding: 1rem;
  }

  .columns {
    margin-bottom: 0;
  }

  .column {
    padding-bottom: 0;
  }

  .level:not(:last-child) {
    margin-bottom: 0;
  }

  .task,
  .date {
    display: inline-block;
  }

</style>