<template lang="pug">
  #start-page
    section.section
      .container(v-show="isConnected")
        .content.is-large
          p(v-for="line in startInstruction") {{ line }}

        button.button.is-large.is-primary(:disabled="!isCalibrated" @click="start") {{ texts.startRun }}
        button.button.is-large(@click="cancel") {{ texts.startCancel }}

    div.fullscreen(ref="fullscreen")
      task-page(
        v-if="isRunning"
        :texts="texts"
        :task="task"
        :student="student"
        @finished="finishedReading"
        @saved="gazeDataSaved")

      .container.tracking-lost-error-container(v-show="isFullscreen && !isRunning")
        .message.is-danger.tracking-lost-error
          .message-body Gaze tracking is not available

    .container(v-show="!isCalibrated")
      .message.is-danger
        .message-body The tracker is not calibrated yet
</template>

<script>
  import gazeTracking from '@/utils/gazeTracking.js';

  import TaskPage from '@/components/task/TaskPage';

  import fullscreen from '@/components/mixins/fullscreen.js';

  export default {
    name: 'start-page',

    mixins: [ fullscreen ],

    components: {
      'task-page': TaskPage,
    },

    data() {
      return {
        isConnected: (gazeTracking.state.isConnected && !gazeTracking.state.isTracking && !gazeTracking.state.isBusy) || false,
        isCalibrated: (gazeTracking.state.isCalibrated && !gazeTracking.state.isTracking && !gazeTracking.state.isBusy) || false,
        isRunning: (gazeTracking.state.isConnected && gazeTracking.state.isTracking && !gazeTracking.state.isBusy) || false,
        isReading: false,
        isFullscreen: false,
      };
    },

    props: {
      texts: Object,
      task: Object,
      student: Object,
    },

    computed: {
      startInstruction() {
        return this.texts.startInstruction ? this.texts.startInstruction.split( '\n' ) : '';
      }
    },

    methods: {

      start( e ) {
        this.isReading = true;
        this.makeFullscreen( this.$refs.fullscreen );
        gazeTracking.start();
      },

      cancel( e ) {
        this.$emit( 'close', { cancelled: true } );
      },

      finishedReading( e ) {
        this.isReading = false;
        this.$emit( 'close', { finished: true, ...e } );
        this.closeFullscreen();
        gazeTracking.stop();
      },

      gazeDataSaved( e ) {
        this.$emit( 'saved', e );
      },
    },

    watch: {
      isRunning( value ) {
        if (!value && this.isFullscreen && this.isReading) {
          setTimeout( () => {
            this.closeFullscreen();
            this.$router.replace( '/assignments' );
          }, 4000);
        }
      }
    },

    created() {
      gazeTracking.setCallback( 'stateUpdated', 'start', state => {
        this.isConnected = state.isConnected && !state.isTracking && !state.isBusy;
        this.isCalibrated = state.isCalibrated && !state.isTracking && !state.isBusy;
        this.isRunning = state.isConnected && state.isTracking && !state.isBusy;
      });

      this.onFullscreenChanges( isFullscreen => {
        this.isFullscreen = isFullscreen;
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

  .tracking-lost-error-container {
    height: 100%;
  }

  .tracking-lost-error {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }

</style>