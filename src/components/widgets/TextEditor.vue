<template lang="pug">
  #text-editor
    .field
      .columns
        .column
          label.label(v-show="showLabels") Name
          p.control
            input.input(type="text" placeholder="Name" :disabled="!nameEditable" v-model="name")
        .column
          label.label(v-show="showLabels") Introduction
          p.control
            span.select
              select(v-model="intro")
                option(value="") none
                option(v-for="item in intros" :value="item.id") {{item.name}}
      label.label(v-show="showLabels") Text
      p.control
        textarea.textarea(placeholder="Text" v-model="text")
      .columns
        .column
          label.label Syllabification
          p.control
            span.select
              select(v-model="syllab")
                option(value="" selected) none
                option(value="Finnish") Finnish
        .column
          label.label Speech
          p.control
            span.select
              select(v-model="speech")
                option(value="" selected) none
                option(value="Finnish") Finnish
      label.label Syllabification exceptions
      i Example: kaupunki=kau pun ki
      p.control
        textarea.textarea(:disabled="!syllab" placeholder="Syllabifications" v-model="syllabExceps")
      p.control
        a.button.is-primary(:disabled="!canSave" @click="save()") {{action}}
</template>

<script>
  export default {
    name: 'text-editor',

    data() {
      return {
        name: this.srcName || '',
        text: this.srcText || '',
        intro: this.srcIntro || '',
        syllab: this.srcSyllab || '',
        syllabExceps: this.srcSyllabExceps || '',
        speech: this.srcSpeech || '',
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
      srcName: {
        type: String,
        default: ''
      },
      srcText: {
        type: String,
        default: ''
      },
      intros: {
        type: Array,
        default: () => []
      },
      srcIntro: {
        type: String,
        default: ''
      },
      srcSyllab: {
        type: String,
        default: ''
      },
      srcSyllabExceps: {
        type: String,
        default: ''
      },
      srcSpeech: {
        type: String,
        default: ''
      },
      reload: Number
    },

    watch: {
      reload() {
        this.name = this.srcName || '';
        this.text = this.srcText || '';
        this.intro = this.srcIntro || '';
        this.syllabs = this.srcSyllab || '';
        this.syllabExceps = this.srcSyllabExceps || '';
        this.speech = this.srcSpeech || '';
      }
    },

    computed: {

      isNameValid() {
        return this.name.length > 1;
      },

      isTextValid() {
        return this.text.length > 14;
      },

      // areToolsEnabled() {
      //   return this.textLang.length > 0;
      // },

      canSave() {
        return this.isNameValid &&
          this.isTextValid;
      },
    },

    methods: {

      save() {
        this.$emit( 'save', {
          name: this.name.trim(),
          text: this.text,
          intro: this.intro,
          syllab: this.syllab,
          syllabExceptions: this.syllabExceps,
          speech: this.speech,
        });
      }
    }
  }
</script>

<style lang="less" scoped>
  #text-editor {
    padding: 1em;
    text-align: left;
  }

  select:invalid {
    color: #999;
  }

  select {
    padding-left: 5px;
  }

  option {
    color: #222;
  }
</style>
