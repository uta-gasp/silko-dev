<template lang="pug">
  .nav.has-shadow(v-show="!isAssignment")
    .nav-left
      router-link.nav-item(to="/")
        h2.logo Silko
        //- img(src="../assets/icon-32.png")
      router-link.nav-item.is-tab(to="/schools" v-if="isAdmin")
        i.fa.fa-university
        span Schools
      router-link.nav-item.is-tab(to="/teachers" v-if="isAdmin || isSchool")
        i.fa.fa-users
        span Teachers
      router-link.nav-item.is-tab(to="/students" v-if="isAdmin || isSchool || isTeacher")
        i.fa.fa-child
        span Students
      router-link.nav-item.is-tab(to="/instructions" v-if="isTeacher")
        i.fa.fa-info
        span Instructions
      router-link.nav-item.is-tab(to="/classes" v-if="isTeacher")
        i.fa.fa-database
        span Classes
      router-link.nav-item.is-tab(to="/results" v-if="isTeacher")
        i.fa.fa-pie-chart
        span Results
      router-link.nav-item.is-tab(to="/assignments" v-if="isStudent")
        i.fa.fa-tasks
        span Assignments
    .nav-right(v-if="user")
      .user-block.is-small
        //- span.user {{ user.name }}
        span.user {{ user.ref.name }}
      span.nav-item
        a.button(v-on:click="logOut()") Logout
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import login from '@/utils/login.js';

export default {
  name: 'navbar',

  data() {
    return {
      user: null,
    };
  },

  methods: {
    logOut() {
      login.logOut();
    },
  },

  computed: {

    isAdmin() {
      return this.user ? this.user.isAdmin : false;
    },

    isSchool() {
      return this.user ? this.user.isSchool : false;
    },

    isTeacher() {
      return this.user ? this.user.isTeacher : false;
    },

    isStudent() {
      return this.user ? this.user.isStudent : false;
    },

    isAssignment() {
      return this.$route.path.indexOf( '/assignment/' ) >= 0;
    },
  },

  created() {
    eventBus.$on( 'login', () => {
      this.user = login.user;
    } );
    eventBus.$on( 'logout', () => {
      this.user = null;
    } );
  },
};
</script>

<style lang="less" scoped>
  .nav {
    z-index: 2;
  }

  .nav-item > i {
    margin-right: 8px;
  }

  .user-block {
    display: flex;
    flex-direction: column;
  }

  .user {
    display: inline-block;
    margin: auto 0;
  }

  .logo {
    font-family: 'Gloria Hallelujah', 'Avenir', Helvetica, Arial, sans-serif;
  }
</style>
