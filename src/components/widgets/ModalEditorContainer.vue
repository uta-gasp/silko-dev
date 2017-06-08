<template lang="pug">
  .modal.is-active
    .modal-background
    .modal-content
      .notification
        .heading.has-text-centered
          h1 {{title}}
        slot
    button.modal-close(@click="onClose()")
</template>

<script>
  export default {
    name: 'modal-editor-container',

    data() {
      return {
      };
    },

    props: {
      title: {
        type: String,
        default: 'Editor'
      }
    },

    methods: {
      onClose() {
        this.$emit( 'close' );
      }
    }
  };
</script>

<style lang="less" scoped>
  .heading {
    margin-bottom: 1em;
  }

  .modal-content {
    width: 70%;
  }
</style>