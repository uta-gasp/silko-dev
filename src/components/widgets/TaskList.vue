<template lang="pug">
  #task-list.panel
    p.panel-heading
      nav.level
        .level-left
          .level-item {{ displayCount( tasks, 'task' ) }}
        .level-right
          .level-item
            button.button.is-primary(@click="openNewTextBox") Create new
    .panel-block.is-paddingless
      .container(v-if="tasks === null")
        loading
      table.table(v-else)
        tbody
          tr(v-for="task in tasks" :key="parent.id+task.id")
            td
              span.is-inline-block {{ task.name }}
              span.is-inline-block(v-if="!!task.pages") &nbsp;({{ task.pages.length }} pages)
            td.is-narrow
              button.button.is-light(
                :title="isLocked( task.id ) ? 'This task has recorded sessions' : 'Edit the task'"
                :disabled="isLocked( task.id )"
                @click="edit( task )")
                i.fa.fa-edit
              button.button.is-light(
                title="Create a new task from the existing"
                @click="copy( task )")
                i.fa.fa-copy
              button.button.is-danger(
                title="Delete the task"
                @click="remove( task )")
                i.fa.fa-remove

    modal-container(v-if="isEditing" :title="taskEditorTitle" @close="closeEditor")
      task-editor(:action="action" :task="toEdit" :source="toCopy" :intros="intros" @save="save")

    remove-warning(v-if="toDelete" object="task" :name="toDeleteName" @close="removeWarningClosed")
      span All students assignments completed on this task will be deleted as well.&nbsp;

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
</template>

<script>
import dataUtils from '@/utils/data-utils.js';
import DBUtils from '@/db/utils.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';
import ModalContainer from '@/components/widgets/ModalContainer.vue';
import TaskEditor from '@/components/widgets/TaskEditor.vue';
import RemoveWarning from '@/components/widgets/RemoveWarning.vue';

// ts-check-only
import Task from '@/model/task.js';

/**
 * @fires saved
 * @fires created
 * @fires deleted
 */
export default {
  name: 'task-list',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
    'modal-container': ModalContainer,
    'task-editor': TaskEditor,
    'remove-warning': RemoveWarning,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      parent: this.cls,
      /** @type {Task[]} */
      tasks: null,
      /** @type {Task[]} */
      locked: null,

      /** @type {Task} */
      toEdit: null,
      /** @type {Task} */
      toCopy: null,
      /** @type {Task} */
      toDelete: null,
      isCreating: false,
    };
  },

  props: {
    cls: {
      type: Object,
      default: null,
    },
    intros: {
      type: Array,
      default: () => [],
    },
  },

  computed: {

    /** @returns {boolean} */
    isEditing() {
      return this.toEdit || this.isCreating;
    },

    /** @returns {string} */
    toDeleteName() {
      return this.toDelete ? this.toDelete.name : '';
    },

    /** @returns {string} */
    action() {
      if ( this.isCreating ) {
        return 'Create';
      }
      else if ( this.toEdit ) {
        return 'Save';
      }

      return '';
    },

    /** @returns {string} */
    actionType() {
      return this.toEdit ? 'edit' : 'create new';
    },

    /** @returns {string} */
    taskEditorTitle() {
      return 'Task editor' + ( this.toEdit ? ` - ${this.toEdit.name}` : '' );
    },
  },

  methods: {

    loadTasks() {
      this.parent.getTasks( ( err, tasks ) => {
        if ( err ) {
          this.tasks = [];
          return this.setError( err, 'Failed to load tasks' );
        }

        this.tasks = tasks.sort( dataUtils.byName );

        DBUtils.areTasksLocked( this.tasks.map( task => task.id ), ( err, response ) => {
          if ( err ) {
            return console.error( 'DBUtils.isTaskLocked:', err );
          }

          this.locked = response;
        } );
      } );
    },

    /**
     * @param {any[]} arr
     * @param {string} name
     * @returns {string}
     */
    displayCount( arr, name ) {
      return dataUtils.displayCount( arr, name );
    },

    /** 
     * @param {{name: string}} newTask
     * @returns {boolean}
     */
    canCreate( newTask ) {
      return this.tasks.every( task => task.name.toLowerCase() !== newTask.name.toLowerCase() );
    },

    /** 
     * @param {Task} task
     */
    edit( task, e ) {
      this.toEdit = task;
    },

    /** 
     * @param {Task} task
     */
    copy( task, e ) {
      this.toCopy = task;
      this.isCreating = true;
    },

    save( e ) {
      const task = e;
      if ( this.toEdit ) {
        this.toEdit.update( task, err => {
          this.$emit( 'saved', { err } );
          this.loadTasks();
        } );
      }
      else if ( !this.canCreate( task ) ) {
        this.$emit( 'created', { err: 'A task with the same name exists already' } );
      }
      else {
        this.parent.createTask( task, 'text', ( err, _ /* newTask */ ) => {
          this.$emit( 'created', { err } );

          if ( err ) {
            return;
          }

          this.loadTasks();
        } );
      }

      this.closeEditor();
    },

    closeEditor( e ) {
      this.toEdit = null;
      this.toCopy = null;
      this.isCreating = false;
    },

    /** 
     * @param {Task} task
     */
    remove( task, e ) {
      this.toDelete = task;
    },

    /** 
     * @param {string} id
     * @returns {boolean}
     */
    isLocked( id, e ) {
      return this.locked === null || this.locked.indexOf( id ) >= 0;
    },

    removeWarningClosed( e ) {
      if ( e.confirm ) {
        const id = this.toDelete.id;

        this.parent.deleteTask( this.toDelete, err => {
          if ( err ) {
            return this.setError( err, 'Failed to delete the task' );
          }
          else {
            DBUtils.deleteTaskSessions( id, ( err, _ /* response */ ) => {
              if ( err ) {
                return console.error( 'DBUtils.deleteTaskSessions:', err );
              }
            } );
            DBUtils.deleteStudentTaskSessions( id, ( err, _ /* response */ ) => {
              if ( err ) {
                return console.error( 'DBUtils.deleteStudentTaskSessions:', err );
              }
            } );

            this.setSuccess( 'The task was deleted' );
            this.$emit( 'deleted', { task: id } );
          }

          this.loadTasks();
        } );
      }

      this.toDelete = null;
    },

    openNewTextBox( e ) {
      this.isCreating = true;
    },
  },

  mounted() {
    this.loadTasks();
  },
};
</script>

<style lang="less" scoped>
  .table {
    margin-bottom: 0;
  }
</style>
