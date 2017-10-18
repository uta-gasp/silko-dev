<script>
import dataUtils from '@/utils/data-utils.js';

import VisPlot from '@/components/vis/VisPlot';

import OptionsCreator from '@/vis/optionsCreator.js';
import Painter from '@/vis/painter.js';
import Metric from '@/vis/metric.js';
import Regressions from '@/vis/regressions.js';

const UI = {
  colorMetric: Metric.Type.DURATION,

  saccadeColor: '#08F',
  regressionColor: '#000',

  // showIDs: false,
  showConnections: true,
  showSaccades: true,
  showFixations: true,

  // fixationNumberSize: 16,
  // fixationNumberColor: '#FF0',

  syllab: {
    background: '#fce',
    wordColor: '#060',
  },
};

export default {
  name: 'gaze-plot',

  mixins: [ VisPlot ],

  data() {
    return {
      record: this.data.records[0],

      // options representation for editor
      options: {
        gazePlot: {
          id: 'gazePlot',
          title: 'Gaze Plot',
          options: OptionsCreator.createOptions( {
            colorMetric: { type: Array, items: Metric.Types, label: 'Word color metric' },

            saccadeColor: { type: '#', label: 'Saccade color' },
            regressionColor: { type: '#', label: 'Regressive saccade color' },

            // showIDs: { type: Boolean, label: 'Show IDs' },
            showConnections: { type: Boolean, label: 'Show word-fixation connections' },
            showSaccades: { type: Boolean, label: 'Show saccades' },
            showFixations: { type: Boolean, label: 'Show fixations' },

            // fixationNumberSize: { type: Number, step: 1, label: 'ID font size' },
            // fixationNumberColor: { type: '#', label: 'ID color' },

            'syllab.background': { type: '#', label: 'Syllabification background' },
            'syllab.wordColor': { type: '#', label: 'Syllabification word color' },
          }, UI ),
          defaults: OptionsCreator.createDefaults( UI ),
        },
      },

      painter: null,
    };
  },

  computed: {
    title() {
      return `${this.record.student.name} reading "${this.record.task.name}" at ${dataUtils.sessionDate( this.record.session.date )}`;
    },
  },

  methods: {
    changePage() {
      if ( !this.painter ) {
        this.painter = new Painter( this.$refs.canvas, {
          syllab: this.defaultFeedback.syllabification,
        } );
        this.painter.setFont( this.record.session.font );
        this.painter.setScreenSize( this.record.session.screen );
      }

      this.mapAndShow();
    },

    redraw() {
      this.mapAndShow();
    },

    mapAndShow() {
      this.painter.clean();

      const page = this.currentPages[0];

      const fixations = page.fixations ? this.map( page ).fixations : null;

      if ( fixations ) {
        Regressions.compute( fixations );
      }

      // const wordsWithGazingInfo = this.combineWordsAndGazeInfo( page.text, page.words );
      const wordsWithGazingInfo = this.addGazeInfoToWords( page.text, fixations );

      this.painter.drawWords( wordsWithGazingInfo, Object.assign( {
        colorMetric: UI.colorMetric,
        showConnections: UI.showConnections,
      }, this.commonUI ) );

      if ( page.syllabifications ) {
        this.painter.drawSyllabifications( page.syllabifications, Object.assign( {
          isSyllabified: this.record.session.feedbacks.mode === 'hyphen',
          hyphen: this.record.session.feedbacks.hyphen,
        }, UI.syllab ) );
      }

      if ( !page.fixations ) {
        this.isWarningMessageVisible = true;
        return;
      }

      this.isWarningMessageVisible = false;

      if ( UI.showFixations && fixations ) {
        this.painter.drawFixations( fixations, Object.assign( {
          connectionColor: this.commonUI.wordRectColor,
        }, UI ) );
      }
    },

    // isMatchingWord( word, info ) {
    //   return Math.abs( word.rect.x - info.rect.x ) < 1 && Math.abs( word.rect.y - info.rect.y ) < 1;
    // },

    // combineWordsAndGazeInfo( words, wordsWithGazeInfo ) {
    //   const result = [];
    //   const gazeInfo = new Set( wordsWithGazeInfo );

    //   words.forEach( word => {
    //     const iterator = gazeInfo.values();
    //     let item = iterator.next();
    //     while ( !item.done ) {
    //       if ( this.isMatchingWord( word, item.value ) ) {
    //         const { feedback, focusing } = item.value;
    //         result.push( Object.assign( { feedback, focusing }, word ) );
    //         gazeInfo.delete( item.value );
    //         break;
    //       }

    //       item = iterator.next();
    //     }

    //     if (item.done) {
    //       result.push( word );
    //     }
    //   });

    //   return result;
    // },

    addGazeInfoToWords( words, fixations ) {
      const result = [];

      words.forEach( word => {
        const focusing = {
          count: 0,
          duration: 0,
        };

        if ( fixations ) {
          fixations.forEach( fix => {
            if ( fix.word && fix.word.id === word.id ) {
              focusing.count += 1;
              focusing.duration += fix.duration;
            }
          } );
        }

        result.push( Object.assign( { focusing }, word ) );
      } );

      return result;
    },
  },

  mounted() {
    console.log( 'GazePlot created' );
  },
};
</script>
