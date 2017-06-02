<template lang="pug">
  #start-page
    section.section
      .container(v-show="isConnected")
        .content.is-large
          p(v-for="line in startInstruction") {{ line }}

        button.button.is-large.is-primary(:disabled="!isCalibrated" @click="start()") {{ texts.startRun }}
        button.button.is-large(@click="cancel()") {{ texts.startCancel }}

    div.fullscreen(ref="fullscreen")
      task-page(v-show="isRunning" :texts="texts" :task="task" @finished="finished()" @saved="dataSaved( $event )")

    p
      .container(v-show="!isCalibrated")
        .message.is-danger
          .message-body The tracker is not calibrated yet
</template>

<script>
  import gazeTracking from '@/utils/gazeTracking.js';

  import TaskPage from '@/components/widgets/TaskPage';

  export default {
    name: 'start-page',

    data() {
      return {
        isConnected: (gazeTracking.state.isConnected && !gazeTracking.state.isTracking && !gazeTracking.state.isBusy) || false,
        isCalibrated: (gazeTracking.state.isCalibrated && !gazeTracking.state.isTracking && !gazeTracking.state.isBusy) || false,
        isRunning: (gazeTracking.state.isConnected && gazeTracking.state.isTracking && !gazeTracking.state.isBusy) || false,
      };
    },

    components: {
      'task-page': TaskPage,
    },

    props: {
      texts: Object,
      task: Object
    },

    computed: {
      startInstruction() {
        return this.texts.startInstruction ? this.texts.startInstruction.split( '\n' ) : '';
      }
    },

    methods: {
      makeFullscreen( element ) {
        if(element.requestFullscreen) {
          element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      },

      closeFullscreen() {
        if(document.exitFullscreen) {
          document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if(document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      },

      start() {
        this.makeFullscreen( this.$refs.fullscreen );
        gazeTracking.start();
      },

      cancel() {
        this.$emit( 'close', { cancelled: true } );
      },

      finished() {
        this.$emit( 'close', { finished: true } );
        gazeTracking.stop();
        this.closeFullscreen();
      },

      dataSaved( e ) {
        this.$emit( 'saved', e );
      },
    },

    created() {
      gazeTracking.setCallback( 'stateUpdated', 'start', state => {
        this.isConnected = state.isConnected && !state.isTracking && !state.isBusy;
        this.isCalibrated = state.isCalibrated && !state.isTracking && !state.isBusy;
        this.isRunning = state.isConnected && state.isTracking && !state.isBusy;
      });
    },

    beforeDestroy() {
      gazeTracking.clearCallback( 'stateUpdated', 'start' );
    }
  };
</script>

<style lang="less" scoped>
  .fullscreen {
    background-color: #fff;
  }
</style>