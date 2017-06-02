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
  import Syllabifier from '@/utils/syllabifier.js'
  import DataCollector from '@/utils/dataCollector.js';
  import gazeTracking from '@/utils/gazeTracking.js';

  export default {
    name: 'task-page',

    data() {
      return {
        textPresenter: null,
        syllabifier: null,
        collector: null,
      };
    },

    props: {
      texts: Object,
      task: Object
    },

    computed: {
      hasNextPage() {
        return this.textPresenter ? this.textPresenter.hasNextPage : false;
      }
    },

    methods: {

      next() {
        this.textPresenter.nextPage();
        this.syllabifier.reset( this.textPresenter.page === 1 && this.texts.firstPage );
        gazeTracking.updateTargets();
      },

      finish() {
        this.$emit( 'finished' );
        this.collector.save( err => {
          this.$emit( 'saved', { err } );
        });
      },
    },

    mounted() {
      this.syllabifier = new Syllabifier( this.task.syllabExceptions, {
          syllabification: this.task.syllab,
          syllabificationSmart: true,
          speech: this.task.speech
      });

      this.syllabifier.init();

      this.textPresenter = new TextPresenter( this.task, this.texts.firstPage, this.$refs.text, this.syllabifier );

      this.collector = new DataCollector();
      this.syllabifier.events.addListener( 'syllabified', data => this.collector.syllabified( data ) );
      this.syllabifier.events.addListener( 'pronounced', data => this.collector.pronounced( data ) );

      gazeTracking.setCallback( 'stateUpdated', 'task-page', state => {
        if (state.isConnected && state.isTracking && !state.isBusy) {
          this.collector.start();
        }
      });
      gazeTracking.setCallback( 'wordFocused', 'task-page', word => {
          this.syllabifier.setFocusedWord( word );
          this.collector.setFocusedWord( word, this.textPresenter.page );
      });
      gazeTracking.setCallback( 'wordLeft', 'task-page', word => {
          this.syllabifier.setFocusedWord( null );
          this.collector.setFocusedWord( null );
      });
      gazeTracking.setCallback( 'fixation', 'task-page', fix => {
          this.collector.logFixation( fix, this.textPresenter.page );
      });

      this.next();
    },

    beforeDestroy() {
      this.syllabifier.cleanup();

      gazeTracking.clearCallback( 'stateUpdated', 'task-page');
      gazeTracking.clearCallback( 'wordFocused', 'task-page' );
      gazeTracking.clearCallback( 'wordLeft', 'task-page' );
      gazeTracking.clearCallback( 'fixation', 'task-page' );
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