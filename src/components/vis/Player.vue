<template lang="pug">
  #player
    abbr(:title="tokens[ 'tit_restart' ]")
      button.icon-btn.restart(@click="restart")
    abbr(:title="tokens[ 'tit_pause_cont' ]")
      button.icon-btn(:class="{ play: isPaused, pause: !isPaused }" @click="toggle")
    .track
</template>

<script>
import { i10n } from '@/utils/i10n.js';

/**
 * @fires restart
 * @fires toggle
 */
export default {
  name: 'player',

  data() {
    return {
      tokens: i10n( 'player' ),
    };
  },

  props: {
    isPaused: {
      type: Boolean,
      default: false,
    },
  },

  methods: {
    /** @param {Event} e */
    restart( e ) {
      this.$emit( 'restart' );
    },

    /** @param {Event} e */
    toggle( e ) {
      this.$emit( 'toggle' );
    },
  },
};
</script>

<style lang="less" scoped>
  @import "../../styles/icon-button.less";

  #player {
    display: inline-block;
    // margin: 4px auto;
    padding: 4px;
    line-height: 0;
    vertical-align: top;

    border-radius: 5px;
    border: solid 1px #464;

    &.invisible {
      display: none;
    }

    .icon-btn {
      margin: 0 8px;

      &.restart {
        background-image: url("../../assets/img/restart.png");
      }

      &.pause {
        background-image: url("../../assets/img/pause.png");
      }

      &.play {
        background-image: url("../../assets/img/play.png");
      }
    }
  }
</style>
