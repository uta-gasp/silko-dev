<template lang="pug">
  #home
    section.hero
      .hero-body
        .container
          //-img(src="../assets/icon-32.png")
          h1.title.logo Silko
          h2.subtitle A reading aid for students and teachers
    section(v-if="!user")
      login

      p.control.extra-tools
        .has-text-centered
          button.button.is-link(@click="register") Request an account
          button.button.is-link(@click="remindPassword") Forgot password?

    section.section(v-else)
      .message.is-info
        .message-header
          p As {{ userTitle }}, you can
        .message-body.is-paddingless
          .panel
            .panel-block(v-if="isAdmin || isSchool") Add and list teachers
            .panel-block(v-if="isAdmin") Move teachers to other school
            .panel-block(v-if="isAdmin || isSchool || isTeacher") Add and list students
            .panel-block(v-if="isAdmin") Move students to other school
            .panel-block(v-if="isTeacher") Add, list, edit and remove instructions
            .panel-block(v-if="isTeacher") Add, list, edit and remove classes
            .panel-block(v-if="isTeacher") Add, list, edit and remove tasks
            .panel-block(v-if="isTeacher") Add students to classes, list them and remove
            .panel-block(v-if="isTeacher") Assign tasks to students
            .panel-block(v-if="isTeacher") Create visalizations from data of tasks completed by students
            .panel-block(v-if="isStudent") List tasks assigned to complete
            .panel-block(v-if="isStudent") Complete a task
            .panel-block(v-if="isStudent") Create visualizations from data of the tasks you completed

    footer.footer(v-if="!user")
      .columns.is-32
        .column
          div TAUCHI, COMS, University of Tampere
        .column.is-narrow
          a.manual(href="https://uta-gasp.gitbooks.io/silko/") Manual
        .column
          .browser-info Tested in
          .is-inline-block
            .browser-name.chrome Chrome 55+
            .browser-name.firefox Firefox 47+

    modal-container(v-if="schools" title="Registration" @close="closeSelectionBox")
      .has-text-centered
        div School rectors and teachers, please contact us directly.
        div Oleg Špakov @ University of Tampere
        div oleg.spakov@uta.fi

    modal-container(v-if="isGettingEmail" title="Password reset" @close="closeEmailBox" @mounted="passwordResetAppeared")
      .field(v-if="!schoolToRegester")
        p.control
          span Send password reset notification to this email:

      .field
        p.control.has-icons-left.has-icons-right
          input.input(ref="email" type="email" placeholder="Email" v-model="email" @keyup.enter="sendPasswordResetRequest")
          span.icon.is-small.is-left
            i.fa.fa-envelope
          span.icon.is-small.is-right(v-if="!isEmailValid")
            i.fa.fa-warning

      p.control
        .has-text-centered
          button.button.is-primary(@click="sendPasswordResetRequest") Send

    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}

</template>

<script>
import eventBus from '@/utils/event-bus.js';
import login from '@/utils/login.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Login from '@/components/widgets/Login';
import ModalContainer from '@/components/widgets/ModalContainer';
import TemporalNotification from '@/components/widgets/TemporalNotification';

export default {
  name: 'home',

  components: {
    'login': Login,
    'modal-container': ModalContainer,
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      isLoginVisible: true,
      user: null,

      schools: null,
      schoolToRegester: null,

      isGettingEmail: false,
      email: '',
    };
  },

  computed: {
    isAdmin() { return this.user && this.user.isAdmin; },
    isSchool() { return this.user && this.user.isSchool; },
    isTeacher() { return this.user && this.user.isTeacher; },
    isStudent() { return this.user && this.user.isStudent; },
    userTitle() {
      if ( this.isAdmin ) { return 'an admin'; }
      else if ( this.isSchool ) { return 'a school'; }
      else if ( this.isTeacher ) { return 'a teacher'; }
      else if ( this.isStudent ) { return 'a student'; }
      else { return 'an anonym'; }
    },

    isEmailValid() {
      return !this.email || /(.{2,})@(\w{2,}\.\w{2,})/.test( this.email );
    },
  },

  methods: {
    register( e ) {
      this.schools = true;

      // School.list( (err, schools) => {
      //   if (err) {
      //     return; // TODO: handle error
      //   }

      //   this.schools = [{
      //     id: 0,
      //     text: 'Schools',
      //     subitems: schools.map( school => {
      //       return {
      //         id: school.id,
      //         text: school.name,
      //         selected: false
      //       };
      //     })
      //   }];
      // });
    },

    sendResistrationRequest( e ) {
      this.closeSelectionBox();

      this.schoolToRegester = e.selected;

      this.isGettingEmail = true;
    },

    remindPassword( e ) {
      this.isGettingEmail = true;
    },

    closeSelectionBox( e ) {
      this.schools = null;
    },

    closeEmailBox( e ) {
      this.isGettingEmail = false;
    },

    sendPasswordResetRequest( e ) {
      // TODO: send email

      if ( this.schoolToRegester ) {
        this.setSuccess( `The registration request for "${this.email}" has been sent.` );
        this.schoolToRegester = null;
      }
      else {
        login.resetPassword( this.email, err => {
          if ( err ) {
            this.setError( err, `Cannot send the password reset request to "${this.email}".` );
          }
          else {
            this.setSuccess( `The password reset request has been sent to "${this.email}".` );
          }
          this.email = '';
        } );
      }

      this.closeEmailBox();
    },

    passwordResetAppeared( e ) {
      this.$refs.email.focus();
    },
  },

  created() {
    eventBus.$on( 'login', id => {
      this.user = login.user;
    } );
    eventBus.$on( 'logout', id => {
      this.user = null;
    } );

    this.user = login.user;
  },
};
</script>

<style lang="less" scoped>
  .logo {
    font-family: 'Gloria Hallelujah', 'Avenir', Helvetica, Arial, sans-serif;
    padding-bottom: 0.5em;
  }

  .extra-tools {
    margin-top: 2em;
  }

  .is-32 {
    line-height: 32px;
    vertical-align: middle;
  }

  .browser-info {
    display: inline-block;
    margin-right: 1em;
  }

  .browser-name {
    display: inline-block;
    padding-left: 2em;
    margin-right: 1em;

    &.chrome {
      background: url("../../assets/img/chrome.png") no-repeat scroll left center;
      background-size: contain;
    }

    &.firefox {
      background: url("../../assets/img/firefox.png") no-repeat scroll left center;
      background-size: contain;
    }
  }

  .browser-logo {
    margin-left: 0.5em;
    width: 16px;
    height: 16px;
  }

  .footer {
    opacity: 0.5;
    position: fixed;
    bottom: 0;
    width: 100vw;

    padding: 1rem 1rem;
    background-color: inherit;
    border-top: 2px solid #bbb;
  }

  @media (max-height: 474px) {
    .footer {
      position: inherit;
    }
  }
</style>
