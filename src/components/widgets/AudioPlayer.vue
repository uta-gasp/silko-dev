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
</template>

<script>
export default {
  data() {
    return {
      isPlaying: this.playing,
      currentTime: this.time,
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
      return this.isPlaying ? 'Pause' : 'Play';
    },

    durationMs() {
      return Math.round( this.duration * 1000 );
    },

    currentTimeMs() {
      return Math.round( this.currentTime * 1000 );
    },
  },

  methods: {
    toggle() {
      this.isPlaying = !this.isPlaying;
      this.$emit( 'toggled', { isPlaying: this.isPlaying } );
    },

    updateTime( e ) {
      this.$emit( 'slided', { time: e.target.value / 1000 } );
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

  }
</style>
