<template lang="pug">
  #teachers.section
    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

    nav.panel
      p.panel-heading Add teacher
      .panel-block
        .field.control
          p.control
            input.input(type="text" placeholder="Name" v-model="newName")
          p.control
            input.input(type="email" placeholder="Email" v-model="newEmail")
          p.control(v-if="isAdmin")
            span.select
              select(v-model="newSchool" required)
                option(value="" disabled selected hidden ) School
                option(v-for="item in schoolItems" v-bind:value="item.value") {{ item.text }}
          p.control
            button.button.is-primary(:disabled="!canCreate" @click="tryToCreate") Create
    nav.panel
      p.panel-heading Teachers
      .panel-block.is-paddingless
        .container(v-if="teachers === null")
          loading
        .container(v-else-if="!teachers.length")
          i No teachers exists yet
        table.table(v-else)
          thead
            tr
              th Name
              th(v-if="isAdmin") School
              th(v-if="!isAdmin") Classes
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

import Admin from '@/model/admin.js';
import School from '@/model/school.js';
import Teacher from '@/model/teacher.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading';
import TemporalNotification from '@/components/widgets/TemporalNotification';

export default {
  name: 'teachers',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      school: null,

      newName: '',
      newEmail: '',
      newSchool: '',

      isCreating: false,

      schools: [],
      teachers: null,
    };
  },

  computed: {

    isNewNameValid() {
      return this.newName.trim().length > 2;
    },

    isNewEmailValid() {
      return /(.{2,})@(\w{2,}\.\w{2,})/.test( this.newEmail.trim() );
    },

    isSchoolValid() {
      return !this.isAdmin || this.newSchool;
    },

    canCreate() {
      return !this.isCreating &&
          this.isNewNameValid &&
          this.isNewEmailValid &&
          this.isSchoolValid;
    },

    isAdmin() {
      return Admin.isLogged;
    },

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

    loadSchools() {
      return School.list( ( err, schools ) => {
        if ( err ) {
          return this.setError( err, 'Failed to load schools' );
        }

        this.schools = schools.sort( dataUtils.byName );
      } );
    },

    loadTeachers() {
      const onDone = ( err, teachers ) => {
        if ( err ) {
          this.teachers = [];
          return this.setError( err, 'Failed to load teachers' );
        }

        this.teachers = teachers.sort( ( a, b ) => {
          if ( a.school !== b.school ) {
            return a.school > b.school;
          }
          else {
            return a.name.toLowerCase() > b.name.toLowerCase();
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

    tryToCreate( e ) {
      if ( !this.canCreate ) {
        return;
      }

      const exists = this.teachers.some( teacher => {
        return teacher.email.toLowerCase() === this.newEmail.toLowerCase().trim();
      } );

      if ( exists ) {
        this.setError( 'A teacher with this email exists already', 'Failed to add a new teacher' );
      }
      else {
        this.createTeacher();
      }
    },

    createTeacher() {
      this.isCreating = true;

      const onFinished = ( err, id ) => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, 'Failed to add a new teacher' );
        }
        else {
          this.newName = '';
          this.newEmail = '';
          this.loadTeachers();

          this.setSuccess( 'New teacher was added' );
        }
      };

      if ( this.school ) {
        this.school.createTeacher( this.newName.trim(), this.newEmail.trim(), onFinished );
      }
      else {  // admin
        School.get( this.newSchool, ( err, school ) => {
          if ( err ) {
            return onFinished( err );
          }

          school.createTeacher( this.newName.trim(), this.newEmail.trim(), onFinished );
        } );
      }
    },

    moveTeacher( teacher, e ) {
      Admin.moveTeacher( teacher, e.target.value, this.schools );
    },

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
