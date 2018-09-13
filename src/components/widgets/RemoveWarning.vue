<template lang="pug">
  #remove-warning
    .modal.is-active
      .modal-background
      .modal-content
        article.message.is-danger
          .message-header
            p {{ tokens[ 'header' ]( object ) }}.
            button.delete(@click="reject")
          .message-body
            .level
              .level-item
                span
                  span {{ tokens[ 'warning' ]( object, name ) }}.&nbsp;
                  slot
                  span {{ tokens[ 'continue' ] }}
            .level
              .level-item
                button.button.is-danger(@click="confirm") {{ tokens[ 'ok' ] }}
                button.button(@click="reject") {{ tokens[ 'cancel' ] }}
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
import { i10n } from '@/utils/i10n.js';

/**
 * @fires close
 */
export default {
  name: 'remove-warning',

  data() {
    return {
      tokens: i10n( 'remove_warning', '_buttons' ),
    };
  },

  props: {
    object: String,
    name: String,
    data: Object,
  },

  methods: {
    /** @param {Event} e */
    reject( e ) {
      this.$emit( 'close', { confirm: false, data: this.data } );
    },

    /** @param {Event} e */
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

  .level-item {
    flex-shrink: 1;    
  }

  // .centered {
  //   width: 100%;
  //   margin: 0 auto
  // }
</style>
