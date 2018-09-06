<template lang="pug">
  #intro-editor
    .field(:class="{ squeezed: showLabels }")
      .columns
        .column
          label.label(v-show="showLabels") Name
          p.control
            input.input(type="text" placeholder="Name" :disabled="!nameEditable" v-model="name" :class="{'is-danger': name.length && !isNameValid}")
          p.help.is-danger(v-show="name.length && !isNameValid") name is too short
      .columns(v-show="showLabels")
        .column.is-three-quarters
          p.control
            label.label Texts
        .column
          p.control
            label.label Buttons
      .columns
        .column.is-three-quarters
          p.control
            textarea.textarea.low(placeholder="Calibration instruction" v-model="calib" :class="{'is-danger': calib.length && !isCalibInstructionValid}")
          p.help.is-danger(v-show="calib.length && !isCalibInstructionValid") instruction is too short
        .column
          p.control
            input.input(type="text" placeholder="Calibrate" v-model="calibStart")
          p.control
            input.input(type="text" placeholder="Skip calibration" v-model="calibSkip")
      .columns
        .column.is-three-quarters
          p.control
            textarea.textarea.low(placeholder="Start instruction" v-model="start" :class="{'is-danger': start.length && !isStartInstructionValid}")
          p.help.is-danger(v-show="start.length && !isStartInstructionValid") instruction is too short
        .column
          p.control
            input.input(type="text" placeholder="Start" v-model="startRun")
          p.control
            input.input(type="text" placeholder="Cancel" v-model="startCancel")
      .columns
        .column.is-three-quarters
          p.control
            textarea.textarea(placeholder="First page" v-model="firstPage" :class="{'is-danger': firstPage.length && !isFirstPageValid}")
          p.help.is-danger(v-show="firstPage.length && !isFirstPageValid") instruction is too short
        .column
          p.control
            input.input(type="text" placeholder="Next" v-model="next")
          p.control
            input.input(type="text" placeholder="Finish" v-model="finish")
          p.control
            input.input(type="text" placeholder="Thank you" v-model="finished")
      p.control
        button.button.is-primary(:disabled="!canSave" @click="save") {{ action }}
</template>

<script>
import Intro from '@/model/intro.js';

/**
 * @fires save
 */
export default {
  name: 'intro-editor',

  data() {
    return {
      name: this.intro ? this.intro.name : '',
      calib: this.intro ? this.intro.calibInstruction : '',
      calibStart: this.intro ? this.intro.calibStart : '',
      calibSkip: this.intro ? this.intro.calibSkip : '',
      start: this.intro ? this.intro.startInstruction : '',
      startRun: this.intro ? this.intro.startRun : '',
      startCancel: this.intro ? this.intro.startCancel : '',
      firstPage: this.intro ? this.intro.firstPageAsText() : '',
      next: this.intro ? this.intro.next : '',
      finish: this.intro ? this.intro.finish : '',
      finished: this.intro ? this.intro.finished : '',
    };
  },

  props: {
    action: {
      type: String,
      default: 'Create',
    },
    showLabels: {
      type: Boolean,
      default: false,
    },
    nameEditable: {
      type: Boolean,
      default: true,
    },
    intro: {
      type: Intro,
      default: null,
    },
    reload: Number,
  },

  watch: {
    reload() {
      this.name = this.intro ? this.intro.name : '';
      this.calib = this.intro ? this.intro.calibInstruction : '';
      this.calibStart = this.intro ? this.intro.calibStart : '';
      this.calibSkip = this.intro ? this.intro.calibSkip : '';
      this.start = this.intro ? this.intro.startInstruction : '';
      this.startRun = this.intro ? this.intro.startRun : '';
      this.startCancel = this.intro ? this.intro.startCancel : '';
      this.firstPage = this.intro ? this.intro.firstPageAsText() : '';
      this.next = this.intro ? this.intro.next : '';
      this.finish = this.intro ? this.intro.finish : '';
      this.finished = this.intro ? this.intro.finished : '';
    },
  },

  computed: {

    /** @returns {boolean} */
    isNameValid() {
      return this.name.length > 1;
    },

    /** @returns {boolean} */
    isFirstPageValid() {
      return this.firstPage.length > 14;
    },

    /** @returns {boolean} */
    isCalibInstructionValid() {
      return this.calib.length > 4;
    },

    /** @returns {boolean} */
    isStartInstructionValid() {
      return this.start.length > 4;
    },

    /** @returns {boolean} */
    canSave() {
      return this.isNameValid && (
        this.isCalibInstructionValid ||
          this.isStartInstructionValid ||
          this.isFirstPageValid );
    },
  },

  methods: {
    /** @param {Event} e */
    save( e ) {
      this.$emit( 'save', {
        name: this.name.trim(),
        texts: {
          calibInstruction: this.calib.trim(),
          calibStart: this.calibStart.trim(),
          calibSkip: this.calibSkip.trim(),
          startInstruction: this.start.trim(),
          startRun: this.startRun.trim(),
          startCancel: this.startCancel.trim(),
          firstPage: this.firstPage.trim(),
          next: this.next.trim(),
          finish: this.finish.trim(),
          finished: this.finished.trim(),
        },
      } );
    },

  },
};
</script>

<style lang="less" scoped>
  #intro-editor {
    padding: 1em;
    text-align: left;
  }

  .low {
    min-height: 80px;
  }

  .squeezed .column {
    padding: 0;
  }

  .column {
    padding-top: 0;
    padding-bottom: 0;
  }

  .textarea {
    font-size: 15px;
    min-width: 500px;
  }
</style>
