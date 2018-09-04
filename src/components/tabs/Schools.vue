<template lang="pug">
  #schools.section
    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

    nav.panel
      p.panel-heading New school
      .panel-block
        .field.control
          p.control
            input.input(type="text" placeholder="Name" v-model="newName")
          p.control
            input.input(type="email" placeholder="Email" v-model="newEmail")
          p.control
            button.button.is-primary(:disabled="!canCreate" @click="tryToCreate") Create

    nav.panel
      p.panel-heading Schools
      .panel-block.is-paddingless
        .container(v-if="schools === null")
          loading
        .container(v-else-if="!schools.length")
          i No school exists yet
        table.table(v-else)
          thead
            tr
              th Name
              th Teachers
              th Students
          tbody
            tr(v-for="item in schools")
              td {{ item.name }}
              td {{ item.teachers | count }}
              td {{ item.students | count }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';

import Admin from '@/model/admin.js';
import School from '@/model/school.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';

export default {
  name: 'schools',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      newName: '',
      newEmail: '',

      isCreating: false,

      /** @type {School[]} */
      schools: null,
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
    canCreate() {
      return !this.isCreating &&
          this.isNewNameValid &&
          this.isNewEmailValid;
    },
  },

  methods: {

    loadSchools() {
      School.list( /** @param {Error | string} err; @param {School[]} schools */ ( err, schools ) => {
        if ( err ) {
          this.schools = [];
          return this.setError( err, 'Failed to load schools' );
        }

        this.schools = schools.sort( dataUtils.byName );
      } );
    },

    checkAccess() {
      if ( !Admin.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    /** @param {Event} e */
    tryToCreate( e ) {
      if ( !this.canCreate ) {
        return;
      }

      const exists = this.schools.some( school => {
        return false ||
            school.name.toLowerCase() === this.newName.toLowerCase().trim() ||
            school.email.toLowerCase() === this.newEmail.toLowerCase().trim();
      } );

      if ( exists ) {
        this.setError( 'A school with this name or email exists already', 'Failed to add new school' );
      }
      else {
        this.createSchool();
      }
    },

    createSchool() {
      this.isCreating = true;
      Admin.createSchool( this.newName.trim(), this.newEmail.trim(), /** @param {Error | string} err */ err => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, 'Failed to add new school' );
        }
        else {
          this.newName = '';
          this.newEmail = '';
          this.loadSchools();

          this.setSuccess( 'New school was created' );
        }
      } );
    },
  },

  filters: {
    /** 
     * @param {Object} obj 
     * @returns {number}
     * */
    count( obj ) {
      return Object.keys( obj ).length;
    },
  },

  created() {
    // BUG - every logging in creates additional Schools.vue instance, even after logging out
    console.log( 'Schools component created' );
    eventBus.$on( 'logout', () => {
      this.checkAccess();
    } );
    eventBus.$on( 'login', () => {
      this.loadSchools();
    } );

    this.checkAccess();
  },

  mounted() {
    this.loadSchools();
  },
};
</script>

<style lang="less" scoped>
</style>
