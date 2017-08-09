<template lang="pug">
  #finished-page
    section.section
      .container
        button.button.is-large.is-primary(:class="{ 'is-loading': saving }" :disabled="saving" @click="back") {{ texts.finished }}
</template>

<script>
export default {
  name: 'finished-page',

  props: {
    saving: Boolean,
    texts: Object,
  },

  methods: {

    back( e ) {
      this.$router.replace( '../assignments' );
    },

  },
};
</script>
