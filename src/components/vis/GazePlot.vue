<script>
  import VisPlot from '@/components/vis/VisPlot';

  import OptionsCreator from '@/vis/optionsCreator.js';
  import Painter from '@/vis/painter.js';
  import Metric from '@/vis/metric.js';

  const UI = {
    colorMetric: Metric.Type.DURATION,

    saccadeColor: '#08F',
    connectionColor: '#F00',

    showIDs: false,
    showConnections: true,
    showSaccades: true,
    showFixations: true,

    fixationNumberSize: 16,
    fixationNumberColor: '#FF0',

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
            options: OptionsCreator.createOptions({
              colorMetric: { type: Array, items: ['none', 'duration', 'char speed', 'syllable speed'], label: 'Word color metric' },

              saccadeColor: { type: '#', label: 'Saccade color' },
              connectionColor: { type: '#', label: 'Connection color' },

              showIDs: { type: Boolean, label: 'Show IDs' },
              showConnections: { type: Boolean, label: 'Show word-fixation connections' },
              showSaccades: { type: Boolean, label: 'Show saccades' },
              showFixations: { type: Boolean, label: 'Show fixations' },

              fixationNumberSize: { type: Number, step: 1, label: 'ID font size' },
              fixationNumberColor: { type: '#', label: 'ID color' },

              'syllab.background': { type: '#', label: 'Syllabification background' },
              'syllab.wordColor': { type: '#', label: 'Syllabification word color' },
            }, UI )
          }
        },

        painter: null,
      };
    },

    methods: {
      changePage() {
        if (!this.painter) {
          this.painter = new Painter( this.$refs.canvas, {
            syllab: this.data.props.syllab,
          });
          this.painter.setFont( this.record.session.font );
        }

        this.mapAndShow();
      },

      redraw() {
        this.mapAndShow();
      },

      mapAndShow() {
        const page = this.currentPages[0];
        if (!page.fixations) {
            return;
        }

        const data = {
            fixations: page.fixations,
            words: page.text,
        };

        const fixations = this.map( data ).fixations;

        this.painter.clean();

        this.painter.drawWords( data.words, Object.assign({
            colorMetric: UI.colorMetric,
            drawFrame: UI.showConnections,
        }, this.commonUI ));

        if (page.syllabifications) {
            this.painter.drawSyllabifications( page.syllabifications, Object.assign( {
              isSyllabified: this.data.records[0].session.feedbacks.mode === 'hyphen',
              hyphen: this.data.records[0].session.feedbacks.hyphen
            }, UI.syllab ));
        }
        if (UI.showFixations && fixations) {
            this.painter.drawFixations( fixations, UI );
        }
      },
    },

    mounted() {
      console.log('GazePlot created');
    }
  };
</script>
