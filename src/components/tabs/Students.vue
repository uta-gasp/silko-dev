<template lang="pug">
  #students.section
    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

    nav.panel
      p.panel-heading Add student
      .panel-block
        .field.control
          p.control
            input.input(type="text" placeholder="Name" v-model="newName")
          p.control
            input.input(type="email" placeholder="Email or ID" v-model="newEmail")
          p.control(v-show="!isRealEmail")
            input.input(type="text" placeholder="Password" v-model="newPassword")
          p.control
            input.input(type="text" placeholder="Grade" v-model="newGrade")
          p.control(v-if="isAdmin")
            span.select
              select(v-model="newSchool" required)
                option(value="" disabled selected hidden ) School
                option(v-for="item in schoolItems" v-bind:value="item.value") {{ item.text }}
          p.control
            button.button.is-primary(:disabled="!canCreateStudent" @click="tryToCreateStudent") Create

    nav.panel
      p.panel-heading Students
      .panel-block.is-paddingless
        .container(v-if="students === null")
          loading
        .container(v-else-if="!students.length")
          i No students exists yet
        table.table(v-else)
          thead
            tr
              th Name
              th(v-if="isAdmin") School
              th Grade
              th(v-if="!isAdmin") Classes
              th(v-if="isAdmin")
                .is-pulled-right Action
          tbody
            tr(v-for="student in students" v-if="!student.deleted")
              td {{ student.name }}
              td(v-if="isAdmin")
                span.select
                  select(:value="student.school" @input="moveStudent( student, $event )")
                    option(v-for="school in schools" :value="school.id") {{ school.name }}
              td {{ student.grade }}
              td(v-if="!isAdmin")
                span.ellipsis {{ getListOfStudentClasses( student ) }}
              td(v-if="isAdmin").is-narrow
                button.button.is-danger(@click="remove( student )")
                  i.fa.fa-remove

    remove-warning(v-if="toDelete" object="student" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';
import login from '@/utils/login.js';

import Admin from '@/model/admin.js';
import School from '@/model/school.js';
import Student from '@/model/student.js';
import Teacher from '@/model/teacher.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading';
import TemporalNotification from '@/components/widgets/TemporalNotification';
import RemoveWarning from '@/components/widgets/RemoveWarning';

export default {
  name: 'students',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
    'remove-warning': RemoveWarning,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      teacher: null,
      school: null,

      newName: '',
      newEmail: '',
      newPassword: '',
      newGrade: '',
      newSchool: '',

      isCreating: false,
      toDelete: null,

      schools: [],
      students: null,
      classes: [],
    };
  },

  computed: {

    isAdmin() {
      return Admin.isLogged;
    },

    isNewNameValid() {
      return this.newName.trim().length > 2;
    },

    isNewEmailValid() {
      // allow plain IDs, not emails
      if ( this.newEmail.indexOf( '@' ) > 0 ) {
        return /(.{2,})@(\w{2,}\.\w{2,})/.test( this.newEmail.trim() );
      }
      else {
        return this.newEmail.length > 4;
      }
    },

    isNewPasswordValid() {
      return this.newPassword.length >= 6 || this.isRealEmail;
    },

    isNewGradeValid() {
      return this.newGrade.trim().length;
    },

    isSchoolValid() {
      return !Admin.isLogged || this.newSchool;
    },

    isRealEmail() {
      return this.newEmail.indexOf( '@' ) > 0 && this.newEmail.indexOf( login.DEFAULT_EMAIL_DOMAIN ) < 0;
    },

    canCreateStudent() {
      return !this.isCreating &&
          this.isNewNameValid &&
          this.isNewEmailValid &&
          this.isNewPasswordValid &&
          this.isNewGradeValid &&
          this.isSchoolValid;
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

    toDeleteName() {
      return this.toDelete ? this.toDelete.name : '';
    },
  },

  methods: {

    init() {
      if ( Admin.isLogged ) {
        this.loadSchools().then( () => {
          this.loadStudents();
        } );
      }
      else if ( School.isLogged ) {
        this.school = School.instance;
        this.loadStudents();
      }
      else if ( Teacher.isLogged ) {
        this.teacher = Teacher.instance;
        this.loadStudents();
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

    loadStudents() {
      const onDone = ( err, students ) => {
        if ( err ) {
          this.students = [];
          return this.setError( err, 'Failed to load students' );
        }

        this.students = students.sort( ( a, b ) => {
          if ( a.school !== b.school ) {
            return a.school > b.school;
          }
          else if ( a.grade !== b.grade ) {
            return a.grade > b.grade;
          }
          else {
            return a.name.toLowerCase() > b.name.toLowerCase();
          }
        } );
      };

      if ( this.school ) {
        this.school.getStudents( onDone );
      }
      else if ( this.teacher ) {
        this.teacher.getSchool( ( err, school ) => {
          if ( err ) {
            return this.setError( err, 'Failed to load teacher\'s school' );
          }
          school.getStudents( onDone );
        } );
      }
      else {
        Student.list( onDone );
      }
    },

    checkAccess() {
      if ( !Admin.isLogged && !Teacher.isLogged && !School.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    tryToCreateStudent( e ) {
      if ( !this.canCreateStudent ) {
        return;
      }

      let email = this.newEmail.trim();
      if ( email.indexOf( '@' ) < 0 ) {
        email += login.DEFAULT_EMAIL_DOMAIN;
      }

      const exists = this.students.some( student => {
        return student.email.toLowerCase() === email.toLowerCase();
      } );

      if ( exists ) {
        this.setError( 'A student with this email or ID exists already', 'Failed to add new student' );
      }
      else {
        this.createStudent( email );
      }
    },

    createStudent( email ) {
      this.isCreating = true;

      const onFinished = ( err, _ ) => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, 'Failed to add new student' );
        }
        else {
          this.newName = '';
          this.newEmail = '';
          this.newPassword = '';
          this.newGrade = '';
          this.loadStudents();

          this.setSuccess( 'New student was added' );
        }
      };

      const password = this.isRealEmail ? null : this.newPassword;
      const studentObject = {
        name: this.newName.trim(),
        email,
        password,
        grade: this.newGrade.trim(),
      };

      if ( this.school ) {
        this.school.createStudent( studentObject, onFinished );
      }
      else if ( this.teacher ) {
        this.teacher.createStudent( studentObject, onFinished );
      }
      else {  // admin
        School.get( this.newSchool, ( err, school ) => {
          if ( err ) {
            return onFinished( err );
          }

          school.createStudent( studentObject, onFinished );
        } );
      }
    },

    moveStudent( student, e ) {
      Admin.moveStudent( student, e.target.value, this.schools, err => {
        if ( err ) {
          this.setError( err, 'Failed to move the student to another school' );
        }
        else {
          this.setSuccess( 'The student was moved to another school' );
        }
      } );
    },

    getListOfStudentClasses( student ) {
      const classes = [];
      for ( let id in student.classes ) {
        classes.push( student.classes[ id ] );
      }
      return classes.join( ', ' );
    },

    remove( item ) {
      this.toDelete = item;
    },

    removeWarningClosed( e ) {
      if ( e.confirm ) {
        const student = this.toDelete;

        School.get( student.school, ( err, school ) => {
          if ( err ) {
            return this.setError( err, 'Failed to access the student school' );
          }

          school.deleteStudent( student, err => {
            if ( err ) {
              this.setError( err, 'Failed to remove the student from the database' );
            }
            else {
              this.setSuccess( 'The student was removed' );
            }

            this.init();
          } );
        } );
      }

      this.toDelete = null;
    },
  },

  created() {
    console.log( 'Students component created' );
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
