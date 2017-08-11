<template lang="pug">
  #finished-page
    section.section
      .container
        button.button.is-large.is-primary(:class="{ 'is-loading': saving }" :disabled="saving" @click="back") {{ titleFinished }}
</template>

<script>
export default {
  name: 'finished-page',

  props: {
    saving: Boolean,
    texts: Object,
  },

  computed: {
    titleFinished() {
      return this.texts.finished || 'Thank you!';
    },
  },

  methods: {

    back( e ) {
      this.$router.replace( '../assignments' );
    },

  },
};
</script>
