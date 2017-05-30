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
      .container(v-if="!teachers.length")
        i No teachers exists yet
      table.table(v-else)
        thead
          tr
            th Name
            th(v-if="isAdmin") School
            th(v-if="!isAdmin") Classes
        tbody
          tr(v-for="teacher in teachers")
            td {{teacher.name}}
            td(v-if="isAdmin")
              span.select
                select(:value="teacher.school" @input="moveTeacher( teacher, $event )")
                  option(v-for="school in schools" :value="school.id") {{school.name}}
            td(v-if="!isAdmin")
              span.ellipsis {{getListOfTeacherClasses( teacher )}}
</template>

<script>
  import { EventBus }  from '@/model/event-bus.js';
  import Admin from '@/model/users/admin.js';
  import School from '@/model/school.js';
  import Teacher from '@/model/teacher.js';

  import CreationSuccess from '@/components/widgets/CreationSuccess';
  import CreationError from '@/components/widgets/CreationError';

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
        teachers: [],
        classes: [],
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

      loadSchoolClasses() {
        return this.school.getClasses( (err, classes) => {
          if (err) {
            return `Cannot retrieve classes.\n\n${err}`;
          }

          this.classes = classes;
        });
      },

      loadTeachers() {
        const onDone = (err, teachers) => {
          if (err) {
            return `Cannot retrieve teachers.\n\n${err}`;
          }

          this.teachers = teachers.sort( (a, b) => {
            return a.name.toLowerCase() < b.name.toLowerCase();
          });
        };

        if (!this.school) {
          return Teacher.list( onDone );
        }

        return this.school.getTeachers( onDone );
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
      },

      getListOfTeacherClasses( teacher ) {
        return teacher
          .getListOfClasses( this.classes )
          .map( cls => cls.name )
          .join( ', ' );
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
          return this.loadTeachers();
        });
      }
      else {
        this.school = School.instance;
        this.loadSchoolClasses().then( () => {
          return this.loadTeachers();
        });
      }
    }
  }
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