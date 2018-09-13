<template lang="pug">
  #finished-page
    section.section
      .container
        button.button.is-large.is-primary(:class="{ 'is-loading': saving }" :disabled="saving" @click="back") {{ tokens[ 'btn_thanks' ] }}
</template>

<script>
import { i10n } from '@/utils/i10n.js';

import Intro from '@/model/intro.js';

export default {
  name: 'finished-page',

  data() {
    return {
      tokens: i10n( 'assignment' ),
    }
  },

  props: {
    saving: Boolean,
    texts: Intro,
  },

  methods: {
    /** @param {Event} e */
    back( e ) {
      this.$router.replace( '../assignments' );
    },

  },
};
</script>
