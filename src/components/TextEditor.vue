<template lang="pug">
  #text-editor
    .field
      label.label(v-show="showLabels") Name
      p.control
        input.input(type="text" placeholder="Name" :disabled="!nameEditable" v-model="name")
      div(v-show="!isIntro")
        label.label(v-show="showLabels") Introduction
        p.control
          span.select
            select(v-model="intro")
              option(value="") none
              option(v-for="item in intros" :value="item.id") {{item.name}}
      label.label(v-show="showLabels") Text
      p.control
        textarea.textarea(placeholder="Text" v-model="text")
      div(v-show="!isIntro")
        label.label Syllabification
        .level
          .level-item
            p.control
              span.select
                select(v-model="textLang")
                  option(value="" selected) none
                  option(value="Finnish") Finnish
          .level-item
            p.control
              label.checkbox(:disabled="!areToolsEnabled")
                input(type="checkbox" v-model="speech" :disabled="!areToolsEnabled")
                span Speech
        label.label Exceptions for syllabification
        i Use the pattern as shown in this example: kaupunki=kau pun ki
        p.control
          textarea.textarea(:disabled="!areToolsEnabled" placeholder="Syllabifications" v-model="syllabs")
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
        textLang: this.srcLang || '',
        syllabs: this.srcSyllabs || '',
        speech: this.srcSpeech || false,
      };
    },

    props: {
      isIntro: {
        type: Boolean,
        default: false
      },
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
      isMultipaged: {
        type: Boolean,
        default: true
      },
      intros: {
        type: Array,
        default: () => []
      },
      srcIntro: {
        type: String,
        default: ''
      },
      srcLang: {
        type: String,
        default: ''
      },
      srcSyllabs: {
        type: String,
        default: ''
      },
      srcSpeech: {
        type: Boolean,
        default: false
      },
      reload: Number
    },

    watch: {
      reload() {
        this.name = this.srcName || '';
        this.text = this.srcText || '';
      }
    },

    computed: {

      isNameValid() {
        return this.name.length > 1;
      },

      isTextValid() {
        return this.text.length > 14;
      },

      areToolsEnabled() {
        return this.textLang.length > 0;
      },

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
          lang: this.textLang,
          syllabExceptions: this.syllabs,
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
