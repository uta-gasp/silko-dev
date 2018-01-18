<template lang="pug">
  #finished-page
    section.section
      .container
        button.button.is-large.is-primary(:class="{ 'is-loading': saving }" :disabled="saving" @click="back") {{ titleFinished }}
</template>

<script>
import Intro from '@/model/intro.js';

export default {
  name: 'finished-page',

  props: {
    saving: Boolean,
    texts: Intro,
  },

  computed: {
    /** @returns {string} */
    titleFinished() {
      return this.texts.finished || 'Thank you!';
    },
  },

  methods: {
    /** @param {Event} e */
    back( e ) {
      this.$router.replace( '../assignments' );
    },

  },
};
</script>
