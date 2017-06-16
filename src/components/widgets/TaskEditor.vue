<template lang="pug">
  #task-editor
    .tabs.is-centered
      ul
        li(:class="{ 'is-active': isCurrentTab( tab ) }" v-for="(tab, id) in tabs" :key="id")
          a(@click="selectTab( tab )") {{ tab.name }}

    .field
      .field(v-show="currentTab === tabs.text")

        p.control
          .columns.is-paddingless.is-marginless
            .column.is-paddingless.is-marginless(v-if="isNewTask")
              label.label(v-show="showLabels") Name
              input.input(type="text" placeholder="Name" v-model="name")
            .column.is-paddingless.is-marginless
              label.label(v-show="showLabels") Introduction
              span.select
                select(v-model="intro")
                  option(value="") none
                  option(v-for="item in intros" :value="item.id") {{ item.name }}

        p.control
          .columns.is-paddingless.is-marginless.tip-parent
            .column.is-paddingless.is-marginless
              label.label(v-show="showLabels") Text
            .column.is-paddingless.is-marginless.is-narrow.tip-header(v-show="showLabels") Formatting
            nav.panel.notification.is-tip.is-paddingless
              p.panel-block
                code Empty line
                span.explanation page separator
              p.panel-block
                code |
                span.explanation applies comma-separated styles listed afterward for
                  span.explanation.is-inline-block a word:
                    i Iso koulupiha|bold
                    span &#61; Iso
                    b koulupiha
                  span.explanation.is-inline-block a line:
                    i Iso koulupiha |bold
                    span &#61;
                    b Iso koulupiha
              p.panel-block
                code
                  a(href="https://www.w3schools.com/cssref/css_colors.asp" target="_blank") red
                  span
                  a(href="https://www.w3schools.com/colors/colors_rgb.asp") #22aaff
                  span
                  abbr(title="25% lighter than the normal text") lighter
                  span
                  abbr(title="25% darker than the normal text") darker
                span.explanation font color
              p.panel-block
                code 22pt
                span.explanation font size
              p.panel-block
                code italic regular
                span.explanation font style
              p.panel-block
                code bold bolder normal lighter light
                span.explanation font weight
              p.panel-block
                span
                  .is-block A big grey line with blue|#22aaff &amp; italic|italic words |grey,18pt
                  .is-block(style="color: grey; font-size: 18pt")
                    span A big grey line with
                    span(style="color: #22aaff") blue
                    span &amp;
                    span(style="font-style: italic") italic
                    span words

        textarea.textarea.text(placeholder="Text" v-model="text")

      .field(v-show="currentTab === tabs.feedback")
        p.control
          .columns.is-paddingless.is-marginless
            .column.is-paddingless.is-marginless.is-narrow
              feedback-editor(header="Speech" :value="speech")
              feedback-editor(header="Syllabification" :value="syllab")
                span(slot="first")
                  span.select()
                    select(v-model="syllab.mode" :disabled="!syllab.language")
                      option(v-for="mode in syllabModes" :value="mode") {{ mode }}
                .field(slot="last")
                  bulma-checkbox.is-inline-block(v-model="syllab.temporary" label="temporary" :disabled="!syllab.language")
                  bulma-checkbox.is-inline-block(v-model="syllab.adjustForWordLength" label="word-length dependent" :disabled="!syllab.language")
            .column
              .columns.is-paddingless.is-marginless
                .column.is-paddingless.is-marginless.is-narrow
                  label.label Exceptions
                .column.has-text-right.is-paddingless.is-marginless
                  i.instruction Example: maailma=maa il ma
              textarea.textarea.exceptions(:disabled="!syllab.language" placeholder="Syllabifications" v-model="syllabExceptions")

    p.control.bottom-panel
      button.button.is-primary(:disabled="!canSave" @click="save") {{ action }}
      button.button.is-primary.is-sticked-right(@click="preview") Preview

    .fullscreen(ref="fullscreen")
      task-preview(v-if="inPreview" :task="currentTask" @close="closePreview")
</template>

<script>
  import Task from '@/model/task.js';

  import Syllabifier from '@/utils/syllabifier.js';

  import fullscreen from '@/components/mixins/fullscreen.js';

  import FeedbackEditor from '@/components/widgets/feedbackEditor';
  import TaskPreview from '@/components/widgets/taskPreview';
  import BulmaCheckbox from '@/components/widgets/bulmaCheckbox';

  export default {
    name: 'task-editor',

    mixins: [ fullscreen ],

    components: {
      'feedback-editor': FeedbackEditor,
      'task-preview': TaskPreview,
      'bulma-checkbox': BulmaCheckbox,
    },

    data() {
      return {
        name: this.task ? this.task.name : '',
        text: this.task ? Task.pagesToText( this.task.pages ) : '',
        intro: this.task ? this.task.intro : '',
        syllab: this.task ? this.task.syllab : Task.defaultSyllab,
        speech: this.task ? this.task.speech : Task.defaultSpeech,
        syllabExceptions: this.task ? Task.syllabsToText( this.task.syllab.exceptions ) : '',

        inPreview: false,
        syllabModes: Object.keys( Syllabifier.MODES ),

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
      showLabels: {
        type: Boolean,
        default: false
      },
      task: {
        type: Object,
        default: () => { return {}; }
      },
      intros: {
        type: Array,
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

      save( e ) {
        this.syllab.exceptions = this.syllabExceptions;

        this.$emit( 'save', {
          name: this.name.trim(),
          text: this.text,
          intro: this.intro,
          syllab: this.syllab,
          speech: this.speech,
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
    width: 800px;
    min-height: 80vh;
  }

  .label > i {
    display: block;
    font-size: 12px;
    font-weight: 400;
  }

  .label:not(:last-child) {
    margin-bottom: 0;
  }

  .text {
    min-height: 334px;
    font-size: 15px;
    line-height: 1.25em;
  }

  .exceptions {
    min-height: 334px;
  }

  .fullscreen {
    background-color: #fff;
  }

  .tip-parent {
    position: relative;
  }

  .tip-header {
    border-bottom: 1px dashed #444;
    font-size: 0.9em;
  }

  .is-tip {
    display: none;
    position: absolute;
    top: 1.25em;
    right: 0;
    z-index: 1;
    max-width: 500px;
  }

  .tip-header:hover ~ .is-tip,
  .tip-header ~ .is-tip:hover {
    display: block;
  }

  .formatting-instructions {
    max-width: 450px;
  }

  .instruction {
    line-height: 1.75em;
    font-size: 0.9em;
  }

  .explanation {
    padding-left: 1em;
  }

  .bottom-panel {
    position: absolute;
    bottom: 1.25em;
    left: 1.25em;
    right: 1.25em;

    .is-sticked-right {
      position: absolute;
      right: 0;
    }
  }

  .panel-block {
    span:before,
    span:after {
      content: " ";
    }
  }

  .tabs a {
    text-decoration: none;
  }
</style>
