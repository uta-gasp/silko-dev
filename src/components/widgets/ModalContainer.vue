<template lang="pug">
  .modal.is-active
    .modal-background
    .modal-content
      .notification
        .heading.has-text-centered
          h1 {{ title }}
        slot
    button.modal-close(@click="close")
</template>

<script>
export default {
  name: 'modal-container',

  data() {
    return {
    };
  },

  props: {
    title: {
      type: String,
      default: 'Editor',
    },
  },

  methods: {

    close( e ) {
      this.$emit( 'close', { cancelled: true } );
    },

  },

  mounted() {
    this.$emit( 'mounted' );
  }
};
</script>

<style lang="less" scoped>

  .heading {
    margin-bottom: 1em;
  }

  .modal-content {
    width: auto;
  }

  .notification {
    padding-right: 1.5rem;
  }

</style>
