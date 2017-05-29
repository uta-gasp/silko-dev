<template lang="pug">
  #teachers
    nav.panel
      creation-error(object="teacher" :show="showCreationError" :error="creationError")
      creation-success(object="teacher" :show="showCreationSuccess")
      p.panel-heading Add teacher
      .panel-block
        .field
          p.control
            input.input(type="text" placeholder="Name" v-model="newName")
          p.control
            input.input(type="email" placeholder="Email" v-model="newEmail")
          p.control(v-if="isAdmin")
            span.select
              select(v-model="newSchool" required)
                option(value="" disabled selected hidden ) School
                option(v-for="item in schoolItems" v-bind:value="item.value") {{item.text}}
          p.control
            button.button.is-primary(:disabled="!canCreate" @click="tryToCreate()") Create
    nav.panel
      p.panel-heading Teachers
      .center(v-if="!teachers.length")
        i No teachers exists yet
      table.table(v-else)
        thead
          tr
            th Name
            th(v-if="isAdmin") School
            th Classes
        tbody
          tr(v-for="teacher in teachers")
            td {{teacher.name}}
            td(v-if="isAdmin")
              p.control
                span.select
                  select(:value="teacher.school" @input="moveTeacher( teacher, $event )")
                    option(v-for="school in schools" :value="school.id") {{school.name}}
            td {{teacher.classes.length}}
</template>

<script>
  import { EventBus }  from '../model/event-bus.js';
  import Admin from '../model/users/admin.js';
  import School from '../model/school.js';
  import Teacher from '../model/teacher.js';

  import CreationSuccess from './CreationSuccess';
  import CreationError from './CreationError';

  export default {
    name: 'teachers',

    data() {
      return {
        school: null,

        newName: '',
        newEmail: '',
        newSchool: '',

        isCreating: false,
        creationError: '',
        showCreationError: 0,   // random value to trigger the notification
        showCreationSuccess: 0, // random value to trigger the notification

        schools: [],
        teachers: []
      };
    },

    components: {
      'creation-success': CreationSuccess,
      'creation-error': CreationError
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
        return !this.isCreating
          && this.isNewNameValid
          && this.isNewEmailValid
          && this.isSchoolValid;
      },

      isAdmin() {
        return Admin.isLogged;
      },

      schoolItems() {
        if (!this.schools) {
          return [];
        }
        return this.schools.map( school => {
          return {
            value: school.id,
            text: school.name
          };
        });
      }
    },

    methods: {

      loadSchools() {
        return School.list( (err, schools) => {
          if (err) {
            return `Cannot retrieve schools.\n\n${err}`;
          }

          this.schools = schools.sort( (a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
          });
        });
      },

      loadTeachers() {
        Teacher.list( (err, teachers) => {
          if (err) {
            return `Cannot retrieve teachers.\n\n${err}`;
          }

          this.teachers = teachers.filter( teacher => {
            return this.school ? teacher.school === this.school.id : true;
          }).sort( (a, b) => {
            return a.name.toLowerCase() < b.name.toLowerCase();
          });
        });
      },

      checkAccess() {
        if (!Admin.isLogged && !School.isLogged) {
          this.$router.replace( '/' );
        }
      },

      setCreationError( msg ) {
        this.creationError = msg;
        this.showCreationError = Math.random();
      },

      tryToCreate() {
        if (!this.canCreate) {
          return;
        }

        const exists = this.teachers.some( teacher => {
          return teacher.email.toLowerCase() === this.newEmail.toLowerCase().trim();
        });

        if (exists) {
          this.setCreationError( 'A teacher with this email exists already' );
        }
        else {
          this.createTeacher();
        }
      },

      createTeacher() {
        this.isCreating = true;

        const onFinished = (err, id) => {
          this.isCreating = false;

          if (err) {
            this.setCreationError( err );
          }
          else {
            this.newName = '';
            this.newEmail = '';
            this.loadTeachers();

            this.showCreationSuccess = Math.random();
          }
        };

        if (this.school) {
          // return console.log( 'school', this.school.name, 'creates teacher:',  this.newName.trim(), this.newEmail.trim() );
          this.school.createTeacher( this.newName.trim(), this.newEmail.trim(), onFinished );
        }
        else {  // admin
          School.get( this.newSchool, (err, school) => {
            if (err) {
              return onFinished( err );
            }

            //return console.log( 'admind creates teacher:',  this.newName.trim(), this.newEmail.trim(), 'for school', school.name );
            school.createTeacher( this.newName.trim(), this.newEmail.trim(), onFinished );
          });
        }
      },

      moveTeacher( teacher, e ) {
        Admin.moveTeacher( teacher, e.target.value, this.schools );
      }
    },

    created() {
      console.log('Teachers component created');
      EventBus.$on( 'logout', () => {
        this.checkAccess();
      });

      this.checkAccess();
    },

    mounted() {
      if (Admin.isLogged) {
        this.loadSchools().then( () => {
          this.loadTeachers();
        });
      }
      else {
        this.school = School.instance;
        this.loadTeachers();
      }
    }
  }
</script>

<style lang="less" scoped>
  .center {
    margin-top: 2em;
    width: 100%;
    text-align: center;
    vertical-align: middle;
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