<template lang="pug">
  #intros
    nav.panel
      creation-error(object="instruction" :show="showCreationError" :error="creationError")
      creation-success(object="instruction" :show="showCreationSuccess")
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
              td.pre {{ item.firstPageAsText() }}
              td
                .is-pulled-right
                  button.button.is-light(@click="edit( item )")
                    i.fa.fa-edit
                  button.button.is-danger(@click="remove( item )")
                    i.fa.fa-remove

    modal-editor-container(v-if="toEdit" title="Instruction editor" @close="closeEditor()")
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

  import CreationSuccess from '@/components/widgets/CreationSuccess';
  import CreationError from '@/components/widgets/CreationError';
  import ModalEditorContainer from '@/components/widgets/ModalEditorContainer';
  import IntroEditor from '@/components/widgets/IntroEditor';
  import RemoveWarning from '@/components/widgets/RemoveWarning';

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
      'intro-editor': IntroEditor,
      'remove-warning': RemoveWarning
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

      tryToCreate( e ) {
        const exists = this.intros.some( intro => {
          return intro.name.toLowerCase() === e.name.toLowerCase();
        });

        if (exists) {
          this.setCreationError( 'An introduction of this name exists already' );
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

      edit( item ) {
        this.toEdit = item;
      },

      saveEdited( e ) {
        this.toEdit.updateTexts( e.texts, err => {
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
  .pre {
    white-space: pre;
  }

</style>