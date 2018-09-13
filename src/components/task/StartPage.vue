<template lang="pug">
  #start-page
    section.section
      .container(v-show="isConnected")
        .content.is-large
          p(v-for="line in startInstruction") {{ line }}

        button.button.is-large.is-primary(:disabled="!isCalibrated" @click="start") {{ tokens[ 'start' ] }}
        button.button.is-large(@click="cancel") {{ tokens[ 'cancel' ] }}

    div.fullscreen(ref="fullscreen")
      task-page(
        v-if="isRunning"
        :texts="texts"
        :task="task"
        :student="student"
        :finilize="finilizeTask"
        @finished="finishedReading"
        @saved="gazeDataSaved")

      .container.tracking-lost-error-container(v-show="isFullscreen && !isRunning")
        .message.is-danger.tracking-lost-error
          .message-body {{ tokens[ 'msg_tracking_lost' ] }}

    .container(v-show="!isCalibrated")
      .message.is-danger
        .message-body {{ tokens[ 'msg_tracker_not_calibrated' ] }}
      article.message.is-info
        .message-body {{ tokens[ 'msg_calib_window_not_visible' ] }}
</template>

<script>
import { i10n } from '@/utils/i10n.js';
import gazeTracking from '@/utils/gazeTracking.js';

import Intro from '@/model/intro.js';
import Task from '@/model/task.js';
import Student from '@/model/student.js';

import TaskPage from '@/components/task/TaskPage.vue';

import fullscreen from '@/components/mixins/fullscreen.js';

/**
 * @fires close
 * @fires saved
 */
export default {
  name: 'start-page',

  mixins: [ fullscreen ],

  components: {
    'task-page': TaskPage,
  },

  data() {
    return {
      isConnected: ( gazeTracking.state.isConnected && !gazeTracking.state.isTracking && !gazeTracking.state.isBusy ) || false,
      isCalibrated: ( gazeTracking.state.isCalibrated && !gazeTracking.state.isTracking && !gazeTracking.state.isBusy ) || false,
      isRunning: ( gazeTracking.state.isConnected && gazeTracking.state.isTracking && !gazeTracking.state.isBusy ) || false,
      isReading: false,
      isFullscreen: false,
      timeoutTimer: null,
      finilizeTask: false,  // trigger

      tokens: i10n( 'assignment', '_buttons' ),
    };
  },

  props: {
    texts: {
      type: Intro,
      required: true,
    },
    task: {
      type: Task,
      required: true,
    },
    student: {
      type: Student,
      required: true,
    },
  },

  computed: {
    /** @returns {string[]} */
    startInstruction() {
      return this.texts.startInstruction ? this.texts.startInstruction.split( '\n' ) : [];
    },
  },

  methods: {
    /** @param {Event} e */
    start( e ) {
      this.isReading = true;
      this.makeFullscreen( this.$refs.fullscreen );
      gazeTracking.start();

      if (this.task.useTimeout) {
        this.timeoutTimer = setTimeout( () => {
          this.timeoutTimer = null;
          this.finilizeTask = true;
        }, this.task.timeout * 60000 );
      }
    },

    /** @param {Event} e */
    cancel( e ) {
      this.$emit( 'close', { cancelled: true } );
    },

    /** @param {Event} e */
    finishedReading( e ) {
      this.clearTaskTimeout();
      this.isReading = false;
      this.$emit( 'close', { finished: true, ...e } );
      this.closeFullscreen();
      gazeTracking.stop();
    },

    /** @param {Event} e */
    gazeDataSaved( e ) {
      this.$emit( 'saved', e );
    },

    clearTaskTimeout() {
      if (this.timeoutTimer) {
        clearTimeout( this.timeoutTimer );
        this.timeoutTimer = null;
      }
    },
  },

  watch: {
    /** @param {boolean} value */
    isRunning( value ) {
      if ( !value && this.isFullscreen && this.isReading ) {
        this.clearTaskTimeout();

        setTimeout( () => {
          this.closeFullscreen();
          this.$router.replace( '/assignments' );
        }, 4000 );
      }
    },
  },

  created() {
    gazeTracking.setCallback( 'stateUpdated', 'start', state => {
      this.isConnected = state.isConnected && !state.isTracking && !state.isBusy;
      this.isCalibrated = state.isCalibrated && !state.isTracking && !state.isBusy;
      this.isRunning = state.isConnected && state.isTracking && !state.isBusy;
    } );

    this.onFullscreenChanges( /** @param {boolean} isFullscreen */ isFullscreen => {
      this.isFullscreen = isFullscreen;
    } );
  },

  beforeDestroy() {
    gazeTracking.clearCallback( 'stateUpdated', 'start' );
  },
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
