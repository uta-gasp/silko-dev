<template lang="pug">
  #teachers.section
    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

    nav.panel
      p.panel-heading {{ tokens[ 'hdr_new' ] }}
      .panel-block
        .field.control
          p.control
            input.input(type="text" :placeholder="tokens[ 'name' ]" v-model="newName" :class="{'is-danger': newName.length && !isNewNameValid}")
          p.help.is-danger(v-show="newName.length && !isNewNameValid") {{ tokens[ 'name_invalid' ] }}

          p.control
            input.input(type="email" :placeholder="tokens[ 'email' ]" v-model="newEmail" :class="{'is-danger': newEmail.length && !isNewEmailValid}")
          p.help.is-danger(v-show="newEmail.length && !isNewEmailValid") {{ tokens[ 'email_invalid' ] }}

          p.control(v-if="isAdmin")
            span.select
              select(v-model="newSchool" required)
                option(value="" disabled selected hidden ) {{ tokens[ 'school' ] }}
                option(v-for="item in schoolItems" v-bind:value="item.value") {{ item.text }}
                
          p.control
            button.button.is-primary(:disabled="!canCreate" @click="tryToCreate") {{ tokens[ 'create' ] }}
    nav.panel
      p.panel-heading {{ tokens[ 'teachers' ] }}
      .panel-block.is-paddingless
        .container(v-if="teachers === null")
          loading
        .container(v-else-if="!teachers.length")
          i {{ tokens[ 'msg_no_teachers' ] }}
        table.table(v-else)
          thead
            tr
              th {{ tokens[ 'name' ] }}
              th(v-if="isAdmin") {{ tokens[ 'school' ] }}
              th(v-if="!isAdmin") {{ tokens[ 'classes' ] }}
          tbody
            tr(v-for="teacher in teachers")
              td {{ teacher.name }}
              td(v-if="isAdmin")
                span.select
                  select(:value="teacher.school" @input="moveTeacher( teacher, $event )")
                    option(v-for="school in schools" :value="school.id") {{ school.name }}
              td(v-if="!isAdmin")
                span.ellipsis {{ getListOfTeacherClasses( teacher ) }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';
import { i10n } from '@/utils/i10n.js';

import Admin from '@/model/admin.js';
import School from '@/model/school.js';
import Teacher from '@/model/teacher.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';

export default {
  name: 'teachers',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      /** @type {School} */
      school: null,

      newName: '',
      newEmail: '',
      newSchool: '',

      isCreating: false,

      /** @type {School[]} */
      schools: [],
      /** @type {Teacher[]} */
      teachers: null,

      tokens: i10n( 'teachers', '_form', '_buttons', '_labels', '_failures' ),
    };
  },

  computed: {

    /** @returns {boolean} */
    isNewNameValid() {
      return this.newName.trim().length > 2;
    },

    /** @returns {boolean} */
    isNewEmailValid() {
      return /(.{2,})@(\w{2,}\.\w{2,})/.test( this.newEmail.trim() );
    },

    /** @returns {boolean} */
    isSchoolValid() {
      return !this.isAdmin || !!this.newSchool;
    },

    /** @returns {boolean} */
    canCreate() {
      return !this.isCreating &&
          this.isNewNameValid &&
          this.isNewEmailValid &&
          this.isSchoolValid;
    },

    /** @returns {boolean} */
    isAdmin() {
      return Admin.isLogged;
    },

    /** @returns {{value: string, text: string}[]} */
    schoolItems() {
      if ( !this.schools ) {
        return [];
      }
      return this.schools.map( school => {
        return {
          value: school.id,
          text: school.name,
        };
      } );
    },
  },

  methods: {

    init() {
      if ( Admin.isLogged ) {
        this.loadSchools().then( () => {
          this.loadTeachers();
        } );
      }
      else if ( School.isLogged ) {
        this.school = School.instance;
        this.loadTeachers();
      }
    },

    /** @returns {Promise} */
    loadSchools() {
      return School.list( /** @param {Error | string} err; @param {School[]} schools*/ ( err, schools ) => {
        if ( err ) {
          return this.setError( err, this.tokens[ 'load' ]( this.tokens[ 'schools' ] ) );
        }

        this.schools = schools.sort( dataUtils.byName );
      } );
    },

    /** @returns {Promise} */
    loadTeachers() {
      const onDone = /** @param {Error | string} err; @param {Teacher[]} teachers */ ( err, teachers ) => {
        if ( err ) {
          this.teachers = [];
          return this.setError( err, this.tokens[ 'load' ]( this.tokens[ 'teachers' ] ) );
        }

        this.teachers = teachers.sort( /** @param {Teacher} a; @param {Teacher} b @returns {number} */ ( a, b ) => {
          if ( a.school !== b.school ) {
            return a.school > b.school ? 1 : -1;
          }
          else {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          }
        } );
      };

      if ( !this.school ) {
        return Teacher.list( onDone );
      }

      return this.school.getTeachers( onDone );
    },

    checkAccess() {
      if ( !Admin.isLogged && !School.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    /** @param {Event} e */
    tryToCreate( e ) {
      if ( !this.canCreate ) {
        return;
      }

      const exists = this.teachers.some( teacher => {
        return teacher.email.toLowerCase() === this.newEmail.toLowerCase().trim();
      } );

      if ( exists ) {
        this.setError( this.tokens[ 'err_exists' ], this.tokens[ 'add_new' ]( this.tokens[ 'teacher' ] ) );
      }
      else {
        this.createTeacher();
      }
    },

    createTeacher() {
      this.isCreating = true;

      const onFinished = /** @param {Error | string} err */ err => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, this.tokens[ 'add_new' ]( this.tokens[ 'teacher' ] ) );
        }
        else {
          this.newName = '';
          this.newEmail = '';
          this.loadTeachers();

          this.setSuccess( this.tokens[ 'added' ]( this.tokens[ 'teacher' ] ) );
        }
      };

      if ( this.school ) {
        this.school.createTeacher( this.newName.trim(), this.newEmail.trim(), onFinished );
      }
      else {  // admin
        School.get( this.newSchool, /** @param {Error | string} err; @param {School} school */ ( err, school ) => {
          if ( err ) {
            return onFinished( err );
          }

          school.createTeacher( this.newName.trim(), this.newEmail.trim(), onFinished );
        } );
      }
    },

    /** 
     * @param {Teacher} teacher
     * @param {Event} e
     */
    moveTeacher( teacher, e ) {
      const el = /** @type {HTMLInputElement} */ (e.target);
      Admin.moveTeacher( teacher, el.value, this.schools, /** @param {Error | string} err */ err => {
        if ( err ) {
          this.setError( err, this.tokens[ 'err_move' ] );
        }
        else {
          this.setSuccess( this.tokens[ 'msg_moved' ] );
        }
      } );
    },

    /** 
     * @param {Teacher} teacher
     * @returns {string}
     */
    getListOfTeacherClasses( teacher ) {
      const classes = [];
      for ( let id in teacher.classes ) {
        classes.push( teacher.classes[ id ] );
      }
      return classes.join( ', ' );
    },
  },

  created() {
    console.log( 'Teachers component created' );
    eventBus.$on( 'logout', () => {
      this.checkAccess();
    } );
    eventBus.$on( 'login', () => {
      this.init();
    } );
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'teachers', '_form', '_buttons', '_labels', '_failures' );
    } );

    this.checkAccess();
  },

  mounted() {
    this.init();
  },
};
</script>

<style lang="less" scoped>
  .ellipsis {
    text-overflow: ellipsis;
  }

  select:invalid {
    color: #999;
  }

  select {
    padding-left: 5px;
  }

  option {
    color: #222;
  }
</style>
