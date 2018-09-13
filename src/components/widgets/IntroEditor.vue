<template lang="pug">
  #intro-editor
    .field(:class="{ squeezed: showLabels }")
      label.label(v-show="showLabels") {{ tokens[ 'name' ] }}
      p.control
        input.input(
          type="text" 
          :placeholder="tokens[ 'name' ]" 
          :disabled="!nameEditable" 
          v-model="name" 
          :class="{'is-danger': name.length && !isNameValid}")
      p.help.is-danger(v-show="name.length && !isNameValid") {{ tokens[ 'name_invalid' ] }}

      p.control(v-show="showLabels")
        label.label {{ tokens[ 'hdr_texts' ] }}

      p.control
        textarea.textarea.low(:placeholder="tokens[ 'ph_calib_inst' ]" v-model="calib" :class="{'is-danger': !isCalibInstructionValid}")
      p.help.is-danger(v-show="!isCalibInstructionValid") {{ tokens[ 'msg_instruction_invalid' ] }}

      p.control
        textarea.textarea.low(:placeholder="tokens[ 'ph_start_inst' ]" v-model="start" :class="{'is-danger': !isStartInstructionValid}")
      p.help.is-danger(v-show="!isStartInstructionValid") {{ tokens[ 'msg_instruction_invalid' ] }}

      p.control
        textarea.textarea(:placeholder="tokens[ 'ph_first_page' ]" v-model="firstPage" :class="{'is-danger': !isFirstPageValid}")
      p.help.is-danger(v-show="!isFirstPageValid") {{ tokens[ 'msg_instruction_invalid' ] }}

      p.control
        button.button.is-primary(:disabled="!canSave" @click="save") {{ action }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import { i10n } from '@/utils/i10n.js';

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
      start: this.intro ? this.intro.startInstruction : '',
      firstPage: this.intro ? this.intro.firstPageAsText() : '',

      tokens: i10n( 'instruction_editor', '_form' ),
    };
  },

  props: {
    action: {
      type: String,
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
      this.start = this.intro ? this.intro.startInstruction : '';
      this.firstPage = this.intro ? this.intro.firstPageAsText() : '';
    },
  },

  computed: {

    /** @returns {boolean} */
    isNameValid() {
      return this.name.length > 1;
    },

    /** @returns {boolean} */
    isFirstPageValid() {
      return !this.firstPage.length || this.firstPage.length > 14;
    },

    /** @returns {boolean} */
    isCalibInstructionValid() {
      return !this.calib.length || this.calib.length > 4;
    },

    /** @returns {boolean} */
    isStartInstructionValid() {
      return !this.start.length || this.start.length > 4;
    },

    /** @returns {boolean} */
    hasAnyInstuction() {
      return this.firstPage.length || this.calib.length || this.start.length;
    },

    /** @returns {boolean} */
    canSave() {
      return this.isNameValid &&
        this.isCalibInstructionValid &&
          this.isStartInstructionValid &&
          this.isFirstPageValid &&
          this.hasAnyInstuction;
    },
  },

  methods: {
    /** @param {Event} e */
    save( e ) {
      this.$emit( 'save', {
        name: this.name.trim(),
        texts: {
          calibInstruction: this.calib.trim(),
          startInstruction: this.start.trim(),
          firstPage: this.firstPage.trim(),
        },
      } );
    },
  },

  created() {
    eventBus.$on( 'lang', () => {
      this.tokens = i10n( 'instruction_editor', '_form' );
    } );
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
