<template lang="pug">
  #classes
    nav.panel
      creation-error(:object="createdObject" :show="showCreationError" :error="creationError")
        span {{action}}
      creation-success(:object="createdObject" :show="showCreationSuccess")
      p.panel-heading Add class
      .panel-block
        .field
          p.control
            input.input(type="text" placeholder="Name" v-model="newName")
          p.control
            button.button.is-primary(:disabled="!canCreate" @click="tryToCreate()") Create

    nav.panel
      p.panel-heading Classes
      .center(v-if="!classes.length")
        i No classes exists yet
      table.table(v-else)
        thead
          tr
            th Name
            th Texts
            th Students
            th Actions
        tbody
          tr(v-for="item in classes")
            td {{item.name}}
            td
              task-list(:cls="item" :intros="intros" @saved="onTextSaved" @created="onTextCreated")
            td
              student-list(:cls="item" :teacher="teacher" @added="onStudentAdded" @removed="onStudentRemoved")
            td.is-pulled-right
              button.button.is-danger(@click="removeClass( item )")
                i.fa.fa-remove

    remove-warning(v-if="toDelete" object="class" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
  import { EventBus }  from '../model/event-bus.js';
  import Teacher from '../model/teacher.js';

  import CreationSuccess from './CreationSuccess';
  import CreationError from './CreationError';
  import TaskList from './TaskList';
  import StudentList from './StudentList';
  import RemoveWarning from './RemoveWarning';

  export default {
    name: 'introductions',

    data() {
      return {
        teacher: null,

        newName: '',

        isCreating: false,
        creationError: '',
        showCreationError: 0,   // random value to trigger the notification
        showCreationSuccess: 0, // random value to trigger the notification

        createdObject: 'class',
        action: 'create new',

        classes: [],
        intros: [],

        toDelete: null,
      };
    },

    components: {
      'creation-success': CreationSuccess,
      'creation-error': CreationError,
      'task-list': TaskList,
      'student-list': StudentList,
      'remove-warning': RemoveWarning
    },

    computed: {

      canCreate() {
        return this.newName.length > 2;
      },

      toDeleteName() {
        return this.toDelete ? this.toDelete.name : '' ;
      }
    },

    methods: {

      init() {
        this.teacher = Teacher.instance;
        if (this.teacher) {
          this.loadClasses();
          this.loadIntros();
        }
      },

      loadClasses() {
        this.teacher.getClasses( (err, classes) => {
          if (err) {
            return `Cannot retrieve classes.\n\n${err}`;
          }

          this.classes = classes.sort( (a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
          });
        });
      },

      loadIntros() {
        this.teacher.getIntros( (err, intros) => {
          if (err) {
            return `Cannot retrieve intros.\n\n${err}`;
          }

          this.intros = intros.sort( (a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
          });
        });
      },

      checkAccess() {
        if (!Teacher.isLogged) {
          this.$router.replace( '/' );
        }
      },

      setCreationError( msg ) {
        this.creationError = msg;
        this.showCreationError = Math.random();
      },

      // Class

      tryToCreate() {
        this.action = 'create new';
        this.createdObject = 'class';

        const exists = this.classes.some( cls => {
          return cls.name.toLowerCase() === this.newName.toLowerCase();
        });

        if (exists) {
          this.setCreationError( 'A class of this name exists already' );
        }
        else {
          this.createClass( this.newName );
        }
      },

      createClass( name ) {
        this.isCreating = true;

        this.teacher.createClass( name, (err, id) => {
          this.isCreating = false;

          if (err) {
            this.setCreationError( err );
          }
          else {
            this.loadClasses();

            this.showCreationSuccess = Math.random();
            this.newName = '';
          }
        });
      },

      removeClass( item ) {
        this.toDelete = item;
      },

      removeWarningClosed( confirm ) {
        if (confirm) {
          this.teacher.deleteClass( this.toDelete, err => {
            this.loadClasses();
          });
        }

        this.toDelete = null;
      },

      onTextSaved( e ) {
        this.action = 'save';
        this.createdObject = 'text';
        if (e.err) {
          this.setCreationError( e.err );
        }
        else {
          this.showCreationSuccess = Math.random();
        }
      },

      onTextCreated( e ) {
        this.action = 'create new';
        this.createdObject = 'text';
        if (e.err) {
          this.setCreationError( e.err );
        }
        else {
          this.showCreationSuccess = Math.random();
        }
      },

      onStudentAdded( e ) {

      },

      onStudentRemoved( e ) {

      }
    },

    created() {
      console.log('Classes component created');
      EventBus.$on( 'logout', () => {
        this.checkAccess();
      });
      EventBus.$on( 'login', () => {
        this.init();
      });

      this.checkAccess();
    },

    mounted() {
      this.init();
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

</style>