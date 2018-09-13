<template lang="pug">
  #modal-error.modal(:class="{ 'is-active': !!text }")
    .modal-background
    .modal-content
      .notification.is-danger
        .heading.has-text-centered {{ tokens[ 'title' ] }}
        .has-text-centered {{ text }}
    button.modal-close(@click="close")
</template>

<script>
import { i10n } from '@/utils/i10n.js';

/**
 * @fires close
 */
export default {
  name: 'assignments',

  data() {
    return {
      tokens: i10n( 'modal_error' ),
    };
  },

  props: {
    text: {
      type: String,
      default: '',
    },
  },

  methods: {
    /** @param {Event} e */
    close( e ) {
      this.$emit( 'close' );
    },
  },

  watch: {
    text( value ) {
      if ( value ) {
        console.error( 'MODAL_ERROR:', value );
      }
    },
  },
};
</script>
