<template lang="pug">
  #modal-error.modal(:class="{ 'is-active': !!text }")
      .modal-background
      .modal-content
        .notification.is-danger
          .heading.has-text-centered Assignment error
          .has-text-centered {{text}}
      button.modal-close(@click="close")
</template>

<script>
  export default {
    name: 'assignments',

    data() {
      return {
      };
    },

    props: {
      text: {
        type: String,
        default: ''
      }
    },

    methods: {
      close() {
        this.$emit('close');
      }
    }
  };
</script>