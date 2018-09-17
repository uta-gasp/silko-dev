<template lang="pug">
  #students.section
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
            input.input(type="email" :placeholder="tokens[ 'email_id' ]" v-model="newEmail" :class="{'is-danger': newEmail.length && !isNewEmailValid}")
          p.help.is-danger(v-show="newEmail.length && !isNewEmailValid") {{ tokens[ 'email_invalid' ] }}

          p.control(v-show="!isRealEmail")
            input.input(type="text" :placeholder="tokens[ 'password' ]" v-model="newPassword" :class="{'is-danger': newPassword.length && !isNewPasswordValid}")
          p.help.is-danger(v-show="newPassword.length && !isNewPasswordValid") {{ tokens[ 'password_invalid' ] }}

          p.control
            input.input(type="text" :placeholder="tokens[ 'grade' ]" v-model="newGrade")

          p.control(v-if="isAdmin")
            span.select
              select(v-model="newSchool" required)
                option(value="" disabled selected hidden ) {{ tokens[ 'school' ] }}
                option(v-for="item in schoolItems" v-bind:value="item.value") {{ item.text }}

          p.control
            button.button.is-primary(:disabled="!canCreateStudent" @click="tryToCreateStudent") {{ tokens[ 'create' ] }}

    nav.panel
      p.panel-heading {{ tokens[ 'students' ] }}
      .panel-block.is-paddingless
        .container(v-if="students === null")
          loading
        .container(v-else-if="!students.length")
          i {{ tokens[ 'msg_no_students' ] }}
        table.table(v-else)
          thead
            tr
              th {{ tokens[ 'name' ] }}
              th(v-if="isAdmin") {{ tokens[ 'school' ] }}
              th {{ tokens[ 'grade' ] }}
              th(v-if="!isAdmin") {{ tokens[ 'classes' ] }}
              th(v-if="isAdmin")
                .is-pulled-right {{ tokens[ 'actions' ] }}
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
                  i.far.fa-trash-alt

    remove-warning(v-if="toDelete" object="student" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';
import login from '@/utils/login.js';
import { i10n } from '@/utils/i10n.js';

import Admin from '@/model/admin.js';
import School from '@/model/school.js';
import Student from '@/model/student.js';
import Teacher from '@/model/teacher.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';
import RemoveWarning from '@/components/widgets/RemoveWarning.vue';

// ts-check-only
import Class from '@/model/class.js';

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
      /** @type {Teacher} */
      teacher: null,
      /** @type {School} */
      school: null,

      newName: '',
      newEmail: '',
      newPassword: '',
      newGrade: '',
      newSchool: '',

      isCreating: false,
      /** @type {Student} */
      toDelete: null,

      /** @type {School[]} */
      schools: [],
      /** @type {Student[]} */
      students: null,
      /** @type {Class[]} */
      classes: [],

      tokens: i10n( 'students', '_form', '_buttons', '_labels', '_failures' ),
    };
  },

  computed: {

    /** @returns {boolean} */
    isAdmin() {
      return Admin.isLogged;
    },

    /** @returns {boolean} */
    isNewNameValid() {
      return this.newName.trim().length > 2;
    },

    /** @returns {boolean} */
    isNewEmailValid() {
      // allow plain IDs, not emails
      if ( this.newEmail.indexOf( '@' ) > 0 ) {
        return /(.{2,})@(\w{2,}\.\w{2,})/.test( this.newEmail.trim() );
      }
      else {
        return this.newEmail.length > 4;
      }
    },

    /** @returns {boolean} */
    isNewPasswordValid() {
      return this.newPassword.length >= 6 || this.isRealEmail;
    },

    /** @returns {boolean} */
    isNewGradeValid() {
      return !!this.newGrade.trim().length;
    },

    /** @returns {boolean} */
    isSchoolValid() {
      return !Admin.isLogged || !!this.newSchool;
    },

    /** @returns {boolean} */
    isRealEmail() {
      return this.newEmail.indexOf( '@' ) > 0 && this.newEmail.indexOf( login.DEFAULT_EMAIL_DOMAIN ) < 0;
    },

    /** @returns {boolean} */
    canCreateStudent() {
      return !this.isCreating &&
          this.isNewNameValid &&
          this.isNewEmailValid &&
          this.isNewPasswordValid &&
          this.isNewGradeValid &&
          this.isSchoolValid;
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

    /** @returns {string} */
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

    /** @returns {Promise} */
    loadSchools() {
      return School.list( /** @param {Error | string} err; @param {School[]} schools */ ( err, schools ) => {
        if ( err ) {
          return this.setError( err, this.tokens[ 'load' ]( this.tokens[ 'schools' ] ) );
        }

        this.schools = schools.sort( dataUtils.byName );
      } );
    },

    loadStudents() {
      const onDone = /** @param {Error | string} err; @param {Student[]} students */( err, students ) => {
        if ( err ) {
          this.students = [];
          return this.setError( err, this.tokens[ 'load' ]( this.tokens[ 'students' ] ) );
        }

        this.students = students.sort( /** @param {Student} a;@param {Student} b; @returns {number} */ ( a, b ) => {
          if ( a.school !== b.school ) {
            return a.school > b.school ? 1 : -1;
          }
          else if ( a.grade !== b.grade ) {
            return a.grade > b.grade ? 1 : -1;
          }
          else {
            return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
          }
        } );
      };

      if ( this.school ) {
        this.school.getStudents( onDone );
      }
      else if ( this.teacher ) {
        this.teacher.getSchool( /** @param {Error | string} err; @param {School} school */ ( err, school ) => {
          if ( err ) {
            return this.setError( err, this.tokens[ 'err_load_teacher' ] );
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

    /** @param {Event} e */
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
        this.setError( this.tokens[ 'err_exists' ], this.tokens[ 'add_new' ]( this.tokens[ 'student' ] ) );
      }
      else {
        this.createStudent( email );
      }
    },

    /** 
     * @param {string} email
     */
    createStudent( email ) {
      this.isCreating = true;

      const onFinished = /** @param {Error | string} err */ err => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, this.tokens[ 'add_new' ]( this.tokens[ 'student' ] ) );
        }
        else {
          this.newName = '';
          this.newEmail = '';
          this.newPassword = '';
          this.newGrade = '';
          this.loadStudents();

          this.setSuccess( this.tokens[ 'added' ]( this.tokens[ 'student' ] ) );
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
        School.get( this.newSchool, /** @param {Error | string} err; @param {School} school */ ( err, school ) => {
          if ( err ) {
            return onFinished( err );
          }

          school.createStudent( studentObject, onFinished );
        } );
      }
    },

    /** 
     * @param {Student} student
     * @param {Event} e
     */
    moveStudent( student, e ) {
      const el = /** @type {HTMLInputElement} */ (e.target);
      Admin.moveStudent( student, el.value, this.schools, /** @param {Error | string} err */ err => {
        if ( err ) {
          this.setError( err, this.tokens[ 'err_move' ] );
        }
        else {
          this.setSuccess( this.tokens[ 'msg_moved' ] );
        }
      } );
    },

    /** 
     * @param {Student} student
     * @returns {string}
     */
    getListOfStudentClasses( student ) {
      const classes = [];
      for ( let id in student.classes ) {
        classes.push( student.classes[ id ] );
      }
      return classes.join( ', ' );
    },

    /** 
     * @param {Student} student
     */
    remove( student ) {
      this.toDelete = student;
    },

    /** @param {{confirm: boolean}} e */
    removeWarningClosed( e ) {
      if ( e.confirm ) {
        const student = this.toDelete;

        School.get( student.school, /** @param {Error | string} err; @param {School} school */ ( err, school ) => {
          if ( err ) {
            return this.setError( err, this.tokens[ 'err_access_school' ] );
          }

          school.deleteStudent( student, /** @param {Error | string} err */ err => {
            if ( err ) {
              this.setError( err, this.tokens[ 'delete' ]( this.tokens[ 'student' ] ) );
            }
            else {
              this.setSuccess( this.tokens[ 'deleted' ]( this.tokens[ 'student' ] ) );
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
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'students', '_form', '_buttons', '_labels', '_failures' );
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
