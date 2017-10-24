<template lang="pug">
  #task-editor-text.field
    p.control
      .columns.is-inlined
        .column(v-if="isNewTask")
          label.label Name
          input.input(type="text" placeholder="Name" v-model="name")
        .column.is-narrow
          label.label Alignment
          .select
            select(v-model="alignment")
              option(value="center") center
              option(value="left") left
        .column.is-narrow
          label.label Introduction
          span.select
            select(v-model="intro")
              option(value="") none
              option(v-for="item in intros" :value="item.id") {{ item.name }}

    p.control
      .columns.is-inlined.tip-parent
        .column
          label.label Text
        .column.is-narrow.tip-header Formatting

        nav.panel.notification.is-tip.is-paddingless
          p.panel-block
            code Empty line
            span.explanation page separator
          p.panel-block
            code |
            span.explanation applies comma-separated styles listed afterward for
              span.explanation.is-inline-block a word:
                .example
                  i Iso koulupiha|bold
                  span &#61; Iso
                  b koulupiha
              span.explanation.is-inline-block a line:
                .example
                  i Iso koulupiha |bold
                  span &#61;
                  b Iso koulupiha
          p.panel-block
            code
              a(href="https://www.w3schools.com/cssref/css_colors.asp" target="_blank") red
              span
              a(href="https://www.w3schools.com/colors/colors_rgb.asp") #22aaff
              span
              abbr(title="25% lighter than the normal text") light
              span
              abbr(title="25% darker than the normal text") dark
            span.explanation font color
          p.panel-block
            code 22pt
            span.explanation font size
          p.panel-block
            code italic regular
            span.explanation font style
          p.panel-block
            code normal bold
            span.explanation font weight
          p.panel-block
            h4.heading.is-4.is-inline.has-text-centered Example
            span.has-text-centered
              i.is-block A big grey line with blue|#22aaff &amp; italic|italic words |grey,18pt
              .is-block(style="color: grey; font-size: 18pt")
                span A big grey line with
                span(style="color: #22aaff") blue
                span &amp;
                span(style="font-style: italic") italic
                span words

    textarea.textarea.text(placeholder="Text" v-model="text")
</template>

<script>
import Task from '@/model/task.js';

export default {
  name: 'task-editor-text',

  data() {
    return {
      name: this.task && this.task.name ? this.task.name : '',
      alignment: this.task && this.task.alignment ? this.task.alignment : 'center',
      intro: this.task && this.task.intro ? this.task.intro : '',
      text: this.task && this.task.pages ? Task.pagesToText( this.task.pages ) : '',
    };
  },

  props: {
    task: {
      type: Object,
      default: () => { return {}; },
    },
    intros: {
      type: Array,
      default: () => [],
    },
  },

  computed: {

    isNewTask() {
      return !( this.task && this.task.name );
    },

    currentModel() {
      return {
        name: this.name,
        alignment: this.alignment,
        intro: this.intro,
        text: this.text,
      };
    },
  },

  watch: {
    name() {
      this.$emit( 'input', this.currentModel );
    },

    alignment() {
      this.$emit( 'input', this.currentModel );
    },

    intro() {
      this.$emit( 'input', this.currentModel );
    },

    text() {
      this.$emit( 'input', this.currentModel );
    },
  },
};
</script>

<style lang="less" scoped>

  .label:not(:last-child) {
    margin-bottom: 0;
  }

  .text {
    min-height: 334px;
    font-size: 15px;
    line-height: 1.25em;
  }

  .tip-parent {
    position: relative;
  }

  .tip-header {
    // border-bottom: 1px dashed #444;
    font-size: 0.9em;
    margin-right: 0.5em;
    text-decoration: black dotted;
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

  .example {
    display: inline-block;
    background-color: white;
    padding: 0 0.5em;
    margin: 2px 0.5em;
  }

  .explanation {
    padding-left: 1em;
  }

  .panel-block {
    span:before,
    span:after {
      content: " ";
    }
  }

  .is-inlined,
  .is-inlined .column {
    margin-bottom: 0;
    padding-bottom: 0;
  }

</style>
