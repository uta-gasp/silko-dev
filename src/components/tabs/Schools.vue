<template lang="pug">
  #schools
    nav.panel
      creation-error(object="school" :show="showCreationError" :error="creationError")
      creation-success(object="school" :show="showCreationSuccess")
      p.panel-heading Add school
      .panel-block
        .field.control
          p.control
            input.input(type="text" placeholder="Name" v-model="newName")
          p.control
            input.input(type="email" placeholder="Email" v-model="newEmail")
          p.control
            button.button.is-primary(:disabled="!canCreate" @click="tryToCreate()") Create

    nav.panel
      p.panel-heading Schools
      .panel-block.is-paddingless
        .container(v-if="!schools.length")
          i No school exists yet
        table.table(v-else)
          thead
            tr
              th Name
              th Teachers
              th Students
          tbody
            tr(v-for="item in schools")
              td {{item.name}}
              td {{item.teachers.length}}
              td {{item.students.length}}
</template>

<script>
  import { EventBus }  from '@/model/event-bus.js';
  import Admin from '@/model/users/admin.js';
  import School from '@/model/school.js';

  import CreationSuccess from '@/components/widgets/CreationSuccess';
  import CreationError from '@/components/widgets/CreationError';

  export default {
    name: 'schools',

    data() {
      return {
        newName: '',
        newEmail: '',

        isCreating: false,
        creationError: '',
        showCreationError: 0,   // random value to trigger the notification
        showCreationSuccess: 0, // random value to trigger the notification

        schools: []
      }
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

      canCreate() {
        return !this.isCreating
          && this.isNewNameValid
          && this.isNewEmailValid;
      }
    },

    methods: {

      loadSchools() {
        School.list( (err, schools) => {
          if (err) {
            return `Cannot retrieve schools.\n\n${err}`;
          }

          this.schools = schools.sort( (a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
          });
        });
      },

      checkAccess() {
        if (!Admin.isLogged) {
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

        const exists = this.schools.some( school => {
          return false ||
            school.name.toLowerCase() === this.newName.toLowerCase().trim() ||
            school.email.toLowerCase() === this.newEmail.toLowerCase().trim();
        });

        if (exists) {
          this.setCreationError( 'A school with this name or email exists already' );
        }
        else {
          this.createSchool();
        }
      },

      createSchool() {
        this.isCreating = true;
        Admin.createSchool( this.newName.trim(), this.newEmail.trim(), (err, id) => {
          this.isCreating = false;

          if (err) {
            this.setCreationError( err );
          }
          else {
            this.newName = '';
            this.newEmail = '';
            this.loadSchools();

            this.showCreationSuccess = Math.random();
          }
        });
      }
    },

    created() {
      // BUG - every logging in creates additional Schools.vue instance, even after logging out
      console.log('Schools component created');
      EventBus.$on( 'logout', () => {
        this.checkAccess();
      });
      EventBus.$on( 'login', () => {
        this.loadSchools();
      });

      this.checkAccess();
    },

    mounted() {
      this.loadSchools();
    }
  }
</script>

<style lang="less" scoped>
</style>