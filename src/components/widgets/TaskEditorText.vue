<template lang="pug">
  #task-editor-text.field
    p.control
      .columns.is-inlined
        .column(v-if="isNameEditable")
          label.label Name
          input.input(type="text" :placeholder="placeholder" v-model="name")
        .column.is-narrow
          label.label Alignment
          .select
            select(v-model="alignment")
              option(value="center") center
              option(value="left") left
        .column.is-narrow
          label.label Font
          .select
            select(v-model="fontname")
              option(v-for="name in FONTS" :key="name") {{ name }}
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

        task-text-formatting-instructions.is-tip
    .notification.is-warning(v-if="hasTaskImagesBoundToWords") The task contains images bound to words and therefore its text cannot be modified.
    textarea.textarea.text(placeholder="Text" v-model="text" :disabled="hasTaskImagesBoundToWords")
</template>

<script>
import Task from '@/model/task.js';

import TaskTextFormattingInstructions from '@/components/widgets/TaskTextFormattingInstructions.vue';

// ts-check-only
import Intro from '@/model/intro.js';
import TextPage from '@/model/task/textPage.js';
import { TextPageImageFixationEvent } from '@/model/task/textPageImage.js';

/**
 * @fires input
 */
export default {
  name: 'task-editor-text',

  components: {
    'task-text-formatting-instructions': TaskTextFormattingInstructions
  },

  data() {
    return {
      name: this.task && this.task.name && !this.isCloning ? this.task.name : '',
      originalName: this.task && this.task.name && this.isCloning ? this.task.name : '',
      alignment: this.task && this.task.alignment ? this.task.alignment : 'center',
      fontname: this.task && this.task.fontname ? this.task.fontname : 'Calibri',
      intro: this.task && this.task.intro ? this.task.intro : '',
      text: this.task && this.task.pages ? Task.pagesToText( this.task.pages ) : '',

      FONTS: [
        'Arial',
        'Arial Black',
        'Bookman',
        'Calibri',
        'Comic Sans MS',
        'Courier',
        'Courier New',
        'Garamond',
        'Georgia',
        'Helvetica',
        'Impact',
        'Palatino',
        'Times New Roman',
        'Times',
        'Trebuchet MS',
        'Verdana',
      ],
    };
  },

  props: {
    task: {
      type: Task,
      default: null,
    },
    isNameEditable: {
      type: Boolean,
    },
    isCloning: {
      type: Boolean,
      default: false,
    },
    intros: {
      type: Array,
      default: /** @returns {Intro[]} */ () => [],
    },
  },

  computed: {

    /** @returns {{name: string, alignment: string, fontname: string, intro: string, text: string}} */
    currentModel() {
      return {
        name: this.name,
        alignment: this.alignment,
        fontname: this.fontname,
        intro: this.intro,
        text: this.text,
      };
    },

    /** @returns {boolean} */
    hasTaskImagesBoundToWords() {
      return this.task && this.task.pages && this.task.pages.some( /** @param {TextPage} page */ page => 
        !!page.images && page.images.some( image => {
          return !!/** @type {TextPageImageFixationEvent} */(image.on).words || !!image.on.word;
        }) 
      );
    },

    /** @returns {string} */
    placeholder() {
      return this.isCloning ? this.originalName : 'Name';
    }
  },

  watch: {
    name() {
      this.$emit( 'input', this.currentModel );
    },

    alignment() {
      this.$emit( 'input', this.currentModel );
    },

    fontname() {
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

  #task-editor-text {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .label:not(:last-child) {
    margin-bottom: 0;
  }

  .text {
    font-size: 15px;
    line-height: 1.25em;
    flex-grow: 1;    
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
