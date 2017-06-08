<template lang="pug">
  #task-page
    .text.median(ref="text")
    .is-bottom-right
      a.button.is-primary.is-large(v-show="hasNextPage" @click="next()")
        span {{ texts.next }}
      a.button.is-primary.is-large(v-show="!hasNextPage" @click="finish()")
        span {{ texts.finish }}
</template>

<script>
  import TextPresenter from '@/utils/textPresenter.js';
  import FeedbackProvider from '@/utils/feedbackProvider.js'
  import DataCollector from '@/utils/dataCollector.js';
  import gazeTracking from '@/utils/gazeTracking.js';

  import Font from '@/model/session/font.js';

  export default {
    name: 'task-page',

    data() {
      return {
        textPresenter: null,
        feedbackProvider: null,
        collector: null,
        font: new Font( 'Calibri', '20pt', 'normal', 'bold' ) // should match the style defined below
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

      next() {
        let wordReadingDuration;
        if (this.textPresenter.page === 0 && this.texts.firstPage) {
          wordReadingDuration = this.collector.wordReadingDuration;
          console.log( wordReadingDuration );
        }

        this.textPresenter.nextPage();
        this.collector.nextPage();
        this.feedbackProvider.reset( wordReadingDuration );

        gazeTracking.updateTargets();
      },

      finish() {
        this.$emit( 'finished' );
        this.collector.stop( (err, session) => {
          this.$emit( 'saved', { err, session } );
        });
      },
    },

    mounted() {
      this.feedbackProvider = new FeedbackProvider( this.task.syllab, this.task.speech );
      this.feedbackProvider.init();

      this.textPresenter = new TextPresenter( this.task, this.texts.firstPage, this.$refs.text, this.feedbackProvider.syllabifier );

      this.collector = new DataCollector( this.task, this.student, this.font, this.feedbackProvider.setup );
      this.feedbackProvider.events.addListener( 'syllabified', data => this.collector.syllabified( data ) );
      this.feedbackProvider.events.addListener( 'pronounced', data => this.collector.pronounced( data ) );

      gazeTracking.setCallback( 'stateUpdated', 'task-page', state => {
        if (state.isConnected && state.isTracking && !state.isBusy) {
          this.collector.start();
        }
      });
      gazeTracking.setCallback( 'wordFocused', 'task-page', word => {
        this.feedbackProvider.setFocusedWord( word );
        this.collector.setFocusedWord( word, this.textPresenter.page );
      });
      gazeTracking.setCallback( 'wordLeft', 'task-page', word => {
        this.feedbackProvider.setFocusedWord( null );
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

  @fontColor: #775;
  @backColor: #fff;
  @margin: 15;

  #task-page {
    position: relative;
    height: unit(100 - 2 * @margin, vh);
    margin: unit(@margin, vh) unit(@margin, vw);
    background-color: @backColor;
  }

  .text {
    color: @fontColor;
    font-size: 20pt;
    font-family: Calibri, Arial, sans-serif;
    font-weight: bold;

    width: 100%;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);

    text-align: center;

    &.alignLeft {
      text-align: left;
    }

    &.x-large {
      line-height: (100vh - 2 * unit(@margin, vh)) / 4;
    }
    &.large {
      line-height: (100vh - 2 * unit(@margin, vh)) / 5;
    }
    &.median {
      line-height: (100vh - 2 * unit(@margin, vh)) / 6;
    }
    &.small {
      line-height: (100vh - 2 * unit(@margin, vh)) / 7;
    }
    &.x-small {
      line-height: (100vh - 2 * unit(@margin, vh)) / 8;
    }

    // &:hover .word {
    //   outline: 2px solid #ccf;
    // }
  }
</style>

<style lang="less">
  @fontColor: #775;
  @backColor: #fff;

  .line {
    display: block;

    &.h1 {
        color: #5e2095;
    }

    &.h2 {
        color: #0e6095;
    }

    &.authors {
        color: lighten(@fontColor, 25%);
    }

    // custom styles

    .b {
      color: #000;
    }

    .n {
      color: #008;
    }

    .g {
      color: #ccc;
    }
  }

  .currentWord {
    color: #c00;
  }

  .word {
    /* nothing is needed, just the class declaration */
  }

  .hyphens {
    color: @backColor;
  }

  .hyphen {
    color: #ffa0a0;
  }

  .bold {
    color: black;
  }

</style>