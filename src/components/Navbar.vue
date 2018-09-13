<template lang="pug">
  .nav.has-shadow(v-show="!isAssignment")
    .nav-left
      router-link.nav-item(to="/")
        h2.logo Silko
        //- img(src="../assets/icon-32.png")
      router-link.nav-item.is-tab(to="/schools" v-if="isAdmin")
        i.fa.fa-university
        span {{ tokens[ 'schools' ] }}
      router-link.nav-item.is-tab(to="/teachers" v-if="isAdmin || isSchool")
        i.fa.fa-users
        span {{ tokens[ 'teachers' ] }}
      router-link.nav-item.is-tab(to="/students" v-if="isAdmin || isSchool || isTeacher")
        i.fa.fa-child
        span {{ tokens[ 'students' ] }}
      router-link.nav-item.is-tab(to="/instructions" v-if="isTeacher")
        i.fa.fa-info
        span {{ tokens[ 'instructions' ] }}
      router-link.nav-item.is-tab(to="/classes" v-if="isTeacher")
        i.fa.fa-database
        span {{ tokens[ 'classes' ] }}
      router-link.nav-item.is-tab(to="/results" v-if="isTeacher")
        i.fa.fa-chart-pie
        span {{ tokens[ 'results' ] }}
      router-link.nav-item.is-tab(to="/assignments" v-if="isStudent")
        i.fa.fa-tasks
        span {{ tokens[ 'assignments' ] }}
    .nav-right(v-if="user")
      a.button(:href="manualLink" target="_blank") {{ tokens[ 'manual' ] }}
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
              a(v-on:click="logOut") {{ tokens[ 'logout' ] }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import login from '@/utils/login.js';
import { i10n, langs } from '@/utils/i10n.js';

// ts-check-only
import UserBase from '@/db/userBase';

const MANUAL_PAGES = {
  'admin': {
    '/': '',
  },
  'school': {
    '/': '',
    '/teachers': 'maintain-teachers.html',
    '/students': 'maintain-students.html',
  },
  'teacher': {
    '/': '',
    '/students': 'listing-students.html',
    '/instructions': 'introductions.html',
    '/classes': 'classes.html',
    '/results': 'results.html',
  },
  'student': {
    '/': '',
    '/assignments': 'assignments.html',
  }
}

export default {
  name: 'navbar',

  data() {
    return {
      /** @type {UserBase} */
      user: null,
      langs,
      isUsermenuDropped: false,
      isUsermenuHover: false,
      manualTopic: '',

      tokens: i10n( 'navbar', '_buttons', '_labels' ),
    };
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

    /** @returns {string} */
    manualLink() {
      let userType = 'teacher';
      if (this.user) {
        if (this.user.isSchool) {
          userType = 'school';
        }
        else if (this.user.isStudent) {
          userType = 'student';
        }
      }

      const lang = this.user ? this.user.prefs.lang : 'en';
      const manualPage = MANUAL_PAGES[ userType ][ this.manualTopic ] || '';

      return `https://uta-gasp.gitbooks.io/silko/${lang}/${userType}/${manualPage}`;
    },
  },

  methods: {
    /** @param {Event} e */
    logOut( e ) {
      login.logOut();
    },

    /** @param {Event} e */
    updateLanguage( e ) {
      this.user.prefs.lang = /** @type {HTMLInputElement} */ (e.target).value;
      this.user.update( /** @param {Error | string} err */ err => {
        eventBus.$emit( 'lang' );
      });
    },
  },

  created() {
    this.user = login.user;
    
    eventBus.$on( 'login', () => {
      this.tokens = i10n( 'navbar', '_buttons', '_labels' );
      this.user = login.user;
    } );
    eventBus.$on( 'logout', () => {
      this.user = null;
    } );
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'navbar', '_buttons', '_labels' );
    } );

    document.addEventListener( 'click', e => {
      this.isUsermenuDropped = false;
    });

    this.$router.onReady( () => {
      this.manualTopic = this.$router.currentRoute.path;
    });
    
    this.$router.beforeResolve( (to, from, next) => {
      this.manualTopic = to.path;
      next();
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
