<template lang="pug">
  #task-preview
    .notification.is-info.has-text-centered.on-top
      .columns
        .column(v-if="task.syllab.language") Ctrl + click on a word to syllabify it.
        .column(v-if="task.syllab.language")
          button.button.is-primary.is-small(@click="syllabifyAll") Syllabify all
        .column(v-if="task.speech.language") Alt + click on a word to pronounce it.

    task-text(ref="container"
      @click.native.ctrl="syllabify"
      @click.native.alt="pronounce"
      @click.native="fixate")

    task-images(
      :images="images"
      :fixation="fixation")

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
import TaskText from '@/components/widgets/TaskText.vue';
import TaskImages from '@/components/widgets/TaskImages.vue';

import TextPresenter from '@/task/textPresenter.js';
import FeedbackProvider from '@/task/feedbackProvider.js';

// ts-check-only
import { TextPageImage } from '@/model/task/textPageImage.js';

/**
 * @fires close
 */
export default {
  name: 'task-preview',

  components: {
    'task-text': TaskText,
    'task-images': TaskImages,
  },

  data() {
    return {
      /** @type {TextPresenter} */
      textPresenter: null,
      /** @type {FeedbackProvider} */
      feedbackProvider: null,
      fixatedWord: '',
    };
  },

  props: {
    firstPage: {
      type: Array,
      default: null,
    },
    task: {
      type: Object,
    },
  },

  computed: {

    /** @returns {boolean} */
    hasNextPage() {
      return this.textPresenter ? this.textPresenter.hasNextPage : false;
    },

    /** @returns {boolean} */
    hasPrevPage() {
      return this.textPresenter ? this.textPresenter.hasPrevPage : false;
    },

    /** @returns {TextPageImage[]} */
    images() {
      if ( !this.textPresenter ) {
        return [];
      }

      const pageIndex = this.textPresenter.originalPageIndex;
      if ( pageIndex < 0 ) {
        return [];
      }

      return this.task.pages[ pageIndex ].images;
    },

    /** @returns {{word: string, duration: number}} */
    fixation() {
      return { word: this.fixatedWord, duration: 999999 };
    },
  },

  methods: {

    syllabifyAll( e ) {
      this.textPresenter.words.forEach( ( text, el ) => {
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

    /** @param {Event} e */
    syllabify( e ) {
      if ( e.target.classList.contains( 'word' ) ) {
        const text = this.feedbackProvider.syllabifier.unprepare( e.target.textContent );
        if ( text ) {
          this.feedbackProvider.syllabifier.syllabifyElementText( e.target, text );
        }
      }
    },

    /** @param {Event} e */
    pronounce( e ) {
      if ( e.target.classList.contains( 'word' ) ) {
        const text = this.feedbackProvider.syllabifier.unprepare( e.target.textContent );
        if ( text ) {
          this.feedbackProvider.speaker.say( text );
        }
      }
    },

    /** @param {Event} e */
    fixate( e ) {
      if ( e.target.classList.contains( 'word' ) ) {
        const text = this.feedbackProvider.syllabifier.unprepare( e.target.textContent );
        if ( text ) {
          this.fixatedWord = text;
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
