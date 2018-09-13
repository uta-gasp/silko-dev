<template lang="pug">
  #task-list.panel
    p.panel-heading
      nav.level
        .level-left
          .level-item {{ tokens[ 'num_task' ]( tasks ) }}
        .level-right
          .level-item
            button.button.is-primary(@click="openNewTextBox") {{ tokens[ 'btn_new' ] }}
    .panel-block.is-paddingless
      .container(v-if="tasks === null")
        loading
      table.table(v-else)
        tbody
          tr(v-for="task in tasks" :key="parent.id+task.id")
            td
              span.is-inline-block {{ task.name }}
              span.is-inline-block(v-if="!!task.pages") &nbsp;({{ tokens[ 'lbl_pages' ]( task.pages.length ) }})
            td.is-narrow
              button.button.is-light(
                :title="tokens[ 'tit_edit' ]( isLocked( task.id ) )"
                :disabled="isLocked( task.id )"
                @click="edit( task )")
                i.far.fa-edit
              button.button.is-light(
                :title="tokens[ 'tit_copy' ]"
                @click="copy( task )")
                i.far.fa-copy
              button.button.is-danger(
                :title="tokens[ 'tit_delete' ]"
                @click="remove( task )")
                i.far.fa-trash-alt

    modal-container(v-if="isEditing" :title="taskEditorTitle" @close="closeEditor")
      task-editor(:action="action" :task="toEdit" :source="toCopy" :intros="intros" @save="save" @modified="onTaskModified")

    remove-warning(v-if="toDelete" object="task" :name="toDeleteName" @close="removeWarningClosed")
      span {{ tokens[ 'msg_delete_warning' ] }}.&nbsp;

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
</template>

<script>
import DBUtils from '@/db/utils.js';

import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';
import { i10n } from '@/utils/i10n.js';

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
      /** @type {string[]} IDs */
      locked: null,

      /** @type {Task} */
      toEdit: null,
      /** @type {Task} */
      toCopy: null,
      /** @type {Task} */
      toDelete: null,
      isCreating: false,

      isTaskModified: false,

      tokens: i10n( 'task_list', '_labels', '_buttons', '_utils', '_failures' ),
    };
  },

  props: {
    cls: {
      type: Object,
      default: null,
    },
    intros: {
      type: Array,
      default: () => /** @type {Array}*/ ([]),
    },
  },

  computed: {

    /** @returns {boolean} */
    isEditing() {
      return !!this.toEdit || this.isCreating;
    },

    /** @returns {string} */
    toDeleteName() {
      return this.toDelete ? this.toDelete.name : '';
    },

    /** @returns {string} */
    action() {
      if ( this.isCreating ) {
        return this.tokens[ 'create' ];
      }
      else if ( this.toEdit ) {
        return this.tokens[ 'save' ];
      }

      return '';
    },

    taskEditorTitle() {
      return this.tokens[ 'hdr_editor' ]( this.toEdit ? ` - ${this.toEdit.name}` : '' );
    },
  },

  methods: {

    loadTasks() {
      this.parent.getTasks( /** @param {Error | string} err; @param {Task[]} tasks */ ( err, tasks ) => {
        if ( err ) {
          this.tasks = [];
          return this.setError( err, this.tokens[ 'load' ]( this.tokens[ 'tasks' ] ) );
        }

        this.tasks = tasks.sort( dataUtils.byName );

        DBUtils.areTasksLocked( this.tasks.map( task => task.id ), /** @param {Error | string} err; @param {string[]} response */ ( err, response ) => {
          if ( err ) {
            return console.error( 'DBUtils.isTaskLocked:', err );
          }

          this.locked = response;
        } );
      } );
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
     * @param {Event} e
     */
    edit( task, e ) {
      this.toEdit = task;
      this.isTaskModified = false;
    },

    /** 
     * @param {Task} task
     * @param {Event} e
     */
    copy( task, e ) {
      this.toCopy = task;
      this.isCreating = true;
      this.isTaskModified = false;
    },

    /** @param {Task} e */
    save( e ) {
      const task = e;
      if ( this.toEdit ) {
        this.toEdit.update( task, /** @param {Error | string} err */ err => {
          this.$emit( 'saved', { err } );
          this.loadTasks();
        } );
      }
      else if ( !this.canCreate( task ) ) {
        this.$emit( 'created', { err: this.tokens[ 'err_same_name' ] } );
      }
      else {
        this.parent.createTask( task, 'text', /** @param {Error | string} err */ err => {
          this.$emit( 'created', { err } );

          if ( err ) {
            return;
          }

          this.loadTasks();
        } );
      }

      this.isTaskModified = false;
      this.closeEditor( null );
    },

    /** @param {Event} e */
    onTaskModified( e ) {
      this.isTaskModified = true;
    },

    /** @param {{cancelled: boolean}} e */
    closeEditor( e ) {
      let canClose = true;
      if (e && this.isTaskModified) {
        canClose = window.confirm( this.tokens[ 'msg_cancel_warning' ] );
      }

      if (canClose) {
        this.toEdit = null;
        this.toCopy = null;
        this.isCreating = false;
      } 
      else if (e) {
        e.cancelled = true;
      }
    },

    /** 
     * @param {Task} task
     * @param {Event} e
     */
    remove( task, e ) {
      this.toDelete = task;
    },

    /** 
     * @param {string} id
     * @param {Event} e
     * @returns {boolean}
     */
    isLocked( id, e ) {
      return this.locked === null || this.locked.indexOf( id ) >= 0;
    },

    /** @param {{confirm: boolean}} e */
    removeWarningClosed( e ) {
      if ( e.confirm ) {
        const id = this.toDelete.id;

        this.parent.deleteTask( this.toDelete, /** @param {Error | string} err */ err => {
          if ( err ) {
            return this.setError( err, this.tokens[ 'delete' ]( this.tokens[ 'task' ] ) );
          }
          else {
            DBUtils.deleteTaskSessions( id, /** @param {Error | string} err */ err => {
              if ( err ) {
                return console.error( 'DBUtils.deleteTaskSessions:', err );
              }
            } );
            DBUtils.deleteStudentTaskSessions( id, /** @param {Error | string} err */ err => {
              if ( err ) {
                return console.error( 'DBUtils.deleteStudentTaskSessions:', err );
              }
            } );

            this.setSuccess( this.tokens[ 'deleted' ]( this.tokens[ 'task' ] ) );
            this.$emit( 'deleted', { task: id } );
          }

          this.loadTasks();
        } );
      }

      this.toDelete = null;
    },

    /** @param {Event} e */
    openNewTextBox( e ) {
      this.isCreating = true;
      this.isTaskModified = false;
    },
  },

  created() {
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'task_list', '_labels', '_buttons', '_utils', '_failures' );
    } );
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
