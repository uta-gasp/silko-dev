<template lang="pug">
  #remove-warning
    .modal.is-active
      .modal-background
      .modal-content
        article.message.is-danger
          .message-header
            p Deleting the {{ object }}.
            button.delete(@click="reject")
          .message-body
            .level
              .level-item The {{ object }} "{{ name }}" will be deleted permanently. Continue?
            .level
              .level-item
                button.button.is-danger(@click="confirm") OK
                button.button(@click="reject") Cancel
</template>

<script>
export default {
  name: 'remove-warning',

  data() {
    return {
    };
  },

  props: {
    object: String,
    name: String,
    data: Object,
  },

  methods: {

    reject( e ) {
      this.$emit( 'close', { confirm: false, data: this.data } );
    },

    confirm( e ) {
      this.$emit( 'close', { confirm: true, data: this.data } );
    },

  },
};
</script>

<style lang="less" scoped>
  .button {
    margin-left: 0.5em;
    min-width: 5em;
  }
</style>
