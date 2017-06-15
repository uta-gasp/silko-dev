<template lang="pug">
  #classes
    modal-notification(type="danger" :show="showError")
      span The {{ notification.obj }} was not {{ notification.action }}: {{ errorMessage }}
    modal-notification(type="success" :show="showSuccess")
      span The {{ notification.obj }} was {{ notification.action }}.

    nav.panel
      p.panel-heading Add class
      .panel-block
        .field.control
          p.control
            input.input(type="text" placeholder="Name" v-model="newName")
          p.control
            button.button.is-primary(:disabled="!canCreate" @click="tryToCreate") Create

    nav.panel
      p.panel-heading Classes
      .panel-block.is-paddingless
        .container(v-if="!classes.length")
          i No classes exists yet
        table.table(v-else)
          thead
            tr
              th Name
              th Texts
              th Students
              th.is-narrow
          tbody
            tr(v-for="item in classes" :key="item.id")
              td.title.is-4 {{ item.name }}
              td
                task-list(:cls="item" :intros="intros" @saved="taskSaved" @created="taskCreated" @deleted="taskDeleted")
              td
                student-list(:cls="item" :teacher="teacher" :refresh="refreshStudents" @added="studentAdded" @removed="studentRemoved")
              td.is-narrow
                .is-pulled-right
                  button.button.is-danger(@click="removeClass( item )")
                    i.fa.fa-remove

    remove-warning(v-if="toDelete" object="class" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
  import eventBus  from '@/utils/event-bus.js';

  import Teacher from '@/model/teacher.js';

  import ModalNotification from '@/components/widgets/ModalNotification';
  import TaskList from '@/components/widgets/TaskList';
  import StudentList from '@/components/widgets/StudentList';
  import RemoveWarning from '@/components/widgets/RemoveWarning';

  export default {
    name: 'classes',

    components: {
      'modal-notification': ModalNotification,
      'task-list': TaskList,
      'student-list': StudentList,
      'remove-warning': RemoveWarning
    },

    data() {
      return {
        teacher: null,

        newName: '',

        isCreating: false,
        errorMessage: '',
        showError: 0,   // random value to trigger the notification
        showSuccess: 0, // random value to trigger the notification
        refreshStudents: 0,

        notification: {
          action: '',
          obj: ''
        },

        classes: [],
        intros: [],

        toDelete: null,
      };
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

      setError( msg ) {
        this.errorMessage = msg;
        this.showError = Math.random();
      },

      tryToCreate( e ) {
        if (!this.canCreate) {
          return;
        }

        this.notification.action = 'created';
        this.notification.obj = 'class';

        const exists = this.classes.some( cls => {
          return cls.name.toLowerCase() === this.newName.toLowerCase();
        });

        if (exists) {
          this.setError( 'A class of this name exists already' );
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
            this.setError( err );
          }
          else {
            this.loadClasses();

            this.showSuccess = Math.random();
            this.newName = '';
          }
        });
      },

      removeClass( item, e ) {
        this.toDelete = item;
      },

      removeWarningClosed( e ) {
        if (e.confirm) {
          this.teacher.deleteClass( this.toDelete, err => {
            this.loadClasses();
          });
        }

        this.toDelete = null;
      },

      taskSaved( e ) {
        this.notification.action = 'updated';
        this.notification.obj = 'task';
        if (e.err) {
          this.setError( e.err );
        }
        else {
          this.showSuccess = Math.random();
        }
      },

      taskCreated( e ) {
        this.notification.action = 'created';
        this.notification.obj = 'task';
        if (e.err) {
          this.setError( e.err );
        }
        else {
          this.showSuccess = Math.random();
          this.refreshStudents = Math.random();
        }
      },

      taskDeleted( e ) {
        this.refreshStudents = Math.random();
      },

      studentAdded( e ) {

      },

      studentRemoved( e ) {

      }
    },

    created() {
      console.log('Classes component created');
      eventBus.$on( 'logout', () => {
        this.checkAccess();
      });
      eventBus.$on( 'login', () => {
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
</style>