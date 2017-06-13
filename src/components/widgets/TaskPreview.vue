<template lang="pug">
  #task-preview
    .instruction.notification.is-info.has-text-centered
      .columns
        .column(v-if="task.syllab.language") Alt + click on a word to syllabify it.
        .column(v-if="task.syllab.language")
          button.button.is-primary.is-small(@click="syllabifyAll") Syllabify all
        .column(v-if="task.speech.language") Ctrl + click on a word to pronounce it.
    .text.median(ref="text" @click.alt="syllabify" @click.ctrl="pronounce" @contextmenu.prevent="")
    .columns.at-bottom
      .column.has-text-right
        button.button.is-primary.is-large(:disabled="!hasPrevPage" @click="prev")
          span &lt;
      .column.has-text-centered.is-narrow
        button.button.is-primary.is-large(@click="close")
          span Close
      .column.has-text-left
        button.button.is-primary.is-large(:disabled="!hasNextPage" @click="next")
          span &gt;
</template>

<script>
  import TextPresenter from '@/utils/textPresenter.js';
  import FeedbackProvider from '@/utils/feedbackProvider.js'

  export default {
    name: 'task-preview',

    data() {
      return {
        textPresenter: null,
        feedbackProvider: null,
      };
    },

    props: {
      firstPage: {
        type: String,
        default: ''
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
      }
    },

    methods: {

      syllabifyAll( e ) {
        this.textPresenter.words.forEach( (text, el ) => {
          this.feedbackProvider.syllabifier.syllabifyWord( el, text );
        });
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
        if (e.target.classList.contains( 'word' )) {
          const text = this.feedbackProvider.syllabifier.unprepare( e.target.textContent )
          if (text) {
            this.feedbackProvider.syllabifier.syllabifyWord( e.target, text );
          }
        }
      },

      pronounce( e ) {
        console.log(e);
        if (e.target.classList.contains( 'word' )) {
          const text = this.feedbackProvider.syllabifier.unprepare( e.target.textContent )
          if (text) {
            this.feedbackProvider.speaker.say( text );
          }
        }
      },
    },

    mounted() {
      this.feedbackProvider = new FeedbackProvider( this.task.syllab, this.task.speech );
      this.feedbackProvider.init();

      this.textPresenter = new TextPresenter( this.task, this.firstPage, this.$refs.text, this.feedbackProvider.syllabifier );

      this.next();
    },

    beforeDestroy() {
      this.feedbackProvider.cleanup();
    }
  };
</script>

<style lang="less" scoped>

  .is-bottom-right {
    position: fixed;
    bottom: 1em;
    right: 1em;
  }

  @margin: 15;

  #task-preview {
    position: relative;
    height: unit(100 - 2 * @margin, vh);
    margin: unit(@margin, vh) unit(@margin, vw);
    background-color: #fff;
  }

  .text {
    color: #775;
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

  .at-bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .instruction {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
  }
</style>

<style lang="less">

  .line {
    display: block;

    // custom styles

    .b {
      color: #000;
    }

    .n {
      color: #5e2095;
    }

    .h {
      color: #0e6095;
    }

    .g {
      color: lighten(#775, 25%);
    }
  }

  .currentWord {
    color: #c00;
  }

  .word {
    /* nothing is needed, just the class declaration */
  }

  .hyphens {
    color: #fff;
  }

  .hyphen {
    color: #ffa0a0;
  }

  .bold {
    color: black;
  }

</style>