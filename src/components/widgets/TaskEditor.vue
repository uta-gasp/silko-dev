<template lang="pug">
  #task-editor
    .field
      .columns

        .column
          p.control
            label.label(v-show="showLabels") Name
            input.input(type="text" placeholder="Name" :disabled="!isNameEditable" v-model="name")
          p.control
            .columns.is-paddingless.is-marginless
              .column.is-paddingless.is-marginless.is-narrow
                label.label(v-show="showLabels").is-pulled-left Text
              .column.has-text-right.is-paddingless.is-marginless
                .text-format-instruction Empty line to separate pages
                .text-format-instruction "|" after a word or line to apply styles separated by ","
                .text-format-instruction Styles: 1) text colors, eg&nbsp;
                  a(href="https://www.w3schools.com/cssref/css_colors.asp" target="_blank") "red"
                  span ,&nbsp;
                  a(href="https://www.w3schools.com/colors/colors_rgb.asp") "#22aaff"
                  span ,&nbsp;
                  abbr(title="25% lighter than the normal text") 'lighter',
                  abbr(title="25% darker than the normal text") "darker"
                  span 2) font size, eg "22pt"
                .text-format-instruction Example: This is a big black string with a blue|#22aaff word |black,28pt
          textarea.textarea.text(placeholder="Text" v-model="text")

        .column.is-narrow
          .field
            p.control
              label.label(v-show="showLabels") Introduction
              span.select
                select(v-model="intro")
                  option(value="") none
                  option(v-for="item in intros" :value="item.id") {{ item.name }}
          feedback-editor(header="Speech" :value="speech")
          feedback-editor(header="Syllabification" :value="syllab")
            span(slot="first")
              span.select()
                select(v-model="syllab.mode" :disabled="!syllab.language")
                  option(v-for="mode in syllabModes" :value="mode") {{ mode }}
            .field(slot="last")
              bulma-checkbox.is-inline(v-model="syllab.temporary" label="temporary" :disabled="!syllab.language")
          .field
            .columns.is-paddingless.is-marginless
              .column.is-paddingless.is-marginless.is-narrow
                label Exceptions
              .column.has-text-right.is-paddingless.is-marginless
                i.text-format-instruction Eg: maailma=maa il ma
            textarea.textarea.exceptions(:disabled="!syllab.language" placeholder="Syllabifications" v-model="syllabExceptions")

      p.control
        button.button.is-primary(:disabled="!canSave" @click="save") {{ action }}
        button.button.is-primary.is-pulled-right(@click="preview") Preview

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

      isNameEditable() {
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
    }
  }
</script>

<style lang="less" scoped>

  #task-editor {
    width: 840px;
  }

  .label > i {
    display: block;
    font-size: 12px;
    font-weight: 400;
  }

  .text-format-instruction {
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
    min-height: 100px;
  }

  .fullscreen {
    background-color: #fff;
  }

  .is-inline {
    display: inline-block;
  }

</style>
