<template lang="pug">
  #calib-page
    section.section
      .container(v-show="isETUDConnected")
        .content.is-large
          p(v-for="line in calibInstruction") {{ line }}

        button.button.is-large.is-primary(:disabled="!isConnected" @click="calibrate") {{ titleStart }}
        button.button.is-large(:disabled="!isCalibrated" @click="skip") {{ titleSkip }}
        button.button.is-large(@click="cancel") {{ titleCancel }}

      .container(v-show="!isETUDConnected")
        .message.is-danger.is-centered
          .message-header Cannot connect to a gaze tracker
          .message-body
            .content.has-text-left
              span Possible reasons:
              ul
                li ETU-Driver service is not running
                li ETU-Driver service is running, but its WebSocket server is not enabled
            button.button.is-large.is-primary(@click="reload") Reload

      .is-bottom-right
        a.button(:disabled="!isETUDConnected" @click="showETUDOptions")
          span.icon
            i.fa.fa-eye
</template>

<script>
import gazeTracking from '@/utils/gazeTracking.js';

export default {
  name: 'calib-page',

  data() {
    return {
      isConnected: ( gazeTracking.state.isConnected && !gazeTracking.state.isTracking && !gazeTracking.state.isBusy ) || false,
      isETUDConnected: gazeTracking.state.isServiceRunning || false,
      isCalibrated: gazeTracking.state.isCalibrated || false,
    };
  },

  props: {
    texts: Object,
  },

  computed: {
    calibInstruction() {
      return this.texts.calibInstruction ? this.texts.calibInstruction.split( '\n' ) : '';
    },

    titleStart() {
      return this.texts.calibStart || 'Start';
    },

    titleSkip() {
      return this.texts.calibSkip || 'Skip';
    },

    titleCancel() {
      return this.texts.startCancel || 'Cancel';
    },
  },

  methods: {
    showETUDOptions( e ) {
      gazeTracking.showOptions();
    },

    reload( e ) {
      this.$router.replace( '/assignments' );
      // window.location.assign( window.location.origin );
    },

    calibrate( e ) {
      this.$emit( 'close', { skip: false } );
    },

    skip( e ) {
      this.$emit( 'close', { skip: true } );
    },

    cancel( e ) {
      this.$router.replace( '/assignments' );
    },
  },

  created() {
    gazeTracking.setCallback( 'stateUpdated', 'calib', state => {
      this.isConnected = state.isConnected && !state.isTracking && !state.isBusy;
      this.isETUDConnected = state.isServiceRunning;
      this.isCalibrated = state.isCalibrated;
    } );
  },

  beforeDestroy() {
    gazeTracking.clearCallback( 'stateUpdated', 'calib' );
  },
};
</script>

<style lang="less" scoped>
  .is-bottom-right {
    position: fixed;
    bottom: 1em;
    right: 1em;
  }

  .is-centered {
    max-width: 20em;
    margin-left: auto;
    margin-right: auto;
  }
</style>
