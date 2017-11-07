<template lang="pug">
  #feedback-editor
    p.control
      label.label {{ header }}
      .field.is-horizontal
        .select
          select(v-model="language")
            option(value="" selected) none
            option(v-for="lang in languages" :value="lang") {{ lang }}
        slot(name="first")
      .field.is-horizontal
        .select
          select(v-model="thresholdIsSmart" :disabled="!isLanguageSelected")
            option(:value="false") fixed
            option(:value="true") calibrated
        template(v-if="thresholdIsSmart")
          input.input(type="number" step="100" v-model.number="thresholdMin" :disabled="!canEditCalibThresholdParams" min="1000" :max="thresholdMax")
          .control-line -
          input.input(type="number" step="100" v-model.number="thresholdMax" :disabled="!canEditCalibThresholdParams" max="5000" :min="thresholdMin")
          .control-line ms
        template(v-else)
          input.input(type="number" step="100" v-model.number="thresholdValue" :disabled="!language")
          .control-line ms
        slot(name="second")
      .field.is-horizontal
        slot
</template>

<script>
/**
 * @fires input
 */
export default {
  name: 'feedback-editor',

  data() {
    return {
      language: this.value.language,
      thresholdIsSmart: this.value.threshold.smart,
      thresholdMin: this.value.threshold.min,
      thresholdMax: this.value.threshold.max,
      thresholdValue: this.value.threshold.value,
    };
  },

  props: {
    value: {
      type: Object,
      required: true,
    },
    header: {
      type: String,
      required: true,
    },
    languages: {
      type: Array,
      required: true,
    },
  },

  computed: {
    /** @returns {boolean} */
    canEditCalibThresholdParams() {
      return this.language && this.thresholdIsSmart;
    },

    /** @returns {boolean} */
    isLanguageSelected() {
      return !!this.language;
    },

    /** @returns {{language: string, threshold: {smart: boolean, min: number, max: number, value: number}}} */
    model() {
      return {
        language: this.language,
        threshold: {
          smart: this.thresholdIsSmart,
          min: this.thresholdMin,
          max: this.thresholdMax,
          value: this.thresholdValue,
        },
      };
    },
  },

  watch: {
    language() { this.$emit( 'input', this.model ); },
    thresholdIsSmart() { this.$emit( 'input', this.model ); },
    thresholdMin() { this.$emit( 'input', this.model ); },
    thresholdMax() { this.$emit( 'input', this.model ); },
    thresholdValue() { this.$emit( 'input', this.model ); },
  },
};

</script>

<style lang="less" scoped>
  #feedback-editor {
    font-size: 1rem;
  }

  .control {
    margin-top: 0;
  }

  .control-line {
    display: inline-block;
    margin: 0 0.2em;
    line-height: 2.25em;
    vertical-align: middle;
    white-space: nowrap;
  }

  input[type="number"] {
    width: 5em;
  }

  .field {
    margin-bottom: 3px;
  }

  input,
  select {
    margin-right: 4px;
  }
</style>
