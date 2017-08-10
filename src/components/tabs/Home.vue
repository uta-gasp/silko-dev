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
      .columns
        .column
          div TAUCHI, COMS, University of Tampere
        .column
          .browser-info Designed to run in
          img.img.browser-logo(src="../../assets/img/chrome.png")
          .browser-name Chrome 55+
          img.img.browser-logo(src="../../assets/img/firefox.png")
          .browser-name Firefox 47+

    modal-editor-container(v-if="schools" title="Registration" @close="closeSelectionBox")
      .has-text-centered
        div School rectors and teachers, please contact us directly.
        div Oleg Špakov @ University of Tampere
        div oleg.spakov@uta.fi

    modal-editor-container(v-if="isGettingEmail" title="Password reset" @close="closeEmailBox" @mounted="passwordResetAppeared")
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

    modal-notification(type="success" :show="showSuccess")
      span {{ success }}

    modal-notification(type="danger" :show="showFailure")
      span {{ failure }}

</template>

<script>
import eventBus from '@/utils/event-bus.js';
import login from '@/utils/login.js';

// import School from '@/model/school.js';

import Login from '@/components/widgets/Login';
import ModalEditorContainer from '@/components/widgets/ModalEditorContainer';
// import ItemSelectionBox from '@/components/widgets/ItemSelectionBox';
import ModalNotification from '@/components/widgets/ModalNotification';

export default {
  name: 'home',

  components: {
    'login': Login,
    'modal-editor-container': ModalEditorContainer,
    // 'item-selection-box': ItemSelectionBox,
    'modal-notification': ModalNotification,
  },

  data() {
    return {
      isLoginVisible: true,
      user: null,

      schools: null,
      schoolToRegester: null,

      isGettingEmail: false,
      email: '',

      showSuccess: 0,
      success: '',

      showFailure: 0,
      failure: '',
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
        this.success = `The registration request for "${this.email}" has been sent.`;
        this.schoolToRegester = null;
        this.showSuccess = Math.random();
      }
      else {
        login.resetPassword( this.email, err => {
          if ( err ) {
            this.failure = `Cannot send the registration request for "${this.email}".`;
            this.showFailure = Math.random();
          }
          else {
            this.success = `The password reset request has been sent to "${this.email}".`;
            this.showSuccess = Math.random();
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
      // this.isLoginVisible = false;
      this.user = login.user;
    } );
    eventBus.$on( 'logout', id => {
      this.user = null;
      // this.isLoginVisible = true;
    } );

    // this.isLoginVisible = !login.user;
    this.user = login.user;
  },

  mounted() {
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

  .browser-info {
    display: inline-block;
    line-height: 8px;
    height: 32px;
    vertical-align: middle;
    margin-right: 2em;
  }

  .browser-name {
    .browser-info;

    margin: 0;
    padding-left: 0.25em;
  }

  .browser-logo {
    margin-left: 0.5em;
    width: 32px;
    height: 32px;
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
