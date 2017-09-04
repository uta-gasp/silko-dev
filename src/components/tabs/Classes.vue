<template lang="pug">
  #classes.section
    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

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
        .container(v-if="classes === null")
          loading
        table.table(v-else)
          thead
            tr
              th Name
              th Tasks
              th Students
              th.is-narrow Actions
          tbody
            tr(v-for="item in classes" :key="item.id")
              td.title.is-4 {{ item.name }}
              td
                task-list(:cls="item" :intros="intros" @saved="taskSaved" @created="taskCreated" @deleted="taskDeleted")
              td
                student-list(:cls="item" :teacher="teacher" :refresh="refreshStudents")
              td.is-narrow
                .is-pulled-right
                  button.button.is-danger(title="Delete the class" @click="removeClass( item )")
                    i.fa.fa-remove

    remove-warning(v-if="toDelete" object="class" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';

import Teacher from '@/model/teacher.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading';
import TemporalNotification from '@/components/widgets/TemporalNotification';
import TaskList from '@/components/widgets/TaskList';
import StudentList from '@/components/widgets/StudentList';
import RemoveWarning from '@/components/widgets/RemoveWarning';

export default {
  name: 'classes',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
    'task-list': TaskList,
    'student-list': StudentList,
    'remove-warning': RemoveWarning,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      teacher: null,

      newName: '',

      isCreating: false,
      refreshStudents: 0,

      classes: null,
      intros: [],

      toDelete: null,
    };
  },

  computed: {

    canCreate() {
      return this.newName.length > 2;
    },

    toDeleteName() {
      return this.toDelete ? this.toDelete.name : '';
    },
  },

  methods: {

    init() {
      this.teacher = Teacher.instance;
      if ( this.teacher ) {
        this.loadClasses();
        this.loadIntros();
      }
    },

    loadClasses() {
      this.teacher.getClasses( ( err, classes ) => {
        if ( err ) {
          this.classed = [];
          return this.setError( err, 'Failed to load classes' );
        }

        this.classes = classes.sort( dataUtils.byName );
      } );
    },

    loadIntros() {
      this.teacher.getIntros( ( err, intros ) => {
        if ( err ) {
          return this.setError( err, 'Failed to load introductions' );
        }

        this.intros = intros.sort( dataUtils.byName );
      } );
    },

    checkAccess() {
      if ( !Teacher.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    tryToCreate( e ) {
      if ( !this.canCreate ) {
        return;
      }

      const exists = this.classes.some( cls => {
        return cls.name.toLowerCase() === this.newName.toLowerCase();
      } );

      if ( exists ) {
        this.setError( 'A class of this name exists already', 'Failed to create new class' );
      }
      else {
        this.createClass( this.newName );
      }
    },

    createClass( name ) {
      this.isCreating = true;

      this.teacher.createClass( name, ( err, id ) => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, 'Failed to create new class' );
        }
        else {
          this.loadClasses();

          this.setSuccess( 'New class has been created' );

          this.newName = '';
        }
      } );
    },

    removeClass( item, e ) {
      this.toDelete = item;
    },

    removeWarningClosed( e ) {
      if ( e.confirm ) {
        this.teacher.deleteClass( this.toDelete, err => {
          if ( err ) {
            this.setError( err, 'Failed to delete the class' );
          }
          else {
            this.setSuccess( 'The class was deleted' );
          }

          this.loadClasses();
        } );
      }

      this.toDelete = null;
    },

    taskSaved( e ) {
      if ( e.err ) {
        this.setError( e.err, 'Failed to save updates' );
      }
      else {
        this.setSuccess( 'The task was updated' );
      }
    },

    taskCreated( e ) {
      if ( e.err ) {
        this.setError( e.err, 'Failed to create new task' );
      }
      else {
        this.setSuccess( 'New task was created' );
        this.refreshStudents = Math.random();
      }
    },

    taskDeleted( e ) {
      this.refreshStudents = Math.random();
    },
  },

  created() {
    console.log( 'Classes component created' );
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
</style>
