<template lang="pug">
  #task-editor-feedback
    p.control
      .columns.is-paddingless.is-marginless
        .column.is-paddingless.is-marginless.is-narrow
          feedback-editor(header="Speech" :value="speech")
          feedback-editor(header="Syllabification" :value="syllab")
            .field
              .field.is-horizontal
                span.select()
                  select(v-model="syllab.mode" :disabled="!syllab.language")
                    option(v-for="mode in syllabModes" :value="mode") {{ mode }}
              .field.is-horizontal
                bulma-checkbox(v-model="syllab.temporary" label="temporary" :disabled="!syllab.language")
              .field.is-horizontal
                bulma-checkbox(v-model="syllab.adjustForWordLength" label="word-length dependent" :disabled="!syllab.language")
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

  function deepCopy( obj ) {
    return obj;

    const result = {};
    for (let key in obj) {
      const value = obj[ key ];
      if (typeof value === 'object') {
        result[ key ] = deepCopy( value );
      }
      else {
        result[ key ] = value;
      }
    }

    return result;
  }

  export default {
    name: 'task-editor-feedback',

    components: {
      'feedback-editor': FeedbackEditor,
      'bulma-checkbox': BulmaCheckbox,
    },

    data() {
      return {
        syllab: this.task ? deepCopy( this.task.syllab ) : Task.defaultSyllab,
        speech: this.task ? deepCopy( this.task.speech ) : Task.defaultSpeech,
        syllabExceptions: this.task ? Task.syllabsToText( this.task.syllab.exceptions ) : '',

        syllabModes: Object.keys( Syllabifier.MODES ),
      };
    },

    props: {
      task: {
        type: Object,
        default: () => { return {}; }
      },
    },

    computed: {
      currentModel() {
        return {
          syllab: this.syllab,
          speech: this.speech,
          syllabExceptions: this.syllabExceptions
        };
      }
    },

    watch: {
      syllab( value ) {
        this.$emit( 'input', this.currentModel );
      },

      speech( value ) {
        this.$emit( 'input', this.currentModel );
      },

      syllabExceptions( value ) {
        this.$emit( 'input', this.currentModel );
      }
    },
  }
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
