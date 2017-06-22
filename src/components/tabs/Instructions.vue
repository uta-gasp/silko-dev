<template lang="pug">
  #instructions
    modal-notification(type="danger" :show="showCreationError")
      span Failed to create an instruction: {{ creationError }}.
    modal-notification(type="success" :show="showCreationSuccess")
      span The instruction was created.

    nav.panel
      p.panel-heading Add instruction
      .panel-block.is-paddingless
        intro-editor.control(
          :name-editable="true"
          :reload="resetNew"
          @save="tryToCreate")

    nav.panel
      p.panel-heading Instructions
      .panel-block.is-paddingless
        .container(v-if="!intros.length")
          i No instructions exists yet
        table.table(v-else)
          thead
            tr
              th Name
              th Text
              th
                .is-pulled-right Actions
          tbody
            tr(v-for="item in intros")
              td {{ item.name }}
              td.keep-lines {{ item.firstPageAsText() }}
              td
                .is-pulled-right.is-flex
                  button.button.is-light(@click="edit( item )")
                    i.fa.fa-edit
                  button.button.is-danger(@click="remove( item )")
                    i.fa.fa-remove

    modal-editor-container(v-if="toEdit" title="Instruction editor" @close="closeEditor")
      intro-editor(
        action="Save"
        :name-editable="false"
        :show-labels="true"
        :intro="toEdit"
        @save="saveEdited")

    remove-warning(v-if="toDelete" object="instruction" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
  import eventBus  from '@/utils/event-bus.js';

  import Teacher from '@/model/teacher.js';

  import ModalNotification from '@/components/widgets/ModalNotification';
  import ModalEditorContainer from '@/components/widgets/ModalEditorContainer';
  import IntroEditor from '@/components/widgets/IntroEditor';
  import RemoveWarning from '@/components/widgets/RemoveWarning';

  export default {
    name: 'instructions',

    components: {
      'modal-notification': ModalNotification,
      'modal-editor-container': ModalEditorContainer,
      'intro-editor': IntroEditor,
      'remove-warning': RemoveWarning
    },

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

    computed: {

      toDeleteName() {
        return this.toDelete ? this.toDelete.name : '' ;
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
            return `TODO Cannot retrieve intros.\n\n${err}`;
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

      tryToCreate( e ) {
        const exists = this.intros.some( intro => {
          return intro.name.toLowerCase() === e.name.toLowerCase();
        });

        if (exists) {
          this.setCreationError( 'An instructions of this name exists already' );
        }
        else {
          this.createIntro( e );
        }
      },

      createIntro( newIntro ) {
        this.isCreating = true;

        this.teacher.createIntro( newIntro.name, newIntro.texts, (err, id) => {
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

      remove( item, e ) {
        this.toDelete = item;
      },

      edit( item, e ) {
        this.toEdit = item;
      },

      saveEdited( e ) {
        this.toEdit.updateTexts( e.texts, err => {
          this.loadIntros();
        });

        this.closeEditor();
      },

      closeEditor( e ) {
        this.toEdit = null;
      },

      removeWarningClosed( e ) {
        if (e.confirm) {
          this.teacher.deleteIntro( this.toDelete, err => {
            this.loadIntros();
          });
        }
        this.toDelete = null;
      },
    },

    created() {
      console.log('Instructions component created');
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
  .keep-lines {
    white-space: pre-line;
  }
</style>