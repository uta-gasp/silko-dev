<template lang="pug">
  #control-panel
    player.player(v-if="showPlayer" :is-paused="isPlayerPaused" @restart="restartPlayer" @toggle="togglePlayer")

    .props(v-if="!!feedback")
      abbr.prop.speech(:class="{ off: !feedback.speech.enabled }" title="Speech output")
      abbr.prop.syllab(:class="{ off: !feedback.syllab.enabled }" title="Syllabification") {{ feedback.syllab.threshold.value }}

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

  export default {
    name: 'control-panel',

    components: {
      'player': Player,
    },

    data() {
      return {
        pageIndex: this.initialPageIndex || 0,
      }
    },

    props: {
      feedback: {   // { syllab, speech }
        type: Object,
        default: null,
      },

      initialPageIndex: {
        type: Number,
        default: 0
      },

      textLength: {
        type: Number,
        default: 0,
      },

      showOptionsButton: {
        type: Boolean,
        default: true
      },

      showPlayer: {
        type: Boolean,
        default: false
      },

      isPlayerPaused: {
        type: Boolean,
        default: false
      },
    },

    computed: {
      dispPage() {
        return !this.pageIndex ? 'int' : `${this.pageIndex}/${this.textLength - 1}`;
      }
    },

    methods: {
      prevPage( e ) {
        if (this.pageIndex > 0) {
          this.setPage( this.pageIndex - 1 );
        }
      },

      nextPage( e ) {
        if (this.pageIndex < this.textLength - 1) {
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
    }
  };
</script>

<style lang="less" scoped>
  @import "../../styles/icon-button.less";

  .control-panel {
    display: inline-block;
    margin: 4px;
    padding: 4px;
    line-height: 0;
    vertical-align: top;

    border-radius: 5px;
    border: solid 1px #464;
  }

  #control-panel {
    position: absolute;
    top: 0;
    right: 0;

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
</style>