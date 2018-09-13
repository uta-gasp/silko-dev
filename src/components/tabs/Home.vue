<template lang="pug">
  #home
    section.hero
      .hero-body
        .container
          //-img(src="../assets/icon-32.png")
          h1.title.logo Silko
          h2.subtitle {{ tokens[ 'hdr_subtitle' ] }}

    section.connecting(v-if="isConnecting")
      div {{ tokens[ 'msg_connecting' ] }}
      loading 

    section(v-else-if="!user")
      login

      p.control.extra-tools
        .has-text-centered
          button.button.is-link(@click="register") {{ tokens[ 'btn_request_account' ] }}
          button.button.is-link(@click="remindPassword") {{ tokens[ 'btn_forgot_password' ] }}

    section.section(v-else)
      .message.is-info
        .message-header
          p {{ tokens[ 'hdr_info_title' ]( userTitle ) }}
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
          div TAUCHI, COMS, {{ tokens[ 'msg_contact_uta' ] }}
        .column.is-narrow
          a.manual(href="https://uta-gasp.gitbooks.io/silko/") {{ tokens[ 'manual' ] }}
        .column
          .browser-info {{ tokens[ 'msg_test_info' ] }}
          .is-inline-block
            .browser-name.chrome Chrome 55+
            .browser-name.firefox Firefox 47+

    modal-container(v-if="schools" :title="tokens[ 'tit_registration' ]" @close="closeSelectionBox")
      .has-text-centered
        div {{ tokens[ 'msg_contact_info' ] }}
        div Oleg Špakov @ {{ tokens[ 'msg_contact_uta' ] }}
        div oleg.spakov at uta dot fi

    modal-container(v-if="isGettingEmail" :title="tokens[ 'tit_pass_reset' ]" @close="closeEmailBox" @mounted="passwordResetAppeared")
      .field(v-if="!schoolToRegester")
        p.control
          span {{ tokens[ 'hdr_password_reset' ] }}

      .field
        p.control.has-icons-left.has-icons-right
          input.input(ref="email" type="email" :placeholder="tokens[ 'email' ]" v-model="email" @keyup.enter="sendPasswordResetRequest")
          span.icon.is-small.is-left
            i.fa.fa-envelope
          span.icon.is-small.is-right(v-if="!isEmailValid")
            i.fa.fa-exclamation-triangle

      p.control
        .has-text-centered
          button.button.is-primary(@click="sendPasswordResetRequest") {{ tokens[ 'btn_send' ] }}

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
import { i10n } from '@/utils/i10n.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Login from '@/components/widgets/Login.vue';
import ModalContainer from '@/components/widgets/ModalContainer.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';
import Loading from '@/components/widgets/Loading.vue';

// ts-check-only
import UserBase from '@/db/userBase.js';
import School from '@/model/school.js';

export default {
  name: 'home',

  components: {
    'login': Login,
    'modal-container': ModalContainer,
    'temporal-notification': TemporalNotification,
    'loading': Loading,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      showWsSecurityError: !gazeTracking.isWebSocketOK,
      isConnecting: true,

      isLoginVisible: true,
      /** @type {UserBase} */
      user: null,

      /** @type {School[] | boolean} */
      schools: null,
      /** @type {School} */
      schoolToRegester: null,

      isGettingEmail: false,
      email: '',

      tokens: i10n( 'home', '_form', '_buttons' ),
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
    /** @param {Event} e */
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

    /** @param {{selected: School}} e */
    sendResistrationRequest( e ) {
      this.closeSelectionBox( null );

      this.schoolToRegester = e.selected;

      this.isGettingEmail = true;
    },

    /** @param {Event} e */
    remindPassword( e ) {
      this.isGettingEmail = true;
    },

    /** @param {Event} e */
    closeSelectionBox( e ) {
      this.schools = null;
    },

    /** @param {Event} e */
    closeEmailBox( e ) {
      this.isGettingEmail = false;
    },

    /** @param {Event} e */
    sendPasswordResetRequest( e ) {
      if ( this.schoolToRegester ) {
        this.setSuccess( this.tokens[ 'msg_request_sent' ]( this.email ) );
        this.schoolToRegester = null;
      }
      else {
        login.resetPassword( this.email, /** @param {Error | string} err */ err => {
          if ( err ) {
            this.setError( err, this.tokens[ 'err_password_reset' ]( this.email ) );
          }
          else {
            this.setSuccess( this.tokens[ 'msg_password_reset' ] );
          }
          this.email = '';
        } );
      }

      this.closeEmailBox( null );
    },

    /** @param {Event} e */
    passwordResetAppeared( e ) {
      /** @type {HTMLInputElement} */ (this.$refs.email).focus();
    },
  },

  created() {
    eventBus.$on( 'connected', /** @param {{user: UserBase}} e */ e => {
      this.isConnecting = false;
      if (e.user) {
        this.user = e.user;
      }
    } );
    eventBus.$on( 'login', () => {
      this.tokens = i10n( 'home', '_form', '_buttons' );
      this.user = login.user;
      this.isConnecting = false;
    } );
    eventBus.$on( 'logout', () => {
      this.user = null;
    } );
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'home', '_form', '_buttons' );
    } );

    this.user = login.user;
    this.isConnecting = !login.isConnected;
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
    color: #777;
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

  .connecting {
    background-color: royalblue;
    padding: 2.5em 3em;
    color: white;
    font-family: 'Gloria', Arial, sens-serif;
    font-size: 1.5rem;
  }
</style>
