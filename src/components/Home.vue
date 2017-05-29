<template lang="pug">
  #home
    section.hero
      .hero-body
        .container
          //img(src="../assets/icon-32.png")
          h1.title Welcome to Eye-School
          h2.subtitle Reading Aid for teachers
    section.section(v-if="loginVisible")
      login
</template>

<script>
  import { EventBus } from '../model/event-bus.js';
  import db from '../model/db.js';

  import login from './login'

  export default {
    name: 'home',
    data() {
      return {
        loginVisible: true
      }
    },

    components: {
      login
    },

    created() {
      EventBus.$on( 'login', id => {
        this.loginVisible = false;
      });
      EventBus.$on( 'logout', id => {
        this.loginVisible = true;
      });
    },

    mounted() {
      this.loginVisible = !db.user;
    }
  }
</script>

<style lang="less" scoped>
</style>
