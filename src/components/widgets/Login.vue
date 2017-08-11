<template lang="pug">
  #login
    .field
      p.control.has-icons-left.has-icons-right
        input.input(type="email" placeholder="Email" autofocus="autofocus" v-model="email" @keyup.enter="login")
        span.icon.is-small.is-left
          i.fa.fa-envelope
        span.icon.is-small.is-right(v-if="!isEmailValid")
          i.fa.fa-warning

      p.control.has-icons-left.has-icons-right
        input.input(type="password" placeholder="Password" v-model="password" @keyup.enter="login")
        span.icon.is-small.is-left
          i.fa.fa-user-secret
        span.icon.is-small.is-right(v-if="!isPasswordValid")
          i.fa.fa-warning

      p.control
        .has-text-centered
          button.button.is-primary(:disabled="inProgress" @click="login") Log in

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
</template>

<script>
import login from '@/utils/login.js';

import TemporalNotification from '@/components/widgets/TemporalNotification';

export default {
  name: 'login',

  components: {
    'temporal-notification': TemporalNotification,
  },

  data() {
    return {
      email: '',
      password: '',

      inProgress: false,
      errorMessage: '',
      showError: 0,  // random value to trigger the notification
    };
  },

  computed: {
    isEmailValid() {
      return !this.email || /(.{2,})@(\w{2,}\.\w{2,})/.test( this.email );
    },

    isPasswordValid() {
      return !this.password || this.password.length > 5;
    },
  },

  methods: {

    setError( msg ) {
      this.errorMessage = msg;
      this.showError = Math.random();
    },

    login( e ) {
      this.inProgress = true;

      login.logIn( this.email, this.password, ( err, user ) => {
        this.inProgress = false;

        if ( err ) {
          return this.setError( err.message );
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
