<template lang="pug">
  #calib-page
    section.section
      .container(v-show="isETUDConnected")
        .content.is-large
          p(v-for="line in calibInstruction") {{ line }}

        button.button.is-large.is-primary(:disabled="!isConnected" @click="calibrate") {{ tokens[ 'btn_calib' ] }}
        button.button.is-large(:disabled="!isCalibrated" @click="skip") {{ tokens[ 'btn_skip_calib' ] }}
        button.button.is-large(@click="cancel") {{ tokens[ 'cancel' ] }}

      .container(v-show="!isETUDConnected")
        .message.is-danger.is-centered
          .message-header {{ tokens[ 'hdr_cannot_conect' ] }}
          .message-body
            .content.has-text-left
              span {{ tokens[ 'msg_cannot_conect_1' ] }}
              ul
                li {{ tokens[ 'msg_cannot_conect_2' ] }}
                li {{ tokens[ 'msg_cannot_conect_3' ] }}

      .is-bottom-right
        a.button(:disabled="!isETUDConnected" @click="showETUDOptions")
          span.icon
            i.fa.fa-eye
</template>

<script>
import { i10n } from '@/utils/i10n.js';
import gazeTracking from '@/utils/gazeTracking.js';

import Intro from '@/model/intro.js';

/**
 * @fires close
 */
export default {
  name: 'calib-page',

  data() {
    return {
      isConnected: ( gazeTracking.state.isConnected && !gazeTracking.state.isTracking && !gazeTracking.state.isBusy ) || false,
      isETUDConnected: gazeTracking.state.isServiceRunning || false,
      isCalibrated: gazeTracking.state.isCalibrated || false,

      tokens: i10n( 'assignment', '_buttons' ),
    };
  },

  props: {
    texts: {
      type: Object, // Intro,
      required: true,
    }
  },

  computed: {
    /** @returns {string[]} */
    calibInstruction() {
      return this.texts.calibInstruction ? this.texts.calibInstruction.split( '\n' ) : [];
    },
  },

  methods: {
    /** @param {Event} e */
    showETUDOptions( e ) {
      gazeTracking.showOptions();
    },

    /** @param {Event} e */
    reload( e ) {
      this.$router.replace( '/assignments' );
      // window.location.assign( window.location.origin );
    },

    /** @param {Event} e */
    calibrate( e ) {
      this.$emit( 'close', { skip: false } );
    },

    /** @param {Event} e */
    skip( e ) {
      this.$emit( 'close', { skip: true } );
    },

    /** @param {Event} e */
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
