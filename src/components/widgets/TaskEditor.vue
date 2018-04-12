<template lang="pug">
  #task-editor
    .tabs.is-centered
      ul
        li(:class="{ 'is-active': isCurrentTab( tab ) }" v-for="(tab, id) in tabs" :key="id")
          a(@click="selectTab( tab )") {{ tab.name }}

    .field.expand
      task-editor-text(v-show="currentTab === tabs.text"
        :task="ref"
        :intros="intros"
        :is-name-editable="isTaskNameEditable"
        :is-cloning="isCloningTask"
        @input="setTextInput"
      )

      task-editor-feedback(v-show="currentTab === tabs.feedback"
        :task="ref"
        @input="setFeedbackInput"
      )

      task-editor-images(v-show="currentTab === tabs.images"
        :task="ref"
        :current-text="text"
        @input="setImagesInput"
        @editing="onImageEditing($event)"
      )

      task-editor-questionnaire(v-show="currentTab === tabs.questionnaire"
        :task="ref"
        @input="setQuestionnaireInput"
      )

    p.control.bottom-panel
      button.button.is-primary(:disabled="!canSave" @click="save") {{ action }}
      button.button.is-primary(v-show="currentTab === tabs.feedback" @click="setDefaultFeedback") Set as default
      button.button.is-primary(:disabled="!canPreview" @click="preview") Preview

    .fullscreen(ref="fullscreen")
      task-preview(v-if="inPreview" :task="getCurrentTask()" @close="closePreview")
</template>

<script>
import Task from '@/model/task.js';

import fullscreen from '@/components/mixins/fullscreen.js';

import TaskPreview from '@/components/widgets/taskPreview.vue';
import TaskEditorText from '@/components/widgets/taskEditorText.vue';
import TaskEditorFeedback from '@/components/widgets/taskEditorFeedback.vue';
import TaskEditorImages from '@/components/widgets/taskEditorImages.vue';
import TaskEditorQuestionnaire from '@/components/widgets/taskEditorQuestionnaire.vue';

// ts-check-only
import { TextPageImage } from '@/model/task/textPageImage.js';
import { Question } from '@/model/session/question.js';
import Intro from '@/model/intro.js';
import { SyllabOptions, SpeechOptions } from '@/model/session/feedbacks.js';

/**
 * @typedef Tab
 * @property {string} name
 */

const TASK_DEFAULTS = 'task-defaults';

/**
 * @fires save
 * @fires edited
 */
export default {
  name: 'task-editor',

  mixins: [ fullscreen ],

  components: {
    'task-preview': TaskPreview,
    'task-editor-text': TaskEditorText,
    'task-editor-feedback': TaskEditorFeedback,
    'task-editor-images': TaskEditorImages,
    'task-editor-questionnaire': TaskEditorQuestionnaire,
  },

  data() {
    return {
      /** @type {Task} */
      ref: this.task || this.source || JSON.parse( window.localStorage.getItem( TASK_DEFAULTS ) ),

      name: '',
      alignment: '',
      fontname: '',
      text: '',
      /** @type {Intro | string} */
      intro: '',

      syllab: Task.defaultSyllab,
      speech: Task.defaultSpeech,
      syllabExceptions: '',

      /** @type {TextPageImage[]} */
      images: [],

      /** @type {Question[]} */
      questionnaire: [],

      canPreview: true,
      inPreview: false,

      tabs: {
        text: {
          name: 'Text',
        },
        feedback: {
          name: 'Feedback',
        },
        images: {
          name: 'Images',
        },
        questionnaire: {
          name: 'Questionnaire',
        },
      },

      /** @type {Tab} */
      currentTab: null,
    };
  },

  props: {
    action: {
      type: String,
      default: 'Create',
    },
    task: {
      type: Task,
      default: null,
    },
    source: {
      type: Task,
      default: null,
    },
    intros: {
      type: Array,
      required: true,
      default: /** @returns {Array} */ () => [],
    },
  },

  computed: {

    /** @returns {boolean} */
    isTaskNameEditable() {
      return !this.ref || !this.ref.name || !!this.source;
    },

    /** @returns {boolean} */
    isCloningTask() {
      return !!this.source;
    },
    
    /** @returns {boolean} */
    isNameValid() {
      return this.name.length > 1;
    },

    /** @returns {boolean} */
    isTextValid() {
      return this.text.length > 14;
    },

    /** @returns {boolean} */
    canSave() {
      return this.isNameValid &&
          this.isTextValid;
    },
  },

  methods: {

    init() {
      if ( !this.ref ) {
        return;
      }

      if ( this.ref.name ) {
        this.name = !!this.source ? '' : this.ref.name;
      }
      if ( this.ref.pages ) {
        this.text = Task.pagesToText( this.ref.pages );
      }
      if ( this.ref.alignment ) {
        this.alignment = this.ref.alignment;
      }
      if ( this.ref.fontname ) {
        this.fontname = this.ref.fontname;
      }
      if ( this.ref.intro ) {
        this.intro = this.ref.intro;
      }

      if ( this.ref.syllab ) {
        this.syllab = this.ref.syllab;
      }
      if ( this.ref.speech ) {
        this.speech = this.ref.speech;
      }
      if ( this.ref.syllab.exceptions ) {
        this.syllabExceptions = Task.syllabsToText( this.ref.syllab.exceptions );
      }

      if ( this.ref.pages ) {
        this.ref.pages.forEach( ( page, index ) => {
          if ( !page.images ) {
            return;
          }

          page.images.forEach( image => {
            this.images.push( Object.assign( { page: index }, image ) );
          } );
        } );
      }

      if ( this.ref.questionnaire ) {
        this.questionnaire = this.ref.questionnaire;
      }
    },

    /**
     * @param {Tab} tab 
     * @returns {boolean}
     */
    isCurrentTab( tab ) {
      return tab === this.currentTab;
    },

    /**
     * @param {Tab} tab 
     */
    selectTab( tab ) {
      this.currentTab = tab;
    },

    /** @param {Event} e */
    preview( e ) {
      this.inPreview = true;
      this.makeFullscreen( this.$refs.fullscreen );
    },

    /** @param {Event} e */
    closePreview( e ) {
      this.inPreview = false;
      this.closeFullscreen();
    },

    /** @param {{name: string, alignment: string, fontname: string, intro: Intro, text: string}} e */
    setTextInput( e ) {
      this.name = e.name;
      this.alignment = e.alignment;
      this.fontname = e.fontname;
      this.intro = e.intro;
      this.text = e.text;

      this.$emit( 'modified' );
    },

    /** @param {{syllab: SyllabOptions, speech: SpeechOptions, syllabExceptions: string}} e */
    setFeedbackInput( e ) {
      this.syllab = e.syllab;
      this.speech = e.speech;
      this.syllabExceptions = e.syllabExceptions;

      this.$emit( 'modified' );
    },

    /** @param {{images: TextPageImage[]}} e */
    setImagesInput( e ) {
      this.images = e.images;

      this.$emit( 'modified' );
    },

    /** @param {boolean} e */
    onImageEditing( e ) {
      this.canPreview = !e;
    },

    /** @param {Event} e */
    setDefaultFeedback( e ) {
      const defaults = JSON.stringify( {
        syllab: this.syllab,
        speech: this.speech,
      } );
      window.localStorage.setItem( TASK_DEFAULTS, defaults );
    },

    /** @param {{questionnaire: Question[]}} e */
    setQuestionnaireInput( e ) {
      this.questionnaire = e.questionnaire;

      this.$emit( 'modified' );
    },

    /** @returns {Task} */
    getCurrentTask() {
      let result = new Task();
      result = Object.assign( result, {
        name: this.name.trim(),
        type: 'text',
        alignment: this.alignment,
        fontname: this.fontname,
        pages: Task.textToPages( this.text ),
        syllab: { ...this.syllab },
        speech: { ...this.speech },
      } );

      Task.embedImagesIntoPages( result.pages, this.images );

      result.syllab.exceptions = Task.textToSyllabs( this.syllabExceptions );
      return result;
    },

    /** @param {Event} e */
    save( e ) {
      this.syllab.exceptions = this.syllabExceptions;

      this.$emit( 'save', {
        name: this.name.trim(),
        text: this.text,
        alignment: this.alignment,
        fontname: this.fontname,
        intro: this.intro,
        syllab: this.syllab,
        speech: this.speech,
        images: this.images,
        questionnaire: this.questionnaire,
      } );
    },
  },

  created() {
    this.currentTab = this.tabs.text;
  },

  mounted() {
    this.init();
  },
};
</script>

<style lang="less" scoped>

  #task-editor {
    width: 700px;
    min-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .expand {
    flex-grow: 1;    
  }

  .tabs a {
    text-decoration: none;
  }

  .fullscreen {
    background-color: #fff;
  }

  .bottom-panel {
    display: flex;
    justify-content: space-between;
  }
</style>
