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
          p {{ tokens[ 'info_title' ]( userTitle ) }}
        .message-body.is-paddingless
          .panel
            .panel-block(v-if="isAdmin || isSchool") {{ tokens[ 'info_adm_1' ] }}
            .panel-block(v-if="isAdmin") {{ tokens[ 'info_adm_2' ] }}
            .panel-block(v-if="isAdmin || isSchool || isTeacher") {{ tokens[ 'info_adm_3' ] }}
            .panel-block(v-if="isAdmin") {{ tokens[ 'info_adm_3' ] }}
            .panel-block(v-if="isTeacher") {{ tokens[ 'info_tch_1' ] }}
            .panel-block(v-if="isTeacher") {{ tokens[ 'info_tch_2' ] }}
            .panel-block(v-if="isTeacher") {{ tokens[ 'info_tch_3' ] }}
            .panel-block(v-if="isTeacher") {{ tokens[ 'info_tch_4' ] }}
            .panel-block(v-if="isTeacher") {{ tokens[ 'info_tch_5' ] }}
            .panel-block(v-if="isTeacher") {{ tokens[ 'info_tch_6' ] }}
            .panel-block(v-if="isStudent") {{ tokens[ 'info_std_1' ] }}
            .panel-block(v-if="isStudent") {{ tokens[ 'info_std_2' ] }}
            .panel-block(v-if="isStudent") {{ tokens[ 'info_std_3' ] }}

    footer.footer(v-if="!user")
      .columns.is-32
        .column
          div TAUCHI, COMS, {{ tokens[ 'contact_uta' ] }}
        .column.is-narrow
          a.manual(href="https://uta-gasp.gitbooks.io/silko/") {{ tokens[ 'manual' ] }}
        .column
          .browser-info {{ tokens[ 'test_info' ] }}
          .is-inline-block
            .browser-name.chrome Chrome 55+
            .browser-name.firefox Firefox 47+

    modal-container(v-if="schools" title="Registration" @close="closeSelectionBox")
      .has-text-centered
        div {{ tokens[ 'contact_info' ] }}
        div Oleg Špakov @ {{ tokens[ 'contact_uta' ] }}
        div oleg.spakov@uta.fi

    modal-container(v-if="isGettingEmail" title="Password reset" @close="closeEmailBox" @mounted="passwordResetAppeared")
      .field(v-if="!schoolToRegester")
        p.control
          span {{ tokens[ 'message_password_reset' ] }}

      .field
        p.control.has-icons-left.has-icons-right
          input.input(ref="email" type="email" placeholder="Email" v-model="email" @keyup.enter="sendPasswordResetRequest")
          span.icon.is-small.is-left
            i.fa.fa-envelope
          span.icon.is-small.is-right(v-if="!isEmailValid")
            i.fa.fa-warning

      p.control
        .has-text-centered
          button.button.is-primary(@click="sendPasswordResetRequest") {{ tokens[ 'button_password_reset' ] }}

    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}

    #ws-security-error.modal(:class="{ 'is-active': isStudent && showWsSecurityError }")
      .modal-background
      .modal-content
        .notification.is-danger
          h3.title.is-3 {{ tokens[ 'ws_err_title' ] }}
          .subtitle {{ tokens[ 'ws_err_subtitle' ] }}
          ul.unblock-ws-instruction(v-if="isFirefox")
            li.step - {{ tokens[ 'ws_unblock_1' ][0] }} "
              span.code about:config
              | " {{ tokens[ 'ws_unblock_1' ][1] }}
            li.step - {{ tokens[ 'ws_unblock_2' ][0] }} "
              span.code network.websocket.allowInsecureFromHTTPS
              | " {{ tokens[ 'ws_unblock_2' ][1] }}
            li.step - {{ tokens[ 'ws_unblock_3' ][0] }} "
              span.code false
              | ", {{ tokens[ 'ws_unblock_3' ][1] }} "
              span.code true
              | "{{ tokens[ 'ws_unblock_3' ][2] }}
          .unblock-ws-instruction(v-else) {{ tokens[ 'ws_unblock_4' ] }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import login from '@/utils/login.js';
import gazeTracking from '@/utils/gazeTracking.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Login from '@/components/widgets/Login.vue';
import ModalContainer from '@/components/widgets/ModalContainer.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';

import { i10n } from '@/utils/i10n.js';

// ts-check-only
import UserBase from '@/db/userBase.js';
import School from '@/model/school.js';

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
      showWsSecurityError: !gazeTracking.isWebSocketOK,

      isLoginVisible: true,
      /** @type {UserBase} */
      user: null,

      /** @type {School[]} */
      schools: null,
      /** @type {School} */
      schoolToRegester: null,

      isGettingEmail: false,
      email: '',

      tokens: i10n( 'home' ),
    };
  },

  computed: {
    /** @returns {boolean} */
    isAdmin() { return this.user && this.user.isAdmin; },
    /** @returns {boolean} */
    isSchool() { return this.user && this.user.isSchool; },
    /** @returns {boolean} */
    isTeacher() { return this.user && this.user.isTeacher; },
    /** @returns {boolean} */
    isStudent() { return this.user && this.user.isStudent; },
    /** @returns {string} */
    userTitle() {
      if ( this.isAdmin ) { return this.tokens[ 'acc_admin' ]; }
      else if ( this.isSchool ) { return this.tokens[ 'acc_school' ]; }
      else if ( this.isTeacher ) { return this.tokens[ 'acc_teacher' ]; }
      else if ( this.isStudent ) { return this.tokens[ 'acc_student' ]; }
      else { return ''; }
    },

    /** @returns {boolean} */
    isEmailValid() {
      return !this.email || /(.{2,})@(\w{2,}\.\w{2,})/.test( this.email );
    },

    /** @returns {boolean} */
    isFirefox() {
      const ua = ( window.navigator && window.navigator.userAgent ) || '';
      return ua.indexOf( 'Mozilla' ) >= 0;
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
    eventBus.$on( 'login', _ => {
      this.tokens = i10n( 'home' );
      this.user = login.user;
    } );
    eventBus.$on( 'logout', _ => {
      this.user = null;
    } );
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'home' );
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

  .subtitle {
    padding-top: 1em;
  }

  .unblock-ws-instruction {
    .step {
      padding: 0.5em 0;
      text-align: left;
    }

    .code {
      color: #ff4;
      font-family: Consolas, Courier, monospace;
    }
  }
</style>
