<template lang="pug">
  .nav.has-shadow(v-show="!isAssignment")
    .nav-left
      router-link.nav-item(to="/")
        h2.logo Silko
        //- img(src="../assets/icon-32.png")
      router-link.nav-item.is-tab(to="/schools" v-if="isAdmin")
        i.fa.fa-university
        span {{ tokens[ 'link_schools' ] }}
      router-link.nav-item.is-tab(to="/teachers" v-if="isAdmin || isSchool")
        i.fa.fa-users
        span {{ tokens[ 'link_teachers' ] }}
      router-link.nav-item.is-tab(to="/students" v-if="isAdmin || isSchool || isTeacher")
        i.fa.fa-child
        span {{ tokens[ 'link_students' ] }}
      router-link.nav-item.is-tab(to="/instructions" v-if="isTeacher")
        i.fa.fa-info
        span {{ tokens[ 'link_instructions' ] }}
      router-link.nav-item.is-tab(to="/classes" v-if="isTeacher")
        i.fa.fa-database
        span {{ tokens[ 'link_classes' ] }}
      router-link.nav-item.is-tab(to="/results" v-if="isTeacher")
        i.fa.fa-pie-chart
        span {{ tokens[ 'link_results' ] }}
      router-link.nav-item.is-tab(to="/assignments" v-if="isStudent")
        i.fa.fa-tasks
        span {{ tokens[ 'link_assignments' ] }}
    .nav-right(v-if="user")
      span.lang
        .select
          select(:value="user.prefs.lang" @input="updateLanguage")
            option(v-for="lang in langs" :key="lang") {{ lang }}
        
      .user-block.is-small
        //- span.user {{ user.name }}
        span.user {{ user.ref.name }}
      span.nav-item
        a.button(v-on:click="logOut()") {{ tokens[ 'user_logout' ] }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import login from '@/utils/login.js';
import { i10n, langs } from '@/utils/i10n.js';

export default {
  name: 'navbar',

  data() {
    return {
      user: null,
      langs,
      tokens: i10n( 'navbar' ),
    };
  },

  methods: {
    logOut() {
      login.logOut();
    },

    updateLanguage( e ) {
      this.user.prefs.lang = e.target.value;
      this.user.update( err => {
        eventBus.$emit( 'lang' );
      });
    },
  },

  computed: {

    /** @returns {boolean} */
    isAdmin() {
      return this.user ? this.user.isAdmin : false;
    },

    /** @returns {boolean} */
    isSchool() {
      return this.user ? this.user.isSchool : false;
    },

    /** @returns {boolean} */
    isTeacher() {
      return this.user ? this.user.isTeacher : false;
    },

    /** @returns {boolean} */
    isStudent() {
      return this.user ? this.user.isStudent : false;
    },

    /** @returns {boolean} */
    isAssignment() {
      return this.$route.path.indexOf( '/assignment/' ) >= 0;
    },
  },

  created() {
    this.user = login.user;
    
    eventBus.$on( 'login', () => {
      this.tokens = i10n( 'navbar' );
      this.user = login.user;
    } );
    eventBus.$on( 'logout', () => {
      this.user = null;
    } );
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'navbar' );
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

  .lang {
    display: inline-block;
    margin: auto 1em;
  }

  .logo {
    font-family: 'Gloria Hallelujah', 'Avenir', Helvetica, Arial, sans-serif;
  }
</style>
