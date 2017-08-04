<template lang="pug">
  #schools
    modal-notification(type="danger" :show="showCreationError")
      span Failed to add a school: {{ creationError }}
    modal-notification(type="success" :show="showCreationSuccess")
      span The school was added.

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
              td {{ item.name }}
              td {{ item.teachers | count }}
              td {{ item.students | count }}
</template>

<script>
  import eventBus from '@/utils/event-bus.js';
  import dataUtils from '@/utils/data-utils.js';

  import Admin from '@/model/admin.js';
  import School from '@/model/school.js';

  import ModalNotification from '@/components/widgets/ModalNotification';

  export default {
    name: 'schools',

    components: {
      'modal-notification': ModalNotification,
    },

    data() {
      return {
        newName: '',
        newEmail: '',

        isCreating: false,
        creationError: '',
        showCreationError: 0,   // random value to trigger the notification
        showCreationSuccess: 0, // random value to trigger the notification

        schools: []
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
      }
    },

    methods: {

      loadSchools() {
        School.list( (err, schools) => {
          if (err) {
            return `Cannot retrieve schools.\n\n${err}`;
          }

          this.schools = schools.sort( dataUtils.byName );
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

      tryToCreate( e ) {
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

    filters: {
      count( obj ) {
        let result = 0;
        for (let _ in obj) {
          result++;
        }
        return result;
      }
    },

    created() {
      // BUG - every logging in creates additional Schools.vue instance, even after logging out
      console.log('Schools component created');
      eventBus.$on( 'logout', () => {
        this.checkAccess();
      });
      eventBus.$on( 'login', () => {
        this.loadSchools();
      });

      this.checkAccess();
    },

    mounted() {
      this.loadSchools();
    }
  };
</script>

<style lang="less" scoped>
</style>
