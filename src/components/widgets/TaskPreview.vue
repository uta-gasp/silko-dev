<template lang="pug">
  #task-preview
    .notification.is-info.has-text-centered.on-top
      .columns
        .column(v-if="task.syllab.language") Ctrl + click on a word to syllabify it.
        .column(v-if="task.syllab.language")
          button.button.is-primary.is-small(@click="syllabifyAll") Syllabify all
        .column(v-if="task.speech.language") Alt + click on a word to pronounce it.
    task-text(ref="container" @click.native.ctrl="syllabify" @click.native.alt="pronounce")
    .columns.at-bottom
      .column.has-text-right
        button.button.is-primary(:disabled="!hasPrevPage" @click="prev")
          span &lt;
      .column.has-text-centered.is-narrow
        button.button.is-primary(@click="close")
          span Close
      .column.has-text-left
        button.button.is-primary(:disabled="!hasNextPage" @click="next")
          span &gt;
</template>

<script>
import TaskText from '@/components/widgets/TaskText';

import TextPresenter from '@/utils/textPresenter.js';
import FeedbackProvider from '@/utils/feedbackProvider.js';

export default {
  name: 'task-preview',

  components: {
    'task-text': TaskText,
  },

  data() {
    return {
      textPresenter: null,
      feedbackProvider: null,
    };
  },

  props: {
    firstPage: {
      type: String,
      default: '',
    },
    task: {
      type: Object,
    },
  },

  computed: {

    hasNextPage() {
      return this.textPresenter ? this.textPresenter.hasNextPage : false;
    },

    hasPrevPage() {
      return this.textPresenter ? this.textPresenter.hasPrevPage : false;
    },
  },

  methods: {

    syllabifyAll( e ) {
      this.textPresenter.words.forEach( ( text, el ) => {
        // console.log('--', text)
        this.feedbackProvider.syllabifier.syllabifyElementText( el, text );
      } );
    },

    next( e ) {
      this.textPresenter.nextPage();
      this.feedbackProvider.reset();
    },

    prev( e ) {
      this.textPresenter.prevPage();
      this.feedbackProvider.reset();
    },

    close( e ) {
      this.$emit( 'close' );
    },

    syllabify( e ) {
      if ( e.target.classList.contains( 'word' ) ) {
        const text = this.feedbackProvider.syllabifier.unprepare( e.target.textContent );
        if ( text ) {
          this.feedbackProvider.syllabifier.syllabifyElementText( e.target, text );
        }
      }
    },

    pronounce( e ) {
      if ( e.target.classList.contains( 'word' ) ) {
        const text = this.feedbackProvider.syllabifier.unprepare( e.target.textContent );
        if ( text ) {
          this.feedbackProvider.speaker.say( text );
        }
      }
    },
  },

  mounted() {
    this.feedbackProvider = new FeedbackProvider( this.task.syllab, this.task.speech );
    this.feedbackProvider.init();

    const textEl = this.$refs.container.$refs.text;
    this.textPresenter = new TextPresenter( this.task, this.firstPage, textEl, this.feedbackProvider.syllabifier );

    this.next();
  },

  beforeDestroy() {
    this.feedbackProvider.cleanup();
  },
};
</script>

<style lang="less" scoped>
  .on-top {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }

  .at-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
