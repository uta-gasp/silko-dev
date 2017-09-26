<template lang="pug">
  #remove-warning
    .modal.is-active
      .modal-background
      .modal-content
        article.message.is-danger
          .message-header
            p Deleting {{ object }}.
            button.delete(@click="reject")
          .message-body
            .level
              .level-item
                span
                  span The {{ object }} "{{ name }}" will be deleted permanently.&nbsp;
                  slot
                  span Continue?
            .level
              .level-item
                button.button.is-danger(@click="confirm") OK
                button.button(@click="reject") Cancel
  //- #modal-error.modal(:class="{ 'is-active': !!text }")
  //-   .modal-background
  //-   .modal-card
  //-     header.modal-card-head
  //-       p.modal-card-title {{ title }}
  //-       button.delete(@click="cancel")
  //-     section.modal-card-body.is-paddingless
  //-       .notification.is-danger
  //-         .has-text-centered {{ text }}
  //-     footer.modal-card-foot
  //-       .centered
  //-         a.button.is-danger(@click="deleteSession") Yes
  //-         a.button(@click="cancel") No
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

  // .centered {
  //   width: 100%;
  //   margin: 0 auto
  // }
</style>
