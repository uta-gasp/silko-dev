<template lang="pug">
  #schools.section
    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

    nav.panel
      p.panel-heading Add school
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

import Loading from '@/components/widgets/Loading';
import TemporalNotification from '@/components/widgets/TemporalNotification';

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

      schools: null,
    };
  },

  computed: {

    isNewNameValid() {
      return this.newName.trim().length > 2;
    },

    isNewEmailValid() {
      return /(.{2,})@(\w{2,}\.\w{2,})/.test( this.newEmail.trim() );
    },

    canCreate() {
      return !this.isCreating &&
          this.isNewNameValid &&
          this.isNewEmailValid;
    },
  },

  methods: {

    loadSchools() {
      School.list( ( err, schools ) => {
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
      Admin.createSchool( this.newName.trim(), this.newEmail.trim(), ( err, _ ) => {
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
    count( obj ) {
      return Object.keys( obj ).length;
      // let result = 0;
      // for ( let _ in obj ) {
      //   result++;
      // }
      // return result;
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
