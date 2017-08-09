<template lang="pug">
  #task-editor-feedback
    p.control
      .columns.is-paddingless.is-marginless
        .column.is-paddingless.is-marginless.is-narrow
          feedback-editor(header="Speech" v-model="speech")
            .field
              .field.is-horizontal
                bulma-checkbox(v-model="speechAdjustForWordLength" label="word-length dependent" :disabled="!speech.language")
          feedback-editor(header="Syllabification" v-model="syllab")
            .field
              .field.is-horizontal
                span.select()
                  select(v-model="syllabMode" :disabled="!syllab.language")
                    option(v-for="mode in syllabModes" :value="mode") {{ mode }}
              .field.is-horizontal
                bulma-checkbox(v-model="syllabTemporary" label="temporary" :disabled="!syllab.language")
              .field.is-horizontal
                bulma-checkbox(v-model="syllabAdjustForWordLength" label="word-length dependent" :disabled="!syllab.language")
        .column.is-paddingless.is-marginless
          .columns.is-paddingless.is-marginless
            .column.is-paddingless.is-marginless.is-narrow
              label.label Exceptions
            .column.has-text-right.is-paddingless.is-marginless
              i.instruction Example: maailma=maa il ma
          textarea.textarea.exceptions(:disabled="!syllab.language" placeholder="Syllabifications" v-model="syllabExceptions")
</template>

<script>
import Task from '@/model/task.js';

import Syllabifier from '@/utils/syllabifier.js';

import FeedbackEditor from '@/components/widgets/feedbackEditor';
import BulmaCheckbox from '@/components/widgets/bulmaCheckbox';

export default {
  name: 'task-editor-feedback',

  components: {
    'feedback-editor': FeedbackEditor,
    'bulma-checkbox': BulmaCheckbox,
  },

  data() {
    return {
      speech: this.task ? this.task.speech : Task.defaultSpeech,
      speechAdjustForWordLength: this.task ? this.task.speech.threshold.adjustForWordLength : Task.defaultSpeech.threshold.adjustForWordLength,

      syllab: this.task ? this.task.syllab : Task.defaultSyllab,
      syllabExceptions: this.task ? Task.syllabsToText( this.task.syllab.exceptions ) : '',
      syllabMode: this.task ? this.task.syllab.mode : Task.defaultSyllab.mode,
      syllabTemporary: this.task ? this.task.syllab.temporary : Task.defaultSyllab.temporary,
      syllabAdjustForWordLength: this.task ? this.task.syllab.threshold.adjustForWordLength : Task.defaultSyllab.threshold.adjustForWordLength,

      syllabModes: Object.keys( Syllabifier.MODES ),
    };
  },

  props: {
    task: {
      type: Object,
      default: () => { return {}; },
    },
  },

  computed: {
    model() {
      const result = {
        syllab: this.syllab,
        speech: this.speech,
        syllabExceptions: this.syllabExceptions,
      };

      result.syllab.mode = this.syllabMode;
      result.syllab.temporary = this.syllabTemporary;
      result.syllab.threshold.adjustForWordLength = this.syllabAdjustForWordLength;
      result.speech.threshold.adjustForWordLength = this.speechAdjustForWordLength;

      return result;
    },
  },

  watch: {
    speech() { this.$emit( 'input', this.model ); },
    speechAdjustForWordLength() { this.$emit( 'input', this.model ); },
    syllab() { this.$emit( 'input', this.model ); },
    syllabExceptions() { this.$emit( 'input', this.model ); },
    syllabMode() { this.$emit( 'input', this.model ); },
    syllabTemporary() { this.$emit( 'input', this.model ); },
    syllabAdjustForWordLength() { this.$emit( 'input', this.model ); },
  },
};
</script>

<style lang="less" scoped>

  .label:not(:last-child) {
    margin-bottom: 0;
  }

  .exceptions {
    min-height: 334px;
  }

  .instruction {
    line-height: 1.75em;
    font-size: 0.9em;
  }

</style>
