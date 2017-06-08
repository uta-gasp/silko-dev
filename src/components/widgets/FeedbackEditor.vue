<template lang="pug">
  #feedback-editor
    p.control
      label.label {{ header }}
      .field.is-horizontal
        .select
          select(v-model="feedback.language")
            option(value="" selected) none
            option(value="Finnish") Finnish
        .control-line after
        input.input(type="number" step="100" v-model="feedback.threshold.value" :disabled="!feedback.language")
        .control-line ms
    p.control
      .field.is-horizontal
        label.checkbox.control-line(:disabled="!feedback.language")
          input(type="checkbox" v-model="feedback.threshold.smart" :disabled="!feedback.language")
          span adjusted, from
        input.input(type="number" step="100" v-model="feedback.threshold.min" :disabled="!feedback.language || !feedback.threshold.smart")
        .control-line ms to
        input.input(type="number" step="100" v-model="feedback.threshold.max" :disabled="!feedback.language|| !feedback.threshold.smart")
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
    props: [ 'value', 'header' ]
  };

</script>

<style lang="less" scoped>
  .checkbox {
    white-space: nowrap;
  }

  .control-line {
    display: inline-block;
    margin: 0.2em 0.5em 0;
    line-height: 2em;
    vertical-align: middle;
    white-space: nowrap;
  }

  input[type="number"] {
    min-width: 4em;
  }
</style>
