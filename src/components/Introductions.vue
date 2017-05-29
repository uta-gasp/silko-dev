<template lang="pug">
  #intros
    nav.panel
      creation-error(object="introduction" :show="showCreationError" :error="creationError")
      creation-success(object="introduction" :show="showCreationSuccess")
      p.panel-heading Add introduction
      text-editor(
        :is-intro="true"
        :name-editable="true"
        :reload="resetNew"
        @save="tryToCreate")

    nav.panel
      p.panel-heading Introductions
      .center(v-if="!intros.length")
        i No introductions exists yet
      table.table(v-else)
        thead
          tr
            th Name
            th Text
            th Actions
        tbody
          tr(v-for="item in intros")
            td {{item.name}}
            td.pre {{getTextFromLines( item.lines )}}
            td
              button.button.is-light(@click="edit( item )")
                i.fa.fa-edit
              button.button.is-danger(@click="remove( item )")
                i.fa.fa-remove

    modal-editor-container(v-if="toEdit" title="Introduction editor" @close="closeEditor()")
      text-editor(
        :is-intro="true"
        action="Save"
        :name-editable="false"
        :show-labels="true"
        :src-name="toEditName"
        :src-text="toEditText"
        :is-multipages="false"
        @save="saveEdited")

    remove-warning(v-if="toDelete" object="introduction" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
  import { EventBus }  from '../model/event-bus.js';
  import Teacher from '../model/teacher.js';
  import Intro from '../model/intro.js';

  import CreationSuccess from './CreationSuccess';
  import CreationError from './CreationError';
  import ModalEditorContainer from './ModalEditorContainer';
  import TextEditor from './TextEditor';
  import RemoveWarning from './RemoveWarning';

  export default {
    name: 'introductions',

    data() {
      return {
        teacher: null,

        resetNew: 0, // random value to trigger the field reset in TextEditor

        isCreating: false,
        creationError: '',
        showCreationError: 0,   // random value to trigger the notification
        showCreationSuccess: 0, // random value to trigger the notification

        intros: [],

        toDelete: null,
        toEdit: null
      };
    },

    components: {
      'creation-success': CreationSuccess,
      'creation-error': CreationError,
      'modal-editor-container': ModalEditorContainer,
      'text-editor': TextEditor,
      'remove-warning': RemoveWarning
    },

    computed: {

      toDeleteName() {
        return this.toDelete ? this.toDelete.name : '' ;
      },

      toEditName() {
        return this.toEdit ? this.toEdit.name : '' ;
      },

      toEditText() {
        return this.toEdit ? this.toEdit.lines.join( '\n' ) : '' ;
      }
    },

    methods: {

      init() {
        this.teacher = Teacher.instance;
        if (this.teacher) {
          this.loadIntros();
        }
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

      tryToCreate( newIntro ) {
        const exists = this.intros.some( intro => {
          return intro.name.toLowerCase() === newIntro.name.toLowerCase();
        });

        if (exists) {
          this.setCreationError( 'An introduction of this name exists already' );
        }
        else {
          this.createIntro( newIntro );
        }
      },

      createIntro( newIntro ) {
        this.isCreating = true;

        this.teacher.createIntro( newIntro.name, newIntro.text, (err, id) => {
          this.isCreating = false;

          if (err) {
            this.setCreationError( err );
          }
          else {
            this.loadIntros();

            this.showCreationSuccess = Math.random();
            this.resetNew = Math.random();
          }
        });
      },

      getTextFromLines( lines ) {
        return lines ? lines.join( '\n' ) : '';
      },

      edit( item ) {
        this.toEdit = item;
      },

      saveEdited( e ) {
        this.toEdit.updateText( e.text, err => {
          this.loadIntros();
        });

        this.closeEditor();
      },

      closeEditor() {
        this.toEdit = null;
      },

      remove( item ) {
        this.toDelete = item;
      },

      removeWarningClosed( confirm ) {
        if (confirm) {
          this.teacher.deleteIntro( this.toDelete, err => {
            this.loadIntros();
          });
        }
        this.toDelete = null;
      }
    },

    created() {
      console.log('Introductions component created');
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

  .pre {
    white-space: pre;
  }

</style>