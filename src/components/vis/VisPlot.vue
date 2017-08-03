<template lang="pug">
  #vis-plot(ref="root")
    canvas(ref="canvas")
    .title {{ data.title }}
    control-panel(
      :feedback="feedback"
      :text-length="textLength"
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
  // to be implemented by descendants:
  // - changePage
  // - redraw

  import OptionsCreator from '@/vis/optionsCreator.js';
  import sgwmController from '@/vis/sgwmController.js';

  import ControlPanel from '@/components/vis/controlPanel';
  import Options from '@/components/vis/Options';

  const COMMON_UI = {
    wordColor: '#666',
    wordHighlightColor: '#606',
    wordRectColor: '#f00',
  };

  const SGWM_OPTIONS = sgwmController.initializeSettings();

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
        currentPages: [],

        isPlayerPaused: false
      };
    },

    props: {
      data: {   // { name, title, records, props }
        type: Object,
        required: true,
      }
    },

    computed: {
      feedback() {
        return this.data.records.length === 1 ? this.data.props : null;
      },

      textLength() {
        return this.data.records[0].data.pages.length;
      }
    },

    methods: {
      createCommonOptions() {
        return {
          id: '_common',
          title: 'Common',
          options: OptionsCreator.createOptions({
            wordColor: { type: '#', label: 'Text color' },
            wordHighlightColor: { type: '#', label: 'Highlighting color' },
            wordRectColor: { type: '#', label: 'Word frame color' },
          }, COMMON_UI )
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

      map( session ) {
        const sgwmSession = {
          fixations: session.fixations,
          words: session.words.map( word => {
            return {
              id: word.id,
              x: word.rect.x,
              y: word.rect.y,
              width: word.rect.width,
              height: word.rect.height,
              text: word.text
            };
          })
        };

        const sgwm = new SGWM();
        const result = sgwm.map( sgwmSession );

        return result;
      },
    },

    mounted() {
      this.setPage( { index: 0 } );
    }
  }
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

    .wait {
      position: fixed;
      top: 8px;
      left: 8px;
      width: 100vw;
      height: 100vh;
      background: url("../../assets/img/wait.gif") no-repeat fixed center;

      &.invisible {
        display: none;
      }
    }

    .title {
      position: fixed;
      width: 100vw;
      color: #444;
      font: 18px 'Roboto Condensed', Arial, sans-serif;
      top: 0;
      left: 0;
      text-align: center;
      line-height: 32px;
    }

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