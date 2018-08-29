<script>
import dataUtils from '@/utils/data-utils.js';

import VisPlot from '@/components/vis/VisPlot.vue';

import { OptionsCreator, OptionGroup, OptionItem } from '@/vis/optionsCreator.js';
import { Painter } from '@/vis/painter.js';
import Metric from '@/vis/metric.js';
import Regressions from '@/vis/regressions.js';

import { TextPageImage } from '@/model/task/textPageImage.js';

// ts-check-only
import DataPageTextWord from '@/model/data/dataPageTextWord.js';

/** 
 * @typedef {DataPageTextWord} FixatedWord
 * @property {number} count
 * @property {number} duration
 */

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

      /** @type {Painter} */
      painter: null,
    };
  },

  computed: {
    /** @returns {string} */
    title() {
      return `${this.record.student.name} reading "${this.record.task.name}" at ${dataUtils.sessionDate( this.record.session.date )}`;
    },
  },

  methods: {
    changePage() {
      if ( !this.painter ) {
        this.painter = new Painter( /** @type {HTMLCanvasElement} */ (this.$refs.canvas), {
          syllab: this.defaultFeedback.syllabification,
        } );
        this.painter.setFont( this.record.session.font );
        this.painter.setScreenSize( this.record.session.screen );
      }

      this.mapAndShow();

      this.visibleImages = this.currentImages.map( image => TextPageImage.from( image, { ignoreDisplayCondition: true } ) );
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
        hyphen: this.defaultFeedback.syllabification.hyphen,
      }, this.commonUI ) );

      if ( page.syllabifications ) {
        this.painter.drawSyllabifications( page.syllabifications, Object.assign( {
          isSyllabified: this.record.session.feedbacks.syllabification.mode === 'hyphen',
          hyphen: this.record.session.feedbacks.syllabification.hyphen,
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

    /** 
     * @param {DataPageTextWord[]} words
     * @param {SGWMFixation[]} fixations
     * @returns {FixatedWord[]}
     */
    addGazeInfoToWords( words, fixations ) {
      /** @type {FixatedWord[]} */
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

  created() {
    // options representation for editor
    this.options["gazePlot"] = new OptionGroup({
      id: 'gazePlot',
      title: 'Gaze Plot',
      options: OptionsCreator.createOptions( {
        colorMetric: new OptionItem({ type: Array, items: Metric.Types, label: 'Word color metric' }),

        saccadeColor: new OptionItem({ type: '#', label: 'Saccade color' }),
        regressionColor: new OptionItem({ type: '#', label: 'Regressive saccade color' }),

        showConnections: new OptionItem({ type: Boolean, label: 'Show word-fixation connections' }),
        showSaccades: new OptionItem({ type: Boolean, label: 'Show saccades' }),
        showFixations: new OptionItem({ type: Boolean, label: 'Show fixations' }),

        'syllab.background': new OptionItem({ type: '#', label: 'Syllabification background' }),
        'syllab.wordColor': new OptionItem({ type: '#', label: 'Syllabification word color' }),
      }, UI ),
      defaults: OptionsCreator.createDefaults( UI ),
    });
  },

  mounted() {
    console.log( 'GazePlot created' );
  },
};
</script>
