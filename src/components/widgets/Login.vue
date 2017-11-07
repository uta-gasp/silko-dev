<template lang="pug">
  #login
    .field
      p.control.has-icons-left.has-icons-right
        input.input(
          :class="{'is-danger': isEmailValid === checkValues.INVALID}"
          type="email"
          placeholder="Email or ID"
          autofocus="autofocus"
          v-model="email"
          @keyup.enter="login")
        span.icon.is-small.is-left
          i.fa.fa-envelope
        span.icon.is-small.is-right(v-if="isEmailValid === checkValues.INVALID")
          i.fa.fa-warning

      p.control.has-icons-left.has-icons-right
        input.input(
          :class="{'is-danger': isPasswordValid === checkValues.INVALID}"
          type="password"
          placeholder="Password"
          v-model="password"
          @keyup.enter="login")
        span.icon.is-small.is-left
          i.fa.fa-user-secret
        span.icon.is-small.is-right(v-if="isPasswordValid === checkValues.INVALID")
          i.fa.fa-warning

      p.control
        .has-text-centered
          button.button.is-primary(:disabled="!canLogIn" @click="login") Log in

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
</template>

<script>
import login from '@/utils/login.js';

import ActionError from '@/components/mixins/actionError';

import TemporalNotification from '@/components/widgets/TemporalNotification';

const checkValues = {
  INVALID: -1,
  UNKNOWN: 0,
  VALID: 1,
};

export default {
  name: 'login',

  components: {
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError ],

  data() {
    return {
      email: '',
      password: '',

      inProgress: false,

      checkValues,
    };
  },

  computed: {
    /** @returns {boolean} */
    isEmailValid() {
      if ( !this.email ) {
        return checkValues.UNKNOWN;
      }
      else if ( this.email.indexOf( '@' ) < 0 ) {
        return this.email.length > 4 ? checkValues.VALID : checkValues.INVALID;
      }
      else {
        return /(.{2,})@(\w{2,}\.\w{2,})/.test( this.email ) ? checkValues.VALID : checkValues.INVALID;
      }
    },

    /** @returns {boolean} */
    isPasswordValid() {
      if ( !this.password ) {
        return checkValues.UNKNOWN;
      }
      else {
        return !this.password || this.password.length > 5 ? checkValues.VALID : checkValues.INVALID;
      }
    },

    /** @returns {boolean} */
    canLogIn() {
      return !this.inProgress &&
        this.isEmailValid === checkValues.VALID &&
        this.isPasswordValid === checkValues.VALID;
    },
  },

  methods: {
    login( e ) {
      this.inProgress = true;

      login.logIn( this.email, this.password, ( err, _ /* user */ ) => {
        this.inProgress = false;

        if ( err ) {
          return this.setError( err, 'Failed to log in' );
        }
      } );
    },
  },
};
</script>

<style lang="less" scoped>
  #login {
    max-width: 20em;
    min-width: 10em;
    margin: 0 auto;
  }

  .error {
    margin-top: 0.5em;
  }
</style>
