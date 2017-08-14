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
            input.input(type="email" placeholder="Email" v-model="newEmail")
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
      return /(.{2,})@(\w{2,}\.\w{2,})/.test( this.newEmail.trim() );
    },

    isNewGradeValid() {
      return this.newGrade.trim().length;
    },

    isSchoolValid() {
      return !Admin.isLogged || this.newSchool;
    },

    canCreateStudent() {
      return !this.isCreating &&
          this.isNewNameValid &&
          this.isNewEmailValid &&
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

      const exists = this.students.some( student => {
        return student.email.toLowerCase() === this.newEmail.toLowerCase().trim();
      } );

      if ( exists ) {
        this.setError( 'A student with this email exists already', 'Failed to add new student' );
      }
      else {
        this.createStudent();
      }
    },

    createStudent() {
      this.isCreating = true;

      const onFinished = ( err, id ) => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, 'Failed to add new student' );
        }
        else {
          this.newName = '';
          this.newEmail = '';
          this.loadStudents();

          this.setSuccess( 'New student was added' );
        }
      };

      if ( this.school ) {
        this.school.createStudent( this.newName.trim(), this.newEmail.trim(), this.newGrade.trim(), onFinished );
      }
      else if ( this.teacher ) {
        this.teacher.createStudent( this.newName.trim(), this.newEmail.trim(), this.newGrade.trim(), onFinished );
      }
      else {  // admin
        School.get( this.newSchool, ( err, school ) => {
          if ( err ) {
            return onFinished( err );
          }

          school.createStudent( this.newName.trim(), this.newEmail.trim(), this.newGrade.trim(), onFinished );
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
