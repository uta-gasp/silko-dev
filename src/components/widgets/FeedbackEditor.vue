<template lang="pug">
  #feedback-editor
    p.control
      label.label {{ header }}
      .field.is-horizontal
        .select
          select(v-model="feedback.language")
            option(value="" selected) none
            option(value="Finnish") Finnish
        slot(name="first")
      .field.is-horizontal
        .select
          select(v-model="feedback.threshold.smart" :disabled="!isLanguageSelected")
            option(:value="false") fixed
            option(:value="true") calibrated
        template(v-if="feedback.threshold.smart")
          input.input(type="number" step="100" v-model.number="feedback.threshold.min" :disabled="!canEditCalibThresholdParams" min="1000" :max="feedback.threshold.max")
          .control-line -
          input.input(type="number" step="100" v-model.number="feedback.threshold.max" :disabled="!canEditCalibThresholdParams" max="5000" :min="feedback.threshold.min")
          .control-line ms
        template(v-else)
          input.input(type="number" step="100" v-model.number="feedback.threshold.value" :disabled="!feedback.language")
          .control-line ms
</template>

<script>
  export default {
    name: 'feedback-editor',

    data() {
      return {
        feedback: this.value
      };
    },

    props: [ 'value', 'header' ],

    computed: {
      canEditCalibThresholdParams() {
        return this.feedback.language && this.feedback.threshold.smart;
      },

      isLanguageSelected() {
        return !!this.feedback.language;
      }
    }
  };

</script>

<style lang="less" scoped>
  .control-line {
    display: inline-block;
    margin: 0.2em 0.5em 0;
    line-height: 2em;
    vertical-align: middle;
    white-space: nowrap;
  }

  input[type="number"] {
    width: 5em;
  }
</style>
