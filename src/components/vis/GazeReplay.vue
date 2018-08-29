<script>
import dataUtils from '@/utils/data-utils.js';

import { OptionsCreator, OptionGroup, OptionItem } from '@/vis/optionsCreator.js';
import { Painter } from '@/vis/painter.js';
import Metric from '@/vis/metric.js';
import ReplayTrack from '@/vis/replayTrack.js';

import { TextPageImage } from '@/model/task/textPageImage.js';

import VisPlot from '@/components/vis/VisPlot.vue';

// ts-check-only
import Fixation from '@/model/data/fixation';

const LEGEND_LOCATION = {
  x: 2,
  y: 56,
};

const UI = {
  colorMetric: Metric.Type.NONE,

  nameFontFamily: 'Calibri, Arial, sans-serif',
  nameFontSize: 18,
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
      /** @type {Painter} */
      painter: null,
      /** @type {ReplayTrack[]} */
      tracks: [],
    };
  },

  computed: {
    /** @returns {string} */
    title() {
      const r = this.data.records[0];
      const student = this.data.params.student ? ` for ${this.data.params.student}` : '';
      return `Gaze replay in "${r.task.name}"${student}`;
    },
  },

  methods: {
    /** @param {Event} e */
    restartPlayer( e ) {
      this.stopAll();
      this.start();
    },

    /** @param {Event} e */
    togglePlayer( e ) {
      this.isPlayerPaused = !this.isPlayerPaused;
      this.tracks.forEach( track => track.togglePause() );
    },

    changePage() {
      this.isWarningMessageVisible = false;
      this.visibleImages = this.currentImages
        .filter( image => image.on === TextPageImage.EVENT.none)
        .map( image => TextPageImage.from( image ) );

      if ( !this.painter ) {
        this.painter = new Painter( /** @type {HTMLCanvasElement}*/ (this.$refs.canvas), {
          syllab: this.defaultFeedback.syllabification,
        } );
        this.painter.setScreenSize( this.data.records[0].session.screen );
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

      const studentsWithMultipleSessions = {};

      this.data.records.forEach( record => {
        let id = record.student.name;
        studentsWithMultipleSessions[ id ] = studentsWithMultipleSessions[ id ] !== undefined;
      } );

      this.data.records.forEach( record => {
        let name = record.student.name;
        if ( studentsWithMultipleSessions[ name ] ) {
          name = `${name} ${dataUtils.sessionDate( record.session.date )}`;
        }

        this.tracks.push( new ReplayTrack(
          /** @type {HTMLElement} */ (this.$refs.root),
          name,
          record.data.pages,
          this.painter.offset,
        ) );
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
            fixation: ( /** @type {Fixation} */ fixation, /** @type {HTMLElement} */ pointer ) => {
              const missingImages = this.currentImages.filter( image => {
                return !this.visibleImages.find( img => img.src === image.src ) && 
                        image.shown < fixation.tsSync; 
              });
              const imagesToHide = this.currentImages.filter( image => {
                return !!this.visibleImages.find( img => img.src === image.src ) && 
                        image.hidden > 0 && image.hidden < fixation.tsSync;
              });

              if (missingImages.length > 0 || imagesToHide.legnth > 0) {
                this.visibleImages = this.currentImages
                  .filter( image => image.shown <= fixation.tsSync && (image.hidden > 0 ? fixation.tsSync < image.hidden : true) )
                  .map( image => TextPageImage.from( image, { ignoreDisplayCondition: true } ) );
              }
            },
            completed: /** @param {string} reason */ reason => {
              this.isWarningMessageVisible = !!reason;
              const name = {
                color: track.color,
                index: ti,
                text: ''
              };
              this.painter.checkName( name, {
                fontSize: UI.nameFontSize,
                fontFamily: UI.nameFontFamily,
                nameSpacing: UI.nameSpacing,
                location: LEGEND_LOCATION,
                reason,
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
      const names = this.tracks.map( /** @param {ReplayTrack} track */ track => {
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

  created() {
    // options representation for editor
    this.options["gazeReplay"] = new OptionGroup({
      id: 'gazeReplay',
      title: 'Gaze Replay',
      options: OptionsCreator.createOptions( {
        colorMetric: new OptionItem({ type: Array, items: ['none', 'duration', 'char speed', 'syllable speed'], label: 'Word color metric' }),

        nameFontFamily: new OptionItem({ type: String, label: 'Name font' }),
        nameFontSize: new OptionItem({ type: Number, step: 1, label: 'Name font size' }),
        nameSpacing: new OptionItem({ type: Number, step: 0.1, label: 'Name spacing' }),

        'syllab.background': new OptionItem({ type: '#', label: 'Syllabification background' }),
        'syllab.wordColor': new OptionItem({ type: '#', label: 'Syllabification word color' }),
      }, UI ),
      defaults: OptionsCreator.createDefaults( UI ),
    });
  },

  mounted() {
    console.log( 'GazeReplay created' );
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
