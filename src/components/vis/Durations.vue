<template lang="pug">
  #vis-durations
    .list
      .record(v-for="word in words")
        .word {{ word.text }}
        .duration {{ word.value }}

    control-panel(
      :title="title"
      :feedback="feedback"
      :text-length="textLength"
      :initial-page-index="initialPageIndex"
      :options="options"
      @page-changed="setPage"
      @show-options="showOptions"
      @close="close"
    )

    options(
      v-show="isOptionsDisplayed"
      :values="options"
      @close="closeOptions"
      @apply="applyOptions")

</template>

<script>
import { i10n } from '@/utils/i10n.js';

import { OptionsCreator, OptionGroup, OptionItem } from '@/vis/optionsCreator.js';
import { Feedbacks } from '@/model/session/feedbacks';

import ControlPanel from '@/components/vis/controlPanel.vue';
import Options from '@/components/vis/Options.vue';

// ts-check-pnly
import Data from '@/vis/data/data.js';
import DataPageFocusedWord from '@/model/data/dataPageFocusedWord.js';
import { Feedback } from '@/model/session/feedback';

const tokens = i10n( 'vis_durations' );

const UNITS = {
  SECONDS: tokens[ 'item_seconds' ],
  PERCENTAGE: tokens[ 'item_percentage' ],
};

const UI = {
  units: UNITS.SECONDS,
};

/**
 * @fires close
 */
export default {
  name: 'durations',

  components: {
    'control-panel': ControlPanel,
    'options': Options,
  },

  data() {
    return {
      pageIndex: -1,
      isOptionsDisplayed: false,

      defaultFeedback: this.data.records[0].session.feedbacks,

      /** @type {{text: string, value: string}[]} */
      words: [],

      // options representation for editor
      options: {
        gazePlot: new OptionGroup({
          id: 'durations',
          title: tokens[ 'hdr_options' ],
          options: OptionsCreator.createOptions( {
            units: new OptionItem({ 
              type: Array, 
              items: Object.values( UNITS ), 
              label: tokens[ 'lbl_units' ]
            }),
          }, UI ),
          defaults: OptionsCreator.createDefaults( UI ),
        }),
      },
    };
  },

  props: {
    data: {   // vis/Data
      type: Data,
      required: true,
    },
  },

  computed: {
    /** @returns {number} */
    textLength() {
      return this.data.records[0].data.pages.length;
    },

    /** @returns {number} */
    initialPageIndex() {
      return this.data.records[0].data.pages[0].isIntro ? 1 : 0;
    },

    /** @returns {string} */
    title() {
      const r = this.data.records[0];
      return tokens[ 'hdr_dur' ]( this.data.params.student, r.task.name );
    },

    feedback() {
      return new Feedbacks( this.defaultFeedback.speech, this.defaultFeedback.syllabification );
    },
  },

  methods: {
    /** @param {{index: number}} e */
    setPage( e ) {
      this.pageIndex = e.index;
      this.makeList();
    },

    /** @param {*} e */
    showOptions( e ) {
      this.isOptionsDisplayed = true;
    },

    /** @param {*} e */
    close( e ) {
      this.$emit( 'close' );
    },

    /** @param {*} e */
    applyOptions( e ) {
      this.makeList();
    },

    /** @param {*} e */
    closeOptions( e ) {
      this.isOptionsDisplayed = false;
    },

    makeList() {
      /** @type {Map<string, DataPageFocusedWord>} */
      const words = new Map();

      let totalDuration = 0;
      this.data.records.forEach( record => {
        record.data.pages[ this.pageIndex ].words.forEach( word => {
          totalDuration += this.appendWord( words, word );
        } );
      } );

      const descending = /** @param {*} a; @param {*} b */ ( a, b ) => b[1].focusing.duration - a[1].focusing.duration;
      this.words = this.compute( new Map( [...words.entries()].sort( descending ) ), totalDuration );
    },

    /**
     * @param {Map<string, DataPageFocusedWord>} words
     * @param {DataPageFocusedWord} word
     * @returns {number}
     */
    appendWord( words, word ) {
      const hyphenRegExp = new RegExp( `${this.defaultFeedback.syllabification.hyphen}`, 'g' );

      let id = '' + Math.floor( word.rect.x / 10 ) + '_' + Math.floor( word.rect.y / 10 );

      let w = words.get( id );
      if ( !w ) {
        w = Object.assign( {}, word, { focusing: { duration: word.focusing.duration } } );
        w.text = w.text.replace( hyphenRegExp, '' );
        words.set( id, w );
      }
      else {
        w.focusing.duration += word.focusing.duration;
      }

      return w.focusing.duration;
    },

    /**
     * @param {Map<string, DataPageFocusedWord>} words
     * @param {number} totalDuration
     * @returns {{text: string, value: string}[]}
     */
    compute( words, totalDuration ) {
      /** @type {{text: string, value: string}[]} */
      const result = [];

      words.forEach( word => {
        let value = '';
        const duration = word.focusing.duration;
        if ( UI.units === UNITS.SECONDS ) {
          value = ( Math.round( duration ) / 1000 ).toFixed( 2 );
        }
        else if ( UI.units === UNITS.PERCENTAGE ) {
          value = ( 100 * duration / totalDuration ).toFixed( 1 ) + '%';
        }

        result.push( { text: word.text, value } );
      } );

      return result;
    },
  },

  mounted() {
    console.log( 'Durations created' );
    this.setPage( { index: this.initialPageIndex } );
  },
};
</script>

<style lang="less" scoped>
  @import "../../styles/visualization.less";

  #vis-durations {
    .visualization();

    .list {
      margin: 52px auto 0;

      background-color: rgba(255, 255, 220, 0.8);
      border: solid 1px;

      width: 20vw;
      height: ~"calc(100vh - 52px)";
      overflow-y: auto;

      text-align: left;

      .record {
        width: 100%;
        padding: 0;

        &:nth-child(odd) {
          background-color: rgba(240, 240, 205, 0.8);
        }

        .word {
          display: inline-block;
          width: 65%;
          padding-left: 0.5em;
          box-sizing: border-box;
          text-overflow: ellipsis;
        }

        .duration {
          display: inline-block;
          width: 35%;
          text-align: right;
          padding-right: 0.4em;
          box-sizing: border-box;
        }
      }
    }
  }
</style>
