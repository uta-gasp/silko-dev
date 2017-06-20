<template lang="pug">
  #task-page
    task-text(ref="container")
    .is-bottom-right
      a.button.is-primary.is-large(v-show="hasNextPage" @click="next")
        span {{ texts.next }}
      a.button.is-primary.is-large(v-show="!hasNextPage" @click="finish")
        span {{ texts.finish }}
</template>

<script>
  import TaskText from '@/components/widgets/TaskText';

  import TextPresenter from '@/utils/textPresenter.js';
  import FeedbackProvider from '@/utils/feedbackProvider.js'
  import DataCollector from '@/utils/dataCollector.js';
  import gazeTracking from '@/utils/gazeTracking.js';

  import Font from '@/model/session/font.js';

  export default {
    name: 'task-page',

    components: {
      'task-text': TaskText,
    },

    data() {
      return {
        textPresenter: null,
        feedbackProvider: null,
        collector: null,
        font: Font.from( TaskText.data().textStyle )
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
      }
    },

    methods: {

      next( e ) {
        let wordReadingDuration;
        if (this.textPresenter.page === 0 && this.texts.firstPage) {
          wordReadingDuration = this.collector.wordReadingDuration;
        }

        this.textPresenter.nextPage();
        this.collector.nextPage();
        this.feedbackProvider.reset( wordReadingDuration );

        gazeTracking.updateTargets();
      },

      finish( e ) {
        this.$emit( 'finished' );
// return setTimeout( () => {
//   this.$emit( 'saved', { err: null, keys: { data: 'data-key', session: 'session-key' } } );
// }, 500);

        this.collector.stop( (err, keys) => {
          this.$emit( 'saved', { err, keys } );
        });
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

      gazeTracking.setCallback( 'stateUpdated', 'task-page', state => {
        if (state.isConnected && state.isTracking && !state.isBusy) {
          this.collector.start();
        }
      });
      gazeTracking.setCallback( 'wordFocused', 'task-page', word => {
        if (!this.textPresenter.isInstructionPage) {
          this.feedbackProvider.setFocusedWord( word );
        }
        this.collector.setFocusedWord( word, this.textPresenter.page );
      });
      gazeTracking.setCallback( 'wordLeft', 'task-page', word => {
        if (!this.textPresenter.isInstructionPage) {
          this.feedbackProvider.setFocusedWord( null );
        }
        this.collector.setFocusedWord( null );
      });
      gazeTracking.setCallback( 'gazePoint', 'task-page', gazePoint => {
        this.collector.addGazePoint( gazePoint, this.textPresenter.page );
      });

      this.next();
    },

    beforeDestroy() {
      this.feedbackProvider.cleanup();

      gazeTracking.clearCallback( 'stateUpdated', 'task-page');
      gazeTracking.clearCallback( 'wordFocused', 'task-page' );
      gazeTracking.clearCallback( 'wordLeft', 'task-page' );
      gazeTracking.clearCallback( 'gazePoint', 'task-page' );
    }
  };
</script>

<style lang="less" scoped>

  .is-bottom-right {
    position: fixed;
    bottom: 1em;
    right: 1em;
  }

</style>
