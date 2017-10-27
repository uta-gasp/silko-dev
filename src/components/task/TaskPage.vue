<template lang="pug">
  #task-page

    task-text(ref="container")

    task-images(
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
import TaskText from '@/components/widgets/TaskText';
import TaskImages from '@/components/widgets/TaskImages';

import TextPresenter from '@/task/textPresenter.js';
import FeedbackProvider from '@/task/feedbackProvider.js';
import DataCollector from '@/task/dataCollector.js';

import gazeTracking from '@/utils/gazeTracking.js';

import Font from '@/model/session/font.js';

const FIX_UPDATE_INTERVAL = 25;

export default {
  name: 'task-page',

  components: {
    'task-text': TaskText,
    'task-images': TaskImages,
  },

  data() {
    return {
      textPresenter: null,
      feedbackProvider: null,
      collector: null,

      font: Font.from( TaskText.data().textStyle ),

      fixation: {
        word: null,
        duration: 0,
      },

      fixationUpdateTimer: null,
    };
  },

  props: {
    texts: Object,
    task: Object,
    student: Object,
  },

  computed: {
    hasNextPage() {
      return this.textPresenter ? this.textPresenter.hasNextPage : false;
    },

    titleNext() {
      return this.texts.next || 'Next';
    },

    titleFinish() {
      return this.texts.finish || 'Finish';
    },

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

    finish( e ) {
      this.$emit( 'finished', { longGazedWords: this.collector.longGazedWords( this.task.syllab.threshold.value ) } );
      this.collector.stop( ( err, keys ) => {
        this.$emit( 'saved', { err, keys } );
      } );

      window.clearInterval( this.fixationUpdateTimer );
      this.fixationUpdateTimer = null;
    },

    onImageShow( e ) {
      this.collector.imageShow( e );
    },

    onImageHide( e ) {
      this.collector.imageHide( e );
    },
  },

  mounted() {
    this.feedbackProvider = new FeedbackProvider( this.task.syllab, this.task.speech );
    this.feedbackProvider.init();

    const textEl = this.$refs.container.$refs.text;
    this.textPresenter = new TextPresenter( this.task, this.texts.firstPage, textEl, this.feedbackProvider.syllabifier );

    this.collector = new DataCollector( this.task, this.student, this.font, this.feedbackProvider.setup );
    this.feedbackProvider.events.addListener( 'syllabified', data => this.collector.syllabified( data ) );
    this.feedbackProvider.events.addListener( 'pronounced', data => this.collector.pronounced( data ) );

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
      this.collector.setFocusedWord( word, this.textPresenter.page );
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
      this.collector.addGazePoint( gazePoint, this.textPresenter.page );
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

    this.next();
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
