<template lang="pug">
  #control-panel.columns.is-mobile
    .column.title {{ title }}
    .column.is-narrow
      player.player(v-if="showPlayer" :is-paused="isPlayerPaused" @restart="restartPlayer" @toggle="togglePlayer")

      .props(v-if="feedback")
        abbr.prop.speech(:class="{ off: !feedback.speech.enabled }" title="Speech output")
        abbr.prop.syllab(:class="{ off: !feedback.syllabification.enabled }" title="Syllabification")
          span(v-if="feedback.syllabification.enabled") {{ feedback.syllabification.threshold.value }}

      .props(v-if="questionnaire && questionnaire.length")
        abbr.prop.questionnaire(title="Questionnaire corectness") {{ correctAnswers }}

      .menu
        template(v-if="textLength")
          .navigation
            abbr(title="Previous page")
              button.icon-btn.prev(:class="{ disabled: !pageIndex }" @click="prevPage")
            .page {{ dispPage }}
            abbr(title="Next page")
              button.icon-btn.next(:class="{ disabled: pageIndex === textLength - 1 }" @click="nextPage")
          .separator
        template(v-if="showOptionsButton")
          abbr(title="Settings")
            button.icon-btn.settings(@click="showOptions")
          .separator
        abbr(title="Close this visualization")
          button.icon-btn.close(@click="close")

</template>

<script>
import Player from '@/components/vis/Player';
import VisTitle from '@/components/vis/VisTitle';

export default {
  name: 'control-panel',

  components: {
    'player': Player,
    'vis-title': VisTitle,
  },

  data() {
    return {
      pageIndex: this.initialPageIndex || 0,
    };
  },

  props: {
    title: {
      type: String,
      required: true,
    },

    feedback: {   // model/session/Feedbacks
      type: Object,
      default: null,
    },

    questionnaire: {  // [ model/session/Question ]
      type: Array,
      default: null,
    },

    initialPageIndex: {
      type: Number,
      default: 0,
    },

    textLength: {
      type: Number,
      default: 0,
    },

    showOptionsButton: {
      type: Boolean,
      default: true,
    },

    showPlayer: {
      type: Boolean,
      default: false,
    },

    isPlayerPaused: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    dispPage() {
      const hasIntroPage = this.initialPageIndex > 0;
      const introPageIndex = hasIntroPage ? 0 : -1;
      const textPageCount = hasIntroPage ? this.textLength - 1 : this.textLength;
      const delta = hasIntroPage ? 0 : 1;
      return this.pageIndex === introPageIndex ? 'int' : `${this.pageIndex + delta}/${textPageCount}`;
    },

    correctAnswers() {
      if ( !this.questionnaire || !this.questionnaire.length ) {
        return '-';
      }

      const correct = this.questionnaire.filter( question => {
        return question.answer.isCorrect;
      } ).length / this.questionnaire.length * 100;
      return correct.toFixed( 0 ) + '%';
    },
  },

  methods: {
    prevPage( e ) {
      if ( this.pageIndex > 0 ) {
        this.setPage( this.pageIndex - 1 );
      }
    },

    nextPage( e ) {
      if ( this.pageIndex < this.textLength - 1 ) {
        this.setPage( this.pageIndex + 1 );
      }
    },

    showOptions( e ) {
      this.$emit( 'show-options' );
    },

    restartPlayer( e ) {
      this.$emit( 'restart-player' );
    },

    togglePlayer( e ) {
      this.$emit( 'toggle-player' );
    },

    close( e ) {
      this.$emit( 'close' );
    },

    setPage( index ) {
      this.pageIndex = index;
      this.$emit( 'page-changed', { index } );
    },
  },
};
</script>

<style lang="less" scoped>
  @import "../../styles/icon-button.less";

  .control-panel {
    display: inline-block;
    // margin: 4px;
    padding: 4px;
    line-height: 0;
    vertical-align: top;

    border-radius: 5px;
    border: solid 1px #464;
  }

  #control-panel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    white-space: nowrap;
    padding: 2px;
    background-color: rgba(128,128,128,0.05);

    .player {
      margin-right: 12px;
    }

    .props {
      .control-panel;

      margin-right: 12px;

      .prop {
        display: inline-block;
        user-select: none;
        background-position: center center;
        background-repeat: no-repeat;
        margin: 0 4px;

        line-height: 16px;
        height: 36px;
        min-width: 32px;
        vertical-align: bottom;
        text-decoration: none;

        &.speech {
          background-image: url("../../assets/img/speech.png");

          &.off {
            background-image: url("../../assets/img/speech-no.png");
          }
        }

        &.syllab {
          background-image: url("../../assets/img/syllab.png");
          background-position: center bottom;

          &.off {
            background-image: url("../../assets/img/syllab-no.png");
            background-position: center center;
          }
        }

        &.questionnaire {
          background-image: url("../../assets/img/quest.png");
          background-position: center bottom;
        }
      }
    }

    .menu {
      .control-panel;

      .navigation {
        display: inline-block;
      }

      .icon-btn {
        &.close {
          background-image: url("../../assets/img/close.png");
        }

        &.settings {
          background-image: url("../../assets/img/settings.png");
        }

        &.prev {
          background-image: url("../../assets/img/prev.png");
        }

        &.next {
          background-image: url("../../assets/img/next.png");
        }
      }

      .page {
        display: inline-block;
        box-sizing: content-box;
        padding: 4px;
        z-index: 2;

        font-family: 'Oxygen Mono', monospace;
        font-size: 24px;
        line-height: 28px;
        vertical-align: top;
      }
    }

    .separator {
      display: inline-block;
      border-right: solid 1px #464;
      margin: 0 6px 0 5px;
      width: 1px;
      height: 28px;
      box-sizing: border-box;
    }
  }

  .title {
    color: #444;
    font: 18px 'Roboto Condensed', Arial, sans-serif;
    line-height: 46px;
    overflow-x: hidden;
    text-overflow: ellipsis;
    text-align: left;
    margin-left: 0.5em;
  }

  .column {
    margin-bottom: 0;
    padding-bottom: 2px;
  }
</style>
