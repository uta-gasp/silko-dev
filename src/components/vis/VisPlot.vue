<template lang="pug">
  #vis-plot(ref="root")
    canvas(ref="canvas")
    vis-title {{ title }}
    control-panel(
      :feedback="defaultFeedback"
      :questionnaire="data.records.length === 1 ? defaultQuestionnaire : null"
      :text-length="textLength"
      :initial-page-index="initialPageIndex"
      :options="options"
      :show-player="data.name.indexOf('Replay') >= 0"
      :is-player-paused="isPlayerPaused"
      @page-changed="setPage"
      @show-options="showOptions"
      @restart-player="restartPlayer"
      @toggle-player="togglePlayer"
      @close="close"
    )
    options(v-show="isOptionsDisplayed" :values="options" @close="closeOptions" @apply="applyOptions")

    slot
</template>

<script>
import OptionsCreator from '@/vis/optionsCreator.js';
import sgwmController from '@/vis/sgwmController.js';

import ControlPanel from '@/components/vis/controlPanel';
import Options from '@/components/vis/Options';
import VisTitle from '@/components/vis/VisTitle';

const COMMON_UI = {
  wordColor: '#666',
  wordHighlightColor: '#606',
  wordRectColor: '#f44',
  drawWordFrame: true,
};

sgwmController.initializeSettings();

// to be implemented by descendants:
// - changePage
// - redraw

export default {
  components: {
    'control-panel': ControlPanel,
    'options': Options,
    'vis-title': VisTitle,
  },

  data() {
    return {
      isOptionsDisplayed: false,
      options: {
        _common: this.createCommonOptions( COMMON_UI ),
        _sgwm: sgwmController.createOptions(),
      },

      commonUI: COMMON_UI,

      pageIndex: -1,
      currentPages: [],
      defaultSession: this.data.records[0].session,
      defaultPages: this.data.records[0].data.pages,
      defaultFeedback: this.data.records[0].session.feedbacks,
      defaultQuestionnaire: this.data.records[0].data.questionnaire,

      isPlayerPaused: false,
    };
  },

  props: {
    data: {   // vis/Data
      type: Object,
      required: true,
    },
  },

  computed: {
    textLength() {
      return this.defaultPages.length;
    },

    initialPageIndex() {
      return this.defaultPages[0].isIntro ? 1 : 0;
    },

    title() {
      return '';
    },
  },

  methods: {
    createCommonOptions() {
      return {
        id: '_common',
        title: 'Common',
        options: OptionsCreator.createOptions( {
          wordColor: { type: '#', label: 'Text color' },
          wordHighlightColor: { type: '#', label: 'Highlighting color' },
          wordRectColor: { type: '#', label: 'Word frame color' },
          drawWordFrame: { type: Boolean, label: 'Draw word frame' },
        }, COMMON_UI ),
      };
    },

    setPage( e ) {
      this.pageIndex = e.index;
      this.currentPages = this.data.records.map( record => record.data.pages[ e.index ] );
      this.changePage();
    },

    showOptions( e ) {
      this.isOptionsDisplayed = true;
    },

    close( e ) {
      this.$emit( 'close' );
    },

    applyOptions( e ) {
      sgwmController.save();
      this.redraw();
    },

    closeOptions( e ) {
      this.isOptionsDisplayed = false;
    },

    restartPlayer( e ) {

    },

    togglePlayer( e ) {

    },

    map( page ) {
      return sgwmController.map( page );
    },
  },

  mounted() {
    this.setPage( { index: this.initialPageIndex } );
  },
};
</script>

<style lang="less" scoped>
  #vis-plot {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;

    text-align: center;

    canvas {
      position: relative;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 1;
      background-color: rgba(255, 255, 255, 1);
    }
  }
</style>
