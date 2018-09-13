<template lang="pug">
  #instructions.section
    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
    temporal-notification(type="success" :show="showSuccess")
      span {{ successMessage }}

    nav.panel
      p.panel-heading {{ tokens[ 'instructions' ] }}
      .panel-block.is-paddingless
        .container(v-if="intros === null")
          loading
        .container(v-else-if="!intros.length")
          i {{ tokens[ 'msg_no_instructions' ] }}
        table.table(v-else)
          thead
            tr
              th {{ tokens[ 'name' ] }}
              th {{ tokens[ 'text' ] }}
              th
                .is-pulled-right {{ tokens[ 'actions' ] }}
          tbody
            tr(v-for="item in intros")
              td {{ item.name }}
              td.keep-lines {{ item.textsSummary() }}
              td
                .is-pulled-right.is-flex
                  button.button.is-light(:title="tokens[ 'tit_edit' ]" @click="edit( item )")
                    i.fa.fa-edit
                  button.button.is-danger(:title="tokens[ 'tit_delete' ]" @click="remove( item )")
                    i.far.fa-trash-alt

    nav.panel
      p.panel-heading {{ tokens[ 'hdr_new' ] }}
      .panel-block.is-paddingless
        intro-editor.control(
        :action="tokens[ 'create' ]"
          :name-editable="true"
          :reload="resetNew"
          @save="tryToCreate")

    modal-container(v-if="toEdit" :title="tokens[ 'hdr_editor' ]" @close="closeEditor")
      intro-editor(
        :action="tokens[ 'save' ]"
        :show-labels="true"
        :intro="toEdit"
        @save="saveEdited")

    remove-warning(v-if="toDelete" object="instruction" :name="toDeleteName" @close="removeWarningClosed")
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';
import { i10n } from '@/utils/i10n.js';

import Teacher from '@/model/teacher.js';

import ActionError from '@/components/mixins/actionError';
import ActionSuccess from '@/components/mixins/actionSuccess';

import Loading from '@/components/widgets/Loading.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';
import ModalContainer from '@/components/widgets/ModalContainer.vue';
import IntroEditor from '@/components/widgets/IntroEditor.vue';
import RemoveWarning from '@/components/widgets/RemoveWarning.vue';

// ts-check-only
import Intro from '@/model/intro.js';
import { IntroCreateParams } from '@/model/commons/createParams.js';

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
      /** @type {Teacher} */
      teacher: null,

      resetNew: 0, // random value to trigger the field reset in TextEditor

      isCreating: false,

      /** @type {Intro[]} */
      intros: null,

      /** @type {Intro} */
      toDelete: null,
      /** @type {Intro} */
      toEdit: null,

      tokens: i10n( 'instructions', '_form', '_buttons', '_labels', '_failures' ),
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
      this.teacher.getIntros( /** @param {Error} err, @param {Intro[]} intros */( err, intros ) => {
        if ( err ) {
          this.intros = [];
          return this.setError( err, this.tokens[ 'load' ]( this.tokens[ 'instructions' ] ) );
        }

        this.intros = intros.sort( dataUtils.byName );
      } );
    },

    checkAccess() {
      if ( !Teacher.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    /** @param {{name: string}} e */
    tryToCreate( e ) {
      const exists = this.intros.some( intro => {
        return intro.name.toLowerCase() === e.name.toLowerCase();
      } );

      if ( exists ) {
        this.setError( this.tokens[ 'err_exists' ], this.tokens[ 'create_new' ]( this.tokens[ 'instruction' ] ) );
      }
      else {
        this.createIntro( e );
      }
    },

    /**
     * @param {any} newIntro
     */
    createIntro( newIntro ) {
      this.isCreating = true;

      this.teacher.createIntro( newIntro.name, newIntro.texts, /** @param {Error | string} err */ err => {
        this.isCreating = false;

        if ( err ) {
          this.setError( err, this.tokens[ 'create_new' ]( this.tokens[ 'instruction' ] ) );
        }
        else {
          this.loadIntros();
          this.setSuccess( this.tokens[ 'created' ]( this.tokens[ 'instruction' ] ) );
          this.resetNew = Math.random();
        }
      } );
    },

    /**
     * @param {Intro} item
     * @param {Event} e
     */
    remove( item, e ) {
      this.toDelete = item;
    },

    /**
     * @param {Intro} item
     * @param {Event} e
     */
    edit( item, e ) {
      this.toEdit = item;
    },

    /** @param {{name: string, texts: IntroCreateParams}} e */
    saveEdited( e ) {
      this.toEdit.update( e.name, e.texts, /** @param {Error} err */ err => {
        if ( err ) {
          this.setError( err, this.tokens[ 'update' ]( this.tokens[ 'instruction' ] ) );
        }
        else {
          this.setSuccess( this.tokens[ 'updated' ]( this.tokens[ 'instruction' ] ) );
        }

        this.loadIntros();
      } );

      this.closeEditor( null );
    },

    /** @param {Event} e */
    closeEditor( e ) {
      this.toEdit = null;
    },

    /** @param {{confirm: boolean}} e */
    removeWarningClosed( e ) {
      if ( e.confirm ) {
        this.teacher.deleteIntro( this.toDelete, /** @param {Error} err */ err => {
          if ( err ) {
            this.setError( err, this.tokens[ 'delete' ]( this.tokens[ 'instruction' ] ) );
          }
          else {
            this.setSuccess( this.tokens[ 'deleted' ]( this.tokens[ 'instruction' ] ) );
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
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'instructions', '_form', '_buttons', '_labels', '_failures' );
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
