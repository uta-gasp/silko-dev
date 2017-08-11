<template lang="pug">
  #task-list.panel
    p.panel-heading
      nav.level
        .level-left
          .level-item {{ displayCount( tasks, 'task' ) }}
        .level-right
          .level-item
            button.button.is-primary(@click="openNewTextBox") Add
    .panel-block.is-paddingless
      table.table
        tbody
          tr(v-for="task in tasks" :key="parent.id+task.id")
            td
              span.is-inline-block {{ task.name }}
              span.is-inline-block(v-if="!!task.pages") &nbsp;({{ task.pages.length }} pages)
            td.is-narrow
              button.button.is-light(@click="edit( task )")
                i.fa.fa-edit
              button.button.is-danger(@click="remove( task )")
                i.fa.fa-remove

    modal-container(v-if="isEditing" :title="taskEditorTitle" @close="closeEditor")
      task-editor(:action="action" :task="toEdit" :intros="intros" @save="save")

    remove-warning(v-if="toDelete" object="task" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
import dataUtils from '@/utils/data-utils.js';

import stringification from '@/components/mixins/stringification.js';

import ModalContainer from '@/components/widgets/ModalContainer';
import TaskEditor from '@/components/widgets/TaskEditor';
import RemoveWarning from '@/components/widgets/RemoveWarning';

export default {
  name: 'task-list',

  mixins: [ stringification ],

  components: {
    'modal-container': ModalContainer,
    'task-editor': TaskEditor,
    'remove-warning': RemoveWarning,
  },

  data() {
    return {
      parent: this.cls,
      tasks: [],

      toEdit: null,
      isCreating: false,
      toDelete: null,
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

    isEditing() {
      return this.toEdit || this.isCreating;
    },

    toDeleteName() {
      return this.toDelete ? this.toDelete.name : '';
    },

    action() {
      if ( this.isCreating ) {
        return 'Create';
      }
      else if ( this.toEdit ) {
        return 'Save';
      }

      return '';
    },

    actionType() {
      return this.toEdit ? 'edit' : 'create new';
    },

    taskEditorTitle() {
      return 'Task editor' + ( this.toEdit ? ` - ${this.toEdit.name}` : '' );
    },
  },

  methods: {

    loadTasks() {
      this.parent.getTasks( ( err, tasks ) => {
        if ( err ) {
          return `Cannot retrieve tasks.\n\n${err}`;
        }

        this.tasks = tasks.sort( dataUtils.byName );
      } );
    },

    canCreate( newTask ) {
      return this.tasks.every( task => task.name.toLowerCase() !== newTask.name.toLowerCase() );
    },

    edit( task, e ) {
      this.toEdit = task;
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
        this.parent.createTask( task, 'text', ( err, newTask ) => {
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
      this.isCreating = false;
    },

    remove( task, e ) {
      this.toDelete = task;
    },

    removeWarningClosed( e ) {
      if ( e.confirm ) {
        const id = this.toDelete.id;

        /* eslint-disable handle-callback-err */
        this.parent.deleteTask( this.toDelete, err => {
          this.$emit( 'deleted', { task: id } );
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
