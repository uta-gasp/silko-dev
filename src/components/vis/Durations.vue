<template lang="pug">
  #vis-durations
    .title {{ data.title }}
    .list
      .record(v-for="word in words")
        .word {{ word.text }}
        .duration {{ word.value }}

    control-panel(:feedback="data.props" :text-length="textLength" :options="options"
      @page-changed="setPage"
      @show-options="showOptions"
      @close="close"
    )
    options(v-show="isOptionsDisplayed" :values="options" @close="closeOptions" @apply="applyOptions")

</template>

<script>
  import OptionsCreator from '@/vis/optionsCreator.js';

  import ControlPanel from '@/components/vis/controlPanel';
  import Options from '@/components/vis/Options';

  const UNITS = {
    MS: 'ms',
    PERCENTAGE: '%'
  };

  const UI = {
    units: UNITS.MS
  };

  export default {
    name: 'durations',

     components: {
      'control-panel': ControlPanel,
      'options': Options,
    },

   data() {
      return {
        pageIndex: 0,
        isOptionsDisplayed: false,

        words: [],

        // options representation for editor
        options: {
          gazePlot: {
            id: 'durations',
            title: 'Durations',
            options: OptionsCreator.createOptions({
              units: { type: Array, items: Object.values( UNITS ), label: 'Units' },
            }, UI )
          }
        },
      };
    },

    props: {
      data: {   // { name, title, records, props }
        type: Object,
        required: true,
      }
    },

    computed: {
      textLength() {
        return this.data.records[0].data.pages.length;
      }
    },

    methods: {
      setPage( e ) {
        this.pageIndex = e.index;
        this.makeList();
      },

      showOptions( e ) {
        this.isOptionsDisplayed = true;
      },

      close( e ) {
        this.$emit( 'close' );
      },

      applyOptions( e ) {
        this.makeList();
      },

      closeOptions( e ) {
        this.isOptionsDisplayed = false;
      },

      makeList() {
        const words = new Map();

        let totalDuration = 0;
        this.data.records.forEach( record => {
          record.data.pages[ this.pageIndex ].words.forEach( word => {
            totalDuration += this.appendWord( words, word );
          ;})
        });

        const descending = (a, b) => b[1].focusing.duration - a[1].focusing.duration;
        this.words = this.compute( new Map( [...words.entries()].sort( descending ) ), totalDuration );
      },

      appendWord( words, word ) {
        const hyphenRegExp = new RegExp( `${this.data.props.syllab.hyphen}`, 'g' );

        let id = word.id;
        if (id === undefined) {
          id = '' + Math.floor( word.rect.x / 10 ) + '_' + Math.floor( word.rect.y / 10 );
        }

        let w = words.get( id );
        if (!w) {
          w = Object.assign( {}, word );
          w.text = w.text.replace( hyphenRegExp, '');
          words.set( id, w );
        }
        else {
          w.focusing.duration += word.focusing.duration;
        }

        return w.focusing.duration;
      },

      compute( words, totalDuration ) {
        const result = [];

        words.forEach( word => {
          let value = word.focusing.duration;
          if (UI.units === UNITS.MS) {
            value = (Math.round( value ) / 1000).toFixed(2);
          }
          else if (UI.units === UNITS.PERCENTAGE) {
            value = (100 * value / totalDuration).toFixed(1) + '%';
          }

          result.push( { text: word.text, value } );
        });

        return result;
      },
    },

    mounted() {
      console.log('Durations created');
      this.setPage( { index: 0 } );
    }
  };
</script>

<style lang="less" scoped>
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

  #vis-durations {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    background-color: white;

    .list {
      margin: 2em auto 0;

      background-color: rgba(255, 255, 220, 0.8);
      border: solid 1px;

      width: 20vw;
      height: ~"calc(100vh - 2em)";
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