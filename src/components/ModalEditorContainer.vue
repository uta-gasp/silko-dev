<template lang="pug">
  .modal.is-active
    .modal-background
    .modal-content
      .container
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