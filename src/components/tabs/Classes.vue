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
          tbody
            tr(v-for="item in classes" :key="item.id")
              td 
                .title.is-4.no-wrapping {{ item.name }}
                button.button.is-danger(title="Delete the class" @click="removeClass( item )")
                  i.far.fa-trash-alt
              td
                task-list(:cls="item" :intros="intros" @saved="taskSaved" @created="taskCreated" @deleted="taskDeleted")
              td
                student-list(:cls="item" :teacher="teacher" :refresh="refreshStudents")

    remove-warning(v-if="toDelete" object="class" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';

import Teacher from '@/model/teacher.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';
import TaskList from '@/components/widgets/TaskList.vue';
import StudentList from '@/components/widgets/StudentList.vue';
import RemoveWarning from '@/components/widgets/RemoveWarning.vue';

// ts-check-only
import Class from '@/model/class.js';
import Intro from '@/model/intro.js';

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
      /** @type {Teacher} */
      teacher: null,

      newName: '',

      isCreating: false,
      refreshStudents: 0,

      /** @type {Class[]} */
      classes: null,
      /** @type {Intro[]} */
      intros: [],

      /** @type {Class} */
      toDelete: null,
    };
  },

  computed: {
    /** @returns {boolean} */
    canCreate() {
      return this.newName.length > 2;
    },

    /** @returns {string} */
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
      this.teacher.getClasses( /** @param {Error} err, @param {Class[]} classes */ ( err, classes ) => {
        if ( err ) {
          this.classes = [];
          return this.setError( err, 'Failed to load classes' );
        }

        this.classes = classes.sort( dataUtils.byName );
      } );
    },

    loadIntros() {
      this.teacher.getIntros( /** @param {Error} err, @param {Intro[]} intros */ ( err, intros ) => {
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

    /** @param {Event} e */
    tryToCreate( e ) {
      if ( !this.canCreate ) {
        return;
      }

      const exists = this.classes.some( /** @param {Class} cls */ cls => {
        return cls.name.toLowerCase() === this.newName.toLowerCase();
      } );

      if ( exists ) {
        this.setError( 'A class of this name exists already', 'Failed to create new class' );
      }
      else {
        this.createClass( this.newName );
      }
    },

    /** 
     * @param {string} name 
     */
    createClass( name ) {
      this.isCreating = true;

      this.teacher.createClass( name, /** @param {Error} err, @param {any} _ */ ( err, _ ) => {
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

    /**
     * @param {Class} item
     * @param {Event} e
     */
    removeClass( item, e ) {
      this.toDelete = item;
    },

    /** @param {{confirm: boolean}} e */
    removeWarningClosed( e ) {
      if ( e.confirm ) {
        this.teacher.deleteClass( this.toDelete, /** @param {Error} err */ err => {
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

    /** @param {{err: string}} e */
    taskSaved( e ) {
      if ( e.err ) {
        this.setError( e.err, 'Failed to save updates' );
      }
      else {
        this.setSuccess( 'The task was updated' );
      }
    },

    /** @param {{err: string}} e */
    taskCreated( e ) {
      if ( e.err ) {
        this.setError( e.err, 'Failed to create new task' );
      }
      else {
        this.setSuccess( 'New task was created' );
        this.refreshStudents = Math.random();
      }
    },

    /** @param {Event} e */
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
  .no-wrapping {
    word-break: keep-all;
  }
</style>
