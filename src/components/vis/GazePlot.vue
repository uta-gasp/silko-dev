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
            colorMetric: { type: Array, items: ['none', 'duration', 'char speed', 'syllable speed'], label: 'Word color metric' },

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
      }

      this.mapAndShow();
    },

    redraw() {
      this.mapAndShow();
    },

    mapAndShow() {
      const page = this.currentPages[0];
      if ( !page.fixations ) {
        return;
      }

      const fixations = this.map( page ).fixations;
      Regressions.compute( fixations );

      this.painter.clean();

      this.painter.drawWords( page.text, Object.assign( {
        colorMetric: UI.colorMetric,
        showConnections: UI.showConnections,
      }, this.commonUI ) );

      if ( page.syllabifications ) {
        this.painter.drawSyllabifications( page.syllabifications, Object.assign( {
          isSyllabified: this.record.session.feedbacks.mode === 'hyphen',
          hyphen: this.record.session.feedbacks.hyphen,
        }, UI.syllab ) );
      }
      if ( UI.showFixations && fixations ) {
        this.painter.drawFixations( fixations, Object.assign( {
          connectionColor: this.commonUI.wordRectColor,
        }, UI ) );
      }
    },
  },

  mounted() {
    console.log( 'GazePlot created' );
  },
};
</script>
