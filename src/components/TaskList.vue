<template lang="pug">
  #task-list.panel
    p.panel-heading
      nav.level
        .level-left
          .level-item {{tasks.length}} texts
        .level-right
          .level-item
            button.button.is-primary(@click="openNewTextBox()") Add
    .panel-block(v-for="task in tasks")
      nav.level
        .level-left
          .level-item {{task.name}}
            span(v-if="!!task.pages") &nbsp;({{task.pages.length}} pages)
        .level-right
          .level-item
            button.button.is-light(@click="edit( task )")
              i.fa.fa-edit
          .level-item
            button.button.is-danger(@click="remove( task )")
              i.fa.fa-remove

    modal-editor-container(v-if="isEditing" title="Text editor" @close="closeEditor()")
      text-editor(
        :is-intro="false"
        :action="action"
        :show-labels="true"
        :name-editable="!toEdit"
        :src-name="toEditName"
        :src-text="toEditText"
        :intros="intros"
        :src-intro="toEditIntro"
        :is-multipages="true"
        :src-lang="toEditLang"
        :src-syllabs="toEditSyllabs"
        :src-speech="toEditSpeech"
        @save="save")

    remove-warning(v-if="toDelete" object="task" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
  import Task from '../model/task.js';

  import ModalEditorContainer from './ModalEditorContainer';
  import TextEditor from './TextEditor';
  import RemoveWarning from './RemoveWarning';

  export default {
    name: 'introductions',

    data() {
      return {
        parent: this.cls,
        tasks: [],

        toEdit: null,
        isCreating: false,
        toDelete: null,
      };
    },

    components: {
      'modal-editor-container': ModalEditorContainer,
      'text-editor': TextEditor,
      'remove-warning': RemoveWarning
    },

    props: {
      cls: {
        type: Object,
        default: null
      },
      intros: {
        type: Array,
        default: () => []
      }
    },

    computed: {
      isEditing() {
        return this.toEdit || this.isCreating;
      },

      toEditName() {
        return this.toEdit ? this.toEdit.name : '';
      },

      toEditText() {
        return this.toEdit ? Task.pagesToText( this.toEdit.pages ) : '';
      },

      toEditIntro() {
        return this.toEdit ? this.toEdit.intro : '';
      },

      toEditLang() {
        return this.toEdit ? this.toEdit.lang : '';
      },

      toEditSyllabs() {
        return this.toEdit ? Task.syllabsToText( this.toEdit.syllabExceptions ) : '';
      },

      toEditSpeech() {
        return this.toEdit ? this.toEdit.speech : false;
      },

      toDeleteName() {
        return this.toDelete ? this.toDelete.name : '';
      },

      action() {
        if (this.isCreating) {
          return 'Create';
        }
        else if (this.toEdit) {
          return 'Save';
        }

        return '';
      },

      actionType() {
        return this.toEdit ? 'edit' : 'create new';
      }
    },

    methods: {

      loadTasks() {
        this.parent.getTasks( (err, tasks) => {
          if (err) {
            return `Cannot retrieve tasks.\n\n${err}`;
          }

          this.tasks = tasks.sort( (a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
          });
        });
      },

      canCreate( newTask ) {
        return this.tasks.every( task => task.name.toLowerCase() !== newTask.name.toLowerCase() );
      },

      edit( task ) {
        this.toEdit = task;
      },

      save( task ) {
        if (this.toEdit) {
          this.toEdit.update( task, err => {
            this.$emit( 'saved', { err } );
            this.loadTasks();
          });
        }
        else if (!this.canCreate( task )) {
          this.$emit( 'created', { err: 'A text with the same name exists already' } );
        }
        else {
          this.parent.createTask( task, 'text', (err, newTask) => {
              this.$emit( 'created', { err } );

              if (err) {
                return;
              }

              this.loadTasks();
          });
        }

        this.closeEditor();
      },

      closeEditor() {
        this.toEdit = null;
        this.isCreating = false;
      },

      remove( task ) {
        this.toDelete = task;
      },

      removeWarningClosed( confirm ) {
        if (confirm) {
          this.parent.deleteTask( this.toDelete, err => {
            this.loadTasks();
          });
        }

        this.toDelete = null;
      },

      openNewTextBox() {
        this.isCreating = true;
      },
    },

    mounted() {
      this.loadTasks();
    }
  };
</script>
