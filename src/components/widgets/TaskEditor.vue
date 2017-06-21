<template lang="pug">
  #task-editor
    .tabs.is-centered
      ul
        li(:class="{ 'is-active': isCurrentTab( tab ) }" v-for="(tab, id) in tabs" :key="id")
          a(@click="selectTab( tab )") {{ tab.name }}

    .field
      task-editor-text(v-show="currentTab === tabs.text"
        :task="task"
        :intros="intros"
        @input="setTextInput")

      task-editor-feedback(v-show="currentTab === tabs.feedback"
        :task="task"
        @input="setFeedbackInput")

      task-editor-questionnaire(v-show="currentTab === tabs.questionnaire"
        :task="task"
        @input="setQuestionnaireInput")

    p.control.bottom-panel
      button.button.is-primary(:disabled="!canSave" @click="save") {{ action }}
      button.button.is-primary.is-sticked-right(@click="preview") Preview

    .fullscreen(ref="fullscreen")
      task-preview(v-if="inPreview" :task="currentTask" @close="closePreview")
</template>

<script>
  import Task from '@/model/task.js';

  import fullscreen from '@/components/mixins/fullscreen.js';

  import TaskPreview from '@/components/widgets/taskPreview';
  import TaskEditorText from '@/components/widgets/taskEditorText';
  import TaskEditorFeedback from '@/components/widgets/taskEditorFeedback';
  import TaskEditorQuestionnaire from '@/components/widgets/taskEditorQuestionnaire';

  export default {
    name: 'task-editor',

    mixins: [ fullscreen ],

    components: {
      'task-preview': TaskPreview,
      'task-editor-text': TaskEditorText,
      'task-editor-feedback': TaskEditorFeedback,
      'task-editor-questionnaire': TaskEditorQuestionnaire,
    },

    data() {
      return {
        name: this.task ? this.task.name : '',
        text: this.task ? Task.pagesToText( this.task.pages ) : '',
        intro: this.task ? this.task.intro : '',

        syllab: this.task ? this.task.syllab : Task.defaultSyllab,
        speech: this.task ? this.task.speech : Task.defaultSpeech,
        syllabExceptions: this.task ? Task.syllabsToText( this.task.syllab.exceptions ) : '',

        questionnaire: this.task ? this.task.questionnaire : [],

        inPreview: false,

        tabs: {
          text: {
            name: 'Text'
          },
          feedback: {
            name: 'Feedback'
          },
          questionnaire: {
            name: 'Questionnaire'
          }
        },
        currentTab: null
      };
    },

    props: {
      action: {
        type: String,
        default: 'Create'
      },
      task: {
        required: true,
        default: () => { return {}; }
      },
      intros: {
        type: Array,
        required: true,
        default: () => []
      }
    },

    computed: {

      isNewTask() {
        return !this.task;
      },

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
        });

        result.syllab.exceptions = Task.textToSyllabs( this.syllabExceptions );
        return result;
      }
    },

    methods: {

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
          questionnaire: this.questionnaire
        });
      }
    },

    created() {
      this.currentTab = this.tabs.text;
    }
  }
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
    position: absolute;
    bottom: 1.25em;
    left: 1.5em;
    right: 1.5em;

    .is-sticked-right {
      position: absolute;
      right: 0;
    }
  }
</style>
