<template lang="pug">
  #app
    navbar(v-show="isLoggedIn")
    section.section.is-paddingless
      .container.is-fluid.is-marginless
        router-view
</template>

<script>
import NavBar from '@/components/navbar';

import eventBus from '@/utils/event-bus.js';
import login from '@/utils/login.js';

export default {
  name: 'app',

  components: {
    navbar: NavBar,
  },

  data() {
    return {
      isLoggedIn: !!login.user,
    };
  },

  created() {
    console.log( 'App component created' );
    eventBus.$on( 'logout', () => {
      this.isLoggedIn = false;
    } );
    eventBus.$on( 'login', () => {
      this.isLoggedIn = true;
    } );
  },
};
</script>

<style lang="less" scoped>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    text-align: center;
    color: #2c3e50;
  }
</style>
