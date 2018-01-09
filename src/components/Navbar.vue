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
      #usermenu.dropdown.is-right(:class="{ 'is-active': isUsermenuDropped }")
        .dropdown-trigger
          button.button(
            aria-haspopup="true" 
            aria-controls="dropdown-menu" 
            @click.stop="isUsermenuDropped = !isUsermenuDropped" 
            @mouseover="isUsermenuHover = true"
            @mouseleave="isUsermenuHover = false"
            :class="{ 'is-primary': isUsermenuDropped }"
          )
            span {{ user.ref.name }}
            span.icon.is-small(:style="{ 'color': (isUsermenuHover && !isUsermenuDropped) ? 'hsl(171, 100%, 41%)' : 'inherit', 'transform': 'translateY(0.1em)' }")
              i.fa.fa-cog(aria-hidden="true")
        .dropdown-menu(role="menu")
          .dropdown-content
            .select(@click.stop="")
              select(:value="user.prefs.lang" @input="updateLanguage")
                option(v-for="lang in langs" :key="lang") {{ lang }}
            hr.dropdown-divider
            .nav-item
              a(v-on:click="logOut") {{ tokens[ 'user_logout' ] }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import login from '@/utils/login.js';
import { i10n, langs } from '@/utils/i10n.js';

// ts-check-only
import UserBase from '@/db/userBase';

export default {
  name: 'navbar',

  data() {
    return {
      /** @type {UserBase} */
      user: null,
      langs,
      tokens: i10n( 'navbar' ),
      isUsermenuDropped: false,
      isUsermenuHover: false,
    };
  },

  methods: {
    logOut( e ) {
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

    document.addEventListener( 'click', e => {
      this.isUsermenuDropped = false;
    });
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

  .nav-right {
    overflow: unset;
    padding: 0.5em;
  }

  #usermenu {
    .dropdown-menu {
      min-width: unset;
    }

    .dropdown-content {
      min-width: unset;
      padding: 0.2em 0.5em;
    }

    .button,
    .select select {
      border-width: 0;
    }

    .button.is-focused:not(:active), 
    .button:focus:not(:active) {
      -webkit-box-shadow: inherit !important;
      box-shadow: inherit !important;
    }  

    .lang {
      display: inline-block;
      margin: auto 1em;
    }
  }

  .logo {
    font-family: 'Gloria Hallelujah', 'Avenir', Helvetica, Arial, sans-serif;
  }
</style>
