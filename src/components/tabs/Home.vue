<template lang="pug">
  #home
    section.hero
      .hero-body
        .container
          //img(src="../assets/icon-32.png")
          h1.title.logo Silko
          h2.subtitle A reading aid for students and teachers
    section.section(v-if="isLoginVisible")
      login
</template>

<script>
  import eventBus from '@/utils/event-bus.js';
  import login from '@/utils/login.js';

  import Login from '@/components/widgets/Login'

  export default {
    name: 'home',

    data() {
      return {
        isLoginVisible: true
      }
    },

    components: {
      'login': Login
    },

    created() {
      eventBus.$on( 'login', id => {
        this.isLoginVisible = false;
      });
      eventBus.$on( 'logout', id => {
        this.isLoginVisible = true;
      });
    },

    mounted() {
      this.isLoginVisible = !login.user;
    }
  }
</script>

<style lang="less" scoped>
  .logo {
    font-family: 'Gloria Hallelujah', 'Avenir', Helvetica, Arial, sans-serif;
    padding-bottom: 0.5em;
  }
</style>
