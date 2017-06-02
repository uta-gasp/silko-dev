<template lang="pug">
  .nav.has-shadow(v-show="!isAssignment")
    .nav-left
      router-link.nav-item.is-brand(to="/")
        img(src="../assets/icon-32.png")
      router-link.nav-item.is-tab(to="/schools" v-if="isAdmin")
        i.fa.fa-university
        span Schools
      router-link.nav-item.is-tab(to="/Teachers" v-if="isSchoolOrAdmin")
        i.fa.fa-users
        span Teachers
      router-link.nav-item.is-tab(to="/students" v-if="isAdmin || isSchool || isTeacher")
        i.fa.fa-child
        span Students
      router-link.nav-item.is-tab(to="/intros" v-if="isTeacher")
        i.fa.fa-info
        span Instructions
      router-link.nav-item.is-tab(to="/classes" v-if="isTeacher")
        i.fa.fa-database
        span Classes
      router-link.nav-item.is-tab(to="/assignments" v-if="isStudent")
        i.fa.fa-tasks
        span Assignments
    .nav-right(v-if="user")
      .user-block.is-small
        span.user {{user.name}}
        span.user {{user.ref.name}}
      span.nav-item
        a.button(v-on:click="logOut()") Logout
</template>

<script>
  import { EventBus }  from '../model/event-bus.js';
  import db from '../model/db.js';

  export default {
    name: 'navbar',

    data() {
      return {
        user: null
      }
    },

    methods: {

      logOut() {
        db.logOut();
      }
    },

    computed: {

      isAdmin() {
        return this.user ? this.user.isAdmin : false;
      },

      isSchool() {
        return this.user ? this.user.isSchool : false;
      },

      isSchoolOrAdmin() {
        return this.user ? this.user.isAdmin || this.user.isSchool : false;
      },

      isTeacherOrAdmin() {
        return this.user ? this.user.isAdmin || this.user.isTeacher : false;
      },

      isTeacher() {
        return this.user ? this.user.isTeacher : false;
      },

      isStudent() {
        return this.user ? this.user.isStudent : false;
      },

      isAssignment() {
        return this.$route.path.startsWith( '/assignment/' );
      }
    },

    created() {
      EventBus.$on( 'login', () => {
        this.user = db.user;
      });
      EventBus.$on( 'logout', () => {
        this.user = null;
      });
    }
  }
</script>

<style lang="less" scoped>
  .nav-item > * {
    margin: 4px;
  }

  .user-block {
    display: flex;
    flex-direction: column;
  }

  .user {
  }
</style>
