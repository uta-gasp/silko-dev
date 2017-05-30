<template lang="pug">
  #intro-editor
    .field
      label.label(v-show="showLabels") Name
      p.control
        input.input(type="text" placeholder="Name" :disabled="!nameEditable" v-model="name")
      label.label(v-show="showLabels") Text
      p.control
        textarea.textarea(placeholder="Text" v-model="text")
      a.button.is-primary(:disabled="!canSave" @click="save()") {{action}}
</template>

<script>
  export default {
    name: 'text-editor',

    data() {
      return {
        name: this.srcName || '',
        text: this.srcText || '',
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
</style>
