<template lang="pug">
  #remove-warning
    .modal.is-active
      .modal-background
      .modal-content
        article.message.is-danger
          .message-header
            .level
              .level-left
                .level-item Deleting the {{object}}.
              .level-right
                .level-item
                  button.delete(@click="reject()")
          .message-body.container
            p The {{object}} "{{name}}" will be deleted permanently. Continue?
            p.panel-tabs
              button.button.is-danger(@click="confirm()") OK
              button.button(@click="reject()") Cancel
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
    data: Object
  },
  methods: {

    reject() {
      this.$emit( 'close', false, this.data );
    },

    confirm() {
      this.$emit( 'close', true, this.data );
    },
  }
};
</script>

<style lang="less" scoped>
  .button {
    margin-left: 0.5em;
    min-width: 5em;
  }
</style>