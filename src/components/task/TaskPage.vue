<template lang="pug">
  #task-page

    task-text(ref="container")

    task-images(
      v-if="images"
      :images="images"
      :fixation="fixation"
      @show="onImageShow"
      @hide="onImageHide")

    .is-bottom-right
      a.button.is-primary.is-large(v-show="hasNextPage" @click="next")
        span {{ titleNext }}
      a.button.is-primary.is-large(v-show="!hasNextPage" @click="finish")
        span {{ titleFinish }}

</template>

<script>
import TaskText from '@/components/widgets/TaskText.vue';
import TaskImages from '@/components/widgets/TaskImages.vue';

import Intro from '@/model/intro.js';
import Task from '@/model/task.js';
import Student from '@/model/student.js';

import TextPresenter from '@/task/textPresenter.js';
import FeedbackProvider from '@/task/feedbackProvider.js';
import DataCollector from '@/task/dataCollector.js';

import gazeTracking from '@/utils/gazeTracking.js';

import Font from '@/model/session/font.js';

// ts-check-only
import DataImage from '@/model/data/image.js';
import { TextPageImage } from '@/model/task/textPageImage.js';
import Vue from 'vue';

const FIX_UPDATE_INTERVAL = 25;

/**
 * @fires finished
 * @fires saved
 */
export default {
  name: 'task-page',

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
      /** @type {DataCollector} */
      collector: null,

      font: Font.from( TaskText.data().textStyle ),

      fixation: {
        word: null,
        duration: 0,
      },

      fixationUpdateTimer: 0,
    };
  },

  props: {
    texts: {
      type: Intro,
      required: true,
    },
    task: {
      type: Task,
      required: true,
    },
    student: {
      type: Student,
      required: true,
    },
  },

  computed: {
    /** @returns {boolean} */
    hasNextPage() {
      return this.textPresenter ? this.textPresenter.hasNextPage : false;
    },

    /** @returns {string} */
    titleNext() {
      return this.texts.next || 'Next';
    },

    /** @returns {string} */
    titleFinish() {
      return this.texts.finish || 'Finish';
    },

    /** @returns {TextPageImage[]} */
    images() {
      if ( !this.textPresenter ) {
        return [];
      }

      if ( this.textPresenter.isInstructionPage ) {
        return [];
      }

      return this.task.pages[ this.textPresenter.page ].images;
    },
  },

  methods: {
    /** @param {Event} e */
    next( e ) {
      let wordReadingDuration;
      if ( this.textPresenter.page === 0 && this.texts.firstPage && this.texts.firstPage.length ) {
        wordReadingDuration = this.collector.wordReadingDuration;
      }

      this.textPresenter.nextPage();
      this.collector.nextPage();
      this.feedbackProvider.reset( wordReadingDuration );

      gazeTracking.updateTargets();
    },

    /** @param {Event} e */
    finish( e ) {
      this.$emit( 'finished', { longGazedWords: this.collector.longGazedWords( this.task.syllab.threshold.value ) } );
      this.collector.stop( /** @param {Error} err; @param {{data: string, session: string}} keys */( err, keys ) => {
        this.$emit( 'saved', { err, keys } );
      } );

      window.clearInterval( this.fixationUpdateTimer );
      this.fixationUpdateTimer = 0;
    },

    /** @param {{image: TextPageImage}} e */
    onImageShow( e ) {
      this.collector.imageShow( e.image );
    },

    /** @param {{image: TextPageImage}} e */
    onImageHide( e ) {
      this.collector.imageHide( e.image );
    },
  },

  mounted() {
    this.feedbackProvider = new FeedbackProvider( this.task.syllab, this.task.speech );
    this.feedbackProvider.init();

    const textEl = /** @type {Vue} */ (this.$refs.container).$refs.text;
    this.textPresenter = new TextPresenter( this.task, this.texts.firstPage, /** @type {HTMLElement}*/ (textEl), this.feedbackProvider.syllabifier );

    this.collector = new DataCollector( this.task, this.student, this.font, this.feedbackProvider.setup );
    this.feedbackProvider.events.addListener( 'syllabified', /** @param {HTMLElement} el */ el => this.collector.syllabified( el ) );
    this.feedbackProvider.events.addListener( 'pronounced', /** @param {HTMLElement} el */ el => this.collector.pronounced( el ) );

    //     gazeTracking.setCallback( 'stateUpdated', 'task-page', state => {
    //       if ( state.isConnected && state.isTracking && !state.isBusy ) {
    //         this.collector.start();
    //       }
    //     } );

    gazeTracking.setCallback( 'wordFocused', 'task-page', word => {
      let wordText = null;
      if ( !this.textPresenter.isInstructionPage ) {
        wordText = this.feedbackProvider.setFocusedWord( word );
      }
      this.collector.setFocusedWord( word );
      this.fixation = { word: wordText, duration: 0 };
    } );

    gazeTracking.setCallback( 'wordLeft', 'task-page', _ => {
      if ( !this.textPresenter.isInstructionPage ) {
        this.feedbackProvider.setFocusedWord( null );
      }
      this.collector.setFocusedWord( null );
      this.fixation = { word: null, duration: 0 };
    } );

    gazeTracking.setCallback( 'gazePoint', 'task-page', gazePoint => {
      this.collector.addGazePoint( gazePoint );
    } );

    this.collector.start();
    this.fixationUpdateTimer = window.setInterval( () => {
      const word = this.collector.focusedWord;
      if ( !word ) {
        if ( this.fixation.word ) {
          this.fixation = { word: null, duration: 0 };
        }
      }
      else {
        this.fixation = { word: this.fixation.word, duration: word.duration };
      }
    }, FIX_UPDATE_INTERVAL );

    this.next( null );
  },

  beforeDestroy() {
    this.feedbackProvider.cleanup();

    gazeTracking.clearCallback( 'stateUpdated', 'task-page' );
    gazeTracking.clearCallback( 'wordFocused', 'task-page' );
    gazeTracking.clearCallback( 'wordLeft', 'task-page' );
    gazeTracking.clearCallback( 'gazePoint', 'task-page' );
  },
};
</script>

<style lang="less" scoped>

  .is-bottom-right {
    position: fixed;
    bottom: 1em;
    right: 1em;
  }

</style>
