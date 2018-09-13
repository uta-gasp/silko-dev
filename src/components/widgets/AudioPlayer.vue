<template lang="pug">
  #audio-player
    .icon-btn(:class="{ play: !isPlaying, pause: isPlaying }" :title="title" @click="toggle")
    input.slider.is-fullwidth.is-small.is-circle(
      type="range" 
      :value="currentTimeMs" 
      step="1" 
      min="0" 
      :max="durationMs" 
      :disabled="isPlaying"
      @input="updateTime")
    .time {{ currentTimeMin }}
</template>

<script>
import { i10n } from '@/utils/i10n.js';

export default {
  data() {
    return {
      isPlaying: this.playing,
      currentTime: this.time,

      tokens: i10n( 'audio' ),
    };
  },

  props: {
    duration: {
      type: Number,
      default: 100,
    },

    playing: {
      type: Boolean,
      default: false,
    },

    time: {
      type: Number,
      default: 0,
    },
  },

  computed: {
    title() {
      return this.isPlaying ? this.tokens[ 'pause' ] : this.tokens[ 'play' ];
    },

    durationMs() {
      return Math.round( this.duration * 1000 );
    },

    currentTimeMs() {
      return Math.round( this.currentTime * 1000 );
    },

    currentTimeMin() {
      const seconds = this.currentTime;
      const min = Math.floor( seconds / 60 );
      const sec = Math.floor( seconds );
      const frac = Math.floor((seconds - sec) * 10);
      return `${min}:${sec < 10 ? '0'+sec : sec}.${frac}`;
    },
  },

  methods: {
    toggle() {
      this.isPlaying = !this.isPlaying;
      this.$emit( 'toggled', { isPlaying: this.isPlaying } );
    },

    /** @param {UIEvent} e */
    updateTime( e ) {
      this.$emit( 'slided', { time: /** @type {HTMLInputElement} */ (e.target).value / 1000 } );
    },
  },

  watch: {
    playing( value ) {
      this.isPlaying = value;
    },

    time( value) {
      this.currentTime = value;
    },
  },
}
</script>

<style lang="less" scoped>
  #audio-player {
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1em;

    display: flex;

    .icon-btn {
      display: inline-block;

      width: 32px;
      height: 32px;

      margin-right: 0.5em;

      &.pause {
        background-image: url("../../assets/img/pause.png");
      }

      &.play {
        background-image: url("../../assets/img/play.png");
      }
    }

    .slider {
      height: 32px;
      width: -webkit-fill-available;
      width: -moz-available;
    }

    .time {
      color: #fff;
      padding: 0 0.5em;
      width: 6em;
      text-align: start;
    }
  }
</style>
