<script>
import VisPlot from '@/components/vis/VisPlot';

import OptionsCreator from '@/vis/optionsCreator.js';
import Painter from '@/vis/painter.js';
import Metric from '@/vis/metric.js';
import ReplayTrack from '@/vis/replayTrack.js';

const LEGEND_LOCATION = {
  x: 2,
  y: 8,
};

const UI = {
  colorMetric: Metric.Type.NONE,

  nameFontFamily: 'Calibri, Arial, sans-serif',
  nameFontSize: 20,
  nameSpacing: 1.5,

  syllab: {
    background: '#fce',
    wordColor: '#060',
  },
};

export default {
  name: 'gaze-replay',

  mixins: [ VisPlot ],

  data() {
    return {
      // options representation for editor
      options: {
        gazeReplay: {
          id: 'gazeReplay',
          title: 'Gaze Replay',
          options: OptionsCreator.createOptions( {
            colorMetric: { type: Array, items: ['none', 'duration', 'char speed', 'syllable speed'], label: 'Word color metric' },

            nameFontFamily: { type: String, label: 'Name font' },
            nameFontSize: { type: Number, step: 1, label: 'Name font size' },
            nameSpacing: { type: Number, step: 0.1, label: 'Name spacing' },

            'syllab.background': { type: '#', label: 'Syllabification background' },
            'syllab.wordColor': { type: '#', label: 'Syllabification word color' },
          }, UI ),
        },
      },

      painter: null,
      tracks: [],
    };
  },

  methods: {

    restartPlayer( e ) {
      this.stopAll();
      this.start();
    },

    togglePlayer( e ) {
      this.isPlayerPaused = !this.isPlayerPaused;
      this.tracks.forEach( track => track.togglePause() );
    },

    changePage() {
      if ( !this.painter ) {
        this.painter = new Painter( this.$refs.canvas, {
          syllab: this.data.props.syllab,
        } );
      }

      if ( this.tracks.length ) {
        this.stopAll();
        this.start();
      }
    },

    redraw() {
      this.painter.clean();

      this.drawText();
      this.drawNames();
    },

    createTracks() {
      ReplayTrack.resetColors();

      this.data.records.forEach( record => {
        this.tracks.push( new ReplayTrack( this.$refs.root, record.student.name, record.data.pages ) );
      } );
    },

    stopAll() {
      this.tracks.forEach( track => track.stop() );
    },

    start() {
      this.isPlayerPaused = false;

      this.redraw();

      this.tracks.forEach( ( track, ti ) => {
        track.start(
          this.pageIndex, {  // callbacks
            fixation: ( fixation, pointer ) => {
            },
            completed: () => {
              const name = {
                color: track.color,
                index: ti,
              };
              this.painter.checkName( name, {
                fontSize: UI.nameFontSize,
                fontFamily: UI.nameFontFamily,
                nameSpacing: UI.nameSpacing,
                location: LEGEND_LOCATION,
              } );
            },
            syllabification: syllabification => {
              this.painter.setFont( this.defaultSession.font );
              this.painter.drawSyllabification( syllabification, Object.assign( {
                syllab: Object.assign( {}, this.defaultSession.feedbacks.syllabification ),
              }, this.commonUI, UI.syllab ) );
            },
          }
        );
      } );
    },

    drawNames() {
      const names = this.tracks.map( track => {
        return {
          text: track.name,
          color: track.color,
        };
      } );

      this.painter.drawNames( names, {
        fontSize: UI.nameFontSize,
        fontFamily: UI.nameFontFamily,
        nameSpacing: UI.nameSpacing,
        location: LEGEND_LOCATION,
      } );
    },

    drawText() {
      this.painter.setFont( this.defaultSession.font );
      this.painter.drawWords( this.currentPages[0].text, Object.assign( {
        colorMetric: UI.colorMetric,
      }, this.commonUI, {
        drawWordFrame: false,
      } ) );
    },
  },

  mounted() {
    console.log( 'GazePlot created' );
    this.createTracks();
    this.start();
  },

  beforeDestroy() {
    this.stopAll();
  },
};
</script>

<style lang="less">
  .track-pointer {
    position: absolute;
    height: 8px;
    width: 8px;
    background-color: #f80;
    border: 1px solid black;
    border-radius: 4px;
    opacity: 0.7;

    &.invisible {
        display: none;
    }
  }
</style>
