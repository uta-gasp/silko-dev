<template lang="pug">
  #vis-plot(ref="root")
    canvas(ref="canvas")
    .message.is-danger.below-title(v-if="isWarningMessageVisible")
      .message-header Missing data
      .message-body Fixation data is missing on this page

    control-panel(
      :title="title"
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
import { OptionsCreator, OptionGroup, OptionItem } from '@/vis/optionsCreator.js';
import sgwmController from '@/vis/sgwmController.js';

import ControlPanel from '@/components/vis/controlPanel.vue';
import Options from '@/components/vis/Options.vue';

// ts-check-only
import DataPage from '@/model/data/dataPage.js';

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

/**
 * @fires close
 */
export default {
  components: {
    'control-panel': ControlPanel,
    'options': Options,
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
      /** @type {DataPage[]} */
      currentPages: [],
      defaultSession: this.data.records[0].session,
      defaultPages: this.data.records[0].data.pages,
      defaultFeedback: this.data.records[0].session.feedbacks,
      defaultQuestionnaire: this.data.records[0].data.questionnaire,

      isPlayerPaused: false,
      isWarningMessageVisible: false,
    };
  },

  props: {
    data: {   // vis/Data
      type: Object,
      required: true,
    },
  },

  computed: {
    /** @returns {number} */
    textLength() {
      return this.defaultPages.length;
    },

    /** @returns {number} */
    initialPageIndex() {
      return this.defaultPages[0].isIntro ? 1 : 0;
    },

    /** @returns {string} */
    title() {
      return '';
    },
  },

  methods: {
    /** @returns {OptionGroup} */
    createCommonOptions() {
      return new OptionGroup({
        id: '_common',
        title: 'Common',
        options: OptionsCreator.createOptions( {
          wordColor: new OptionItem({ type: '#', label: 'Text color' }),
          wordHighlightColor: new OptionItem({ type: '#', label: 'Highlighting color' }),
          wordRectColor: new OptionItem({ type: '#', label: 'Word frame color' }),
          drawWordFrame: new OptionItem({ type: Boolean, label: 'Draw word frame' }),
        }, COMMON_UI ),
        defaults: OptionsCreator.createDefaults( COMMON_UI ),
      });
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

    /** 
     * @param {DataPage} page 
     * @returns {{fixations: SGWMFixation[], words: SGWMWord[]}}
     * */
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
  @import "../../styles/visualization.less";

  #vis-plot {
    .visualization();

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

    .below-title {
      position: fixed;
      top: 3.5em;
      right: 4px;
    }
  }
</style>
