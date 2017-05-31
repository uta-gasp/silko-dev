<template lang="pug">
  #intro-editor
    .field
      label.label(v-show="showLabels") Name
      p.control
        input.input(type="text" placeholder="Name" :disabled="!nameEditable" v-model="name")
      label.label(v-show="showLabels") Texts
      p.control
        textarea.textarea.low(placeholder="Calibration instruction" v-model="calib")
      p.control
        textarea.textarea.low(placeholder="Start instruction" v-model="start")
      p.control
        textarea.textarea(placeholder="First page" v-model="firstPage")
      p.control
        a.button.is-primary(:disabled="!canSave" @click="save()") {{action}}
</template>

<script>
  export default {
    name: 'intro-editor',

    data() {
      return {
        name: this.intro ? this.intro.name : '',
        calib: this.intro ? this.intro.calibInstruction : '',
        start: this.intro ? this.intro.startInstruction : '',
        firstPage: this.intro ? this.intro.firstPageAsText() : '',
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
      nameEditable: {
        type: Boolean,
        default: true
      },
      intro: {
        type: Object,
        default: null
      },
      reload: Number
    },

    watch: {
      reload() {
        this.name = this.intro ? this.intro.name : '';
        this.calib = this.intro ? this.intro.calibInstruction : '';
        this.start = this.intro ? this.intro.startInstruction : '';
        this.firstPage = this.intro ? this.intro.firstPageAsText() : '';
      }
    },

    computed: {

      isNameValid() {
        return this.name.length > 1;
      },

      isFirstPageValid() {
        return this.firstPage.length > 14;
      },

      isCalibInstructionValid() {
        return this.calib.length > 4;
      },

      isStartInstructionValid() {
        return this.start.length > 4;
      },

      canSave() {
        return this.isNameValid && (
          this.isCalibInstructionValid ||
          this.isStartInstructionValid ||
          this.isFirstPageValid);
      },
    },

    methods: {

      save() {
        this.$emit( 'save', {
          name: this.name.trim(),
          texts: {
            calibInstruction: this.calib.trim(),
            startInstruction: this.start.trim(),
            firstPage: this.firstPage.trim(),
          }
        });
      }
    }
  }
</script>

<style lang="less" scoped>
  #intro-editor {
    padding: 1em;
    text-align: left;
  }

  .low {
    min-height: 60px;
  }
</style>
