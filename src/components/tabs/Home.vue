<template lang="pug">
  #home
    section.hero
      .hero-body
        .container
          //img(src="../assets/icon-32.png")
          h1.title.logo Silko
          h2.subtitle A reading aid for students and teachers
    section.section(v-if="loginVisible")
      login
</template>

<script>
  import { EventBus } from '@/model/event-bus.js';
  import db from '@/model/db.js';

  import login from '@/components/widgets/Login'

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
  .logo {
    font-family: 'Gloria Hallelujah', 'Avenir', Helvetica, Arial, sans-serif;
    padding-bottom: 0.5em;
  }
</style>
