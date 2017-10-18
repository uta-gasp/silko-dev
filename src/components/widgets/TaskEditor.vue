<template lang="pug">
  #task-editor
    .tabs.is-centered
      ul
        li(:class="{ 'is-active': isCurrentTab( tab ) }" v-for="(tab, id) in tabs" :key="id")
          a(@click="selectTab( tab )") {{ tab.name }}

    .field
      task-editor-text(v-show="currentTab === tabs.text"
        :task="ref"
        :intros="intros"
        @input="setTextInput")

      task-editor-feedback(v-show="currentTab === tabs.feedback"
        :task="ref"
        @input="setFeedbackInput")

      task-editor-images(v-show="currentTab === tabs.images"
        :task="ref"
        :current-text="text"
        @input="setImagesInput")

      task-editor-questionnaire(v-show="currentTab === tabs.questionnaire"
        :task="ref"
        @input="setQuestionnaireInput")

    p.control.bottom-panel
      button.button.is-primary(:disabled="!canSave" @click="save") {{ action }}
      button.button.is-primary(v-show="currentTab === tabs.feedback" @click="setDefaultFeedback") Set as default
      button.button.is-primary(@click="preview") Preview

    .fullscreen(ref="fullscreen")
      task-preview(v-if="inPreview" :task="currentTask" @close="closePreview")
</template>

<script>
import Task from '@/model/task.js';

import fullscreen from '@/components/mixins/fullscreen.js';

import TaskPreview from '@/components/widgets/taskPreview';
import TaskEditorText from '@/components/widgets/taskEditorText';
import TaskEditorFeedback from '@/components/widgets/taskEditorFeedback';
import TaskEditorImages from '@/components/widgets/taskEditorImages';
import TaskEditorQuestionnaire from '@/components/widgets/taskEditorQuestionnaire';

const TASK_DEFAULTS = 'task-defaults';

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
      ref: this.task || this.source || JSON.parse( window.localStorage.getItem( TASK_DEFAULTS ) ),

      name: '',
      text: '',
      intro: '',

      syllab: Task.defaultSyllab,
      speech: Task.defaultSpeech,
      syllabExceptions: '',

      images: [],

      questionnaire: [],

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
      currentTab: null,
    };
  },

  props: {
    action: {
      type: String,
      default: 'Create',
    },
    task: {
      required: true,
      default: null,
    },
    source: {
      type: Object,
      default: null,
    },
    intros: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  computed: {

    isNameValid() {
      return this.name.length > 1;
    },

    isTextValid() {
      return this.text.length > 14;
    },

    canSave() {
      return this.isNameValid &&
          this.isTextValid;
    },

    currentTask() {
      let result = new Task();
      result = Object.assign( result, {
        name: this.name.trim(),
        type: 'text',
        pages: Task.textToPages( this.text ),
        syllab: { ...this.syllab },
        speech: { ...this.speech },
      } );

      Task.embedImagesIntoPages( result.pages, this.images );

      result.syllab.exceptions = Task.textToSyllabs( this.syllabExceptions );
      return result;
    },
  },

  methods: {

    init() {
      if ( this.ref ) {
        if ( this.ref.name ) {
          this.name = this.ref.name;
        }
        if ( this.ref.pages ) {
          this.text = Task.pagesToText( this.ref.pages );
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
      }
    },

    isCurrentTab( tab ) {
      return tab === this.currentTab;
    },

    selectTab( tab ) {
      this.currentTab = tab;
    },

    preview( e ) {
      this.inPreview = true;
      this.makeFullscreen( this.$refs.fullscreen );
    },

    closePreview( e ) {
      this.inPreview = false;
      this.closeFullscreen();
    },

    setTextInput( e ) {
      this.name = e.name;
      this.intro = e.intro;
      this.text = e.text;
    },

    setFeedbackInput( e ) {
      this.syllab = e.syllab;
      this.speech = e.speech;
      this.syllabExceptions = e.syllabExceptions;
    },

    setImagesInput( e ) {
      this.images = e.images;
    },

    setDefaultFeedback( e ) {
      const defaults = JSON.stringify( {
        syllab: this.syllab,
        speech: this.speech,
      } );
      window.localStorage.setItem( TASK_DEFAULTS, defaults );
    },

    setQuestionnaireInput( e ) {
      this.questionnaire = e.questionnaire;
    },

    save( e ) {
      this.syllab.exceptions = this.syllabExceptions;

      this.$emit( 'save', {
        name: this.name.trim(),
        text: this.text,
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

    position: absolute;
    bottom: 1.25em;
    left: 1.5em;
    right: 1.5em;
  }
</style>
