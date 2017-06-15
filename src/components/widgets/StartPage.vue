<template lang="pug">
  #start-page
    section.section
      .container(v-show="isConnected")
        .content.is-large
          p(v-for="line in startInstruction") {{ line }}

        button.button.is-large.is-primary(:disabled="!isCalibrated" @click="start") {{ texts.startRun }}
        button.button.is-large(@click="cancel") {{ texts.startCancel }}

    div.fullscreen(ref="fullscreen")
      task-page(v-show="isRunning" :texts="texts" :task="task" :student="student" @finished="finished" @saved="done")

    p
      .container(v-show="!isCalibrated")
        .message.is-danger
          .message-body The tracker is not calibrated yet
</template>

<script>
  import gazeTracking from '@/utils/gazeTracking.js';

  import TaskPage from '@/components/widgets/TaskPage';

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
        this.makeFullscreen( this.$refs.fullscreen );
        gazeTracking.start();
      },

      cancel( e ) {
        this.$emit( 'close', { cancelled: true } );
      },

      finished( e ) {
        this.$emit( 'close', { finished: true } );
        gazeTracking.stop();
        this.closeFullscreen();
      },

      done( e ) {
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