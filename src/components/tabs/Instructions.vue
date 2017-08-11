<template lang="pug">
  #instructions.section
    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

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
        .container(v-if="intros === null")
          loading
        .container(v-else-if="!intros.length")
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

    modal-container(v-if="toEdit" title="Instruction editor" @close="closeEditor")
      intro-editor(
        action="Save"
        :name-editable="false"
        :show-labels="true"
        :intro="toEdit"
        @save="saveEdited")

    remove-warning(v-if="toDelete" object="instruction" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';

import Teacher from '@/model/teacher.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading';
import TemporalNotification from '@/components/widgets/TemporalNotification';
import ModalContainer from '@/components/widgets/ModalContainer';
import IntroEditor from '@/components/widgets/IntroEditor';
import RemoveWarning from '@/components/widgets/RemoveWarning';

export default {
  name: 'instructions',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
    'modal-container': ModalContainer,
    'intro-editor': IntroEditor,
    'remove-warning': RemoveWarning,
  },

  mixins: [ ActionError, ActionSuccess ],

  data() {
    return {
      teacher: null,

      resetNew: 0, // random value to trigger the field reset in TextEditor

      isCreating: false,

      intros: null,

      toDelete: null,
      toEdit: null,
    };
  },

  computed: {
    toDeleteName() {
      return this.toDelete ? this.toDelete.name : '';
    },
  },

  methods: {

    init() {
      this.teacher = Teacher.instance;
      if ( this.teacher ) {
        this.loadIntros();
      }
    },

    loadIntros() {
      this.teacher.getIntros( ( err, intros ) => {
        if ( err ) {
          this.intros = [];
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
      const exists = this.intros.some( intro => {
        return intro.name.toLowerCase() === e.name.toLowerCase();
      } );

      if ( exists ) {
        this.setError( 'An instructions of this name exists already', 'Failed to create new introduction' );
      }
      else {
        this.createIntro( e );
      }
    },

    createIntro( newIntro ) {
      this.isCreating = true;

      this.teacher.createIntro( newIntro.name, newIntro.texts, err => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, 'Failed to create new introduction' );
        }
        else {
          this.loadIntros();
          this.setSuccess( 'New introduction was created' );
          this.resetNew = Math.random();
        }
      } );
    },

    remove( item, e ) {
      this.toDelete = item;
    },

    edit( item, e ) {
      this.toEdit = item;
    },

    saveEdited( e ) {
      this.toEdit.updateTexts( e.texts, err => {
        if ( err ) {
          this.setError( err, 'Failed to save updates' );
        }
        else {
          this.setSuccess( 'Updates were saved' );
        }

        this.loadIntros();
      } );

      this.closeEditor();
    },

    closeEditor( e ) {
      this.toEdit = null;
    },

    removeWarningClosed( e ) {
      if ( e.confirm ) {
        this.teacher.deleteIntro( this.toDelete, err => {
          if ( err ) {
            this.setError( err, 'Failed to delete the introduction' );
          }
          this.loadIntros();
        } );
      }
      this.toDelete = null;
    },
  },

  created() {
    console.log( 'Instructions component created' );
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
  .keep-lines {
    white-space: pre-line;
  }
</style>
