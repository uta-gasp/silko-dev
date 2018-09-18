<template lang="pug">
  #student-summary
    .container
      table
        thead
          tr
            th(:class="headerNameClass" @click="sort( -1 )") {{ tokens[ 'name' ] }}
            th(v-for="(stat, index) in statistics" 
              :class="statNameClass( stat, index )" 
              :title="stat.title || ''" 
              :key="index"
              @click="sort( index )") {{ stat.name }}
        tbody
          tr(v-for="student in students" :key="student.ref.id")
            td {{ student.ref.name }}
            td(v-for="(stat, index) in student.statistics" :key="index")
              span(v-if="index === 1") {{ `${Math.floor(stat / 60).toFixed(0)}:${secondsToString( stat % 60 )}` }}
              span(v-else) 
                span(v-if="statistics[ index ].hasProgress" 
                  :class="{ 'progressLink': true }"
                  @click="showProgress( student, index )") {{ stat }}
                span(v-else) {{ stat }}

    modal-container(v-if="isShowingProgress" :title="progressChartData.title" @close="closeChart")
      progress-chart.chart(:data="progressChartData")

    control-panel(
      :title="title"
      :options="options"
      @show-options="showOptions"
      @close="close"
    )
    options(v-show="isOptionsDisplayed" :values="options" @close="closeOptions" @apply="applyOptions")

</template>

<script>
import { i10n } from '@/utils/i10n.js';

import { Feedbacks, SyllabOptions } from '@/model/session/feedbacks.js';

import Regressions from '@/vis/regressions.js';
import sgwmController from '@/vis/sgwmController.js';

import Syllabifier from '@/task/syllabifier.js';

import ProgressChart from '@/components/widgets/ProgressChart.vue';
import ModalContainer from '@/components/widgets/ModalContainer.vue';
import ControlPanel from '@/components/vis/controlPanel.vue';
import Options from '@/components/vis/Options.vue';

// ts-check-only
import Student from '@/model/student.js';
import Data from '@/model/data.js';
import DataPage from '@/model/data/dataPage.js';
import VisData from '@/vis/data/data.js';

/**
 * @typedef Session
 * @property {Data} data
 * @property {Feedbacks} feedbacks
 * @property {string} name
 * @property {string} date
 */

/**
 * @typedef StudentStat
 * @property {Student} ref
 * @property {Session[]} sessions
 * @property {(string | number)[]} statistics
 */

sgwmController.initializeSettings();

/**
 * @fires close
 */
export default {
  name: 'student-summary',

  components: {
    'modal-container': ModalContainer,
    'control-panel': ControlPanel,
    'options': Options,
    'progress-chart': ProgressChart,
  },

  data() {
    return {
      isOptionsDisplayed: false,

      /** @type {StudentStat[]} */
      students: [],

      // options representation for editor
      options: {
        _sgwm: sgwmController.createOptions(),
      },

      sortedStatIndex: -1,
      nameSortDir: 1,

      progressChartData: null,

      tokens: i10n( 'vis_summary', '_form', '_labels' ),

      statistics: [],
    };
  },

  props: {
    data: {   // vis/Data
      type: VisData,
      required: true,
    },
  },

  computed: {
    /** @returns {{sorted: boolean, up: boolean, down: boolean}} */
    headerNameClass() {
      return {
        sorted: this.sortedStatIndex < 0,
        up: this.sortedStatIndex < 0 && this.nameSortDir > 0,
        down: this.sortedStatIndex < 0 && this.nameSortDir < 0,
      };
    },

    /** @returns {string} */
    title() {
      const grade = this.data.params.grade;
      return `${grade.studentCount} ${grade.name}`;
    },

    isShowingProgress() {
      return !!this.progressChartData;
    }
  },

  methods: {
    /** @param {Event} e */
    showOptions( e ) {
      this.isOptionsDisplayed = true;
    },

    /** @param {Event} e */
    close( e ) {
      this.$emit( 'close' );
    },

    /** @param {Event} e */
    applyOptions( e ) {
      sgwmController.save();
      this.makeStudents();
    },

    /** @param {Event} e */
    closeOptions( e ) {
      this.isOptionsDisplayed = false;
    },

    /**
     * @param {{sortDir: number}} stat
     * @param {number} index
     * @returns {{sorted: boolean, up: boolean, down: boolean}}
     */
    statNameClass( stat, index ) {
      return {
        sorted: this.sortedStatIndex === index,
        up: this.sortedStatIndex === index && stat.sortDir > 0,
        down: this.sortedStatIndex === index && stat.sortDir < 0,
      };
    },

    makeStudents() {
      /** @type {Map<string,StudentStat>} */
      const students = new Map();

      // Records.session.feedbacks
      this.data.records.forEach( record => {
        const session = {
          data: record.data,
          feedbacks: record.session.feedbacks,
          name: record.task.name,
          date: record.session.date,
        };
        
        if ( students.has( record.student.id ) ) {
          const student = students.get( record.student.id );
          student.sessions.push( session );
        }
        else {
          const student = {
            ref: record.student,
            sessions: [ session ],
            /** @type {(string | number)[]} */
            statistics: null,
          };
          students.set( record.student.id, student );
        }
      } );

      /** @type {StudentStat[]} */
      const studentList = [];
      students.forEach( student => {
        student.statistics = this.calculateStatistics( student );
        studentList.push( student );
      } );

      this.students = studentList;
      this.sort( this.sortedStatIndex );
    },

    /**
     * @param {StudentStat} student
     * @returns {(string | number)[]}
     */
    calculateStatistics( student ) {
      const result = [];

      result.push( student.sessions.length );

      let duration = 0;
      // let sessionCount = 0;
      let wordCount = 0;
      let regressionCount = 0;
      let fixations = {
        count: 0,
        duration: 0,
        hyphenations: 0,
      };
      let fixationAvg = 0;
      let fixationSD = 0;
      let syllab = {
        count: 0,
        sessions: 0,
      };

      student.sessions.forEach( session => {
        const pages = session.data.pages;
        const syllabifier = session.feedbacks.syllabification.enabled ? new Syllabifier( SyllabOptions.from( session.feedbacks.syllabification ) ) : null;

        /** @type {DataPage} */
        let firstPage;
        let lastPage;
        pages.forEach( ( page, pageIndex ) => {
          if ( !firstPage && page.fixations ) {
            firstPage = page;
          }
          if ( page.fixations ) {
            lastPage = page;

            const fixRange = {
              first: page.fixations[0],
              last: page.fixations[ page.fixations.length - 1 ],
            };

            duration += ( fixRange.last.ts + fixRange.last.duration ) - fixRange.first.ts;
            wordCount += page.text.length;

            if ( syllabifier ) {
              const text =  page.text.map( word => word.text ).join( ' ' );
              syllab.count += syllabifier.getSyllabCount( text );
              if ( !pageIndex ) {
                syllab.sessions++;
              }
            }
          }
        } );

        if ( !firstPage || !lastPage ) {
          return;
        }

        fixations = pages.reduce( ( acc, page ) => {
          if ( !page.fixations ) {
            return acc;
          }

          return {
            count: acc.count + page.fixations.length,
            duration: acc.duration + page.fixations.reduce( ( sum, fix ) => ( sum + fix.duration ), 0 ),
            hyphenations: acc.hyphenations + ( page.syllabifications ? page.syllabifications.length : 0 ),
          };
        }, fixations );

        regressionCount += pages.reduce( ( acc, page ) => {
          if ( !page.fixations ) {
            return acc;
          }

          const mappedPage = sgwmController.map( page );
          return acc + Regressions.compute( mappedPage.fixations );
        }, 0 );

        // sessionCount++;
      } );

      fixationAvg = fixations.count ? fixations.duration / fixations.count : 0;
      fixationSD = fixations.count > 1 ? student.sessions.reduce( (acc, session) => {
        session.data.pages.forEach( page => {
          if (page.fixations) {
            page.fixations.forEach( fix => {
              const d = fix.duration - fixationAvg;
              acc += d * d;
            });
          }
        });
        return acc;
      }, 0 ) : 0;

      const totalDuration = new Date( 0, 0, 0, 0, 0, Math.round( duration / 1000 ) );

      result.push( totalDuration.getMinutes() * 60 + totalDuration.getSeconds() );
      result.push( wordCount ? ( wordCount / ( duration / 60000 ) ).toFixed( 0 ) : '-' );
      result.push( syllab.count ? ( syllab.count / ( duration / 60000 ) ).toFixed( 0 ) + ` (${syllab.sessions})` : '-' );
      result.push( duration ? ( duration / wordCount / 1000 ).toFixed( 2 ) : '-' );
      result.push( fixations.count ? Math.round( fixationAvg ) : '-' );
      result.push( fixations.count > 1 ? Math.round( Math.sqrt( fixationSD / (fixations.count - 1) ) ) : '-' );
      result.push( ( fixations.hyphenations / student.sessions.length ).toFixed( 2 ) );
      result.push( regressionCount );

      return result;
    },

    /** 
     * @param {number} seconds
     * @returns {string}
     */
    secondsToString( seconds ) {
      let text = '' + seconds;
      if ( text.length < 2 ) {
        text = '0' + text;
      }
      return text;
    },

    /** 
     * @param {number} statIndex
     */
    sort( statIndex ) {
      const newSortDirection = this.computeSortDirection();

      this.nameSortDir = statIndex < 0 ? newSortDirection : 0;
      this.statistics.forEach( ( stat, index ) => {
        stat.sortDir = statIndex === index ? newSortDirection : 0;
      } );

      this.sortData( statIndex, newSortDirection );

      this.sortedStatIndex = statIndex;
    },

    computeSortDirection() {
      let currentSortDirection = 0;
      if ( this.sortedStatIndex < 0 ) {
        currentSortDirection = this.nameSortDir;
      }
      else {
        currentSortDirection = this.statistics[ this.sortedStatIndex ].sortDir;
      }

      return currentSortDirection < 1 ? 1 : -1;
    },

    /** 
     * @param {number} statIndex
     * @param {number} sortDirection
     */
    sortData( statIndex, sortDirection ) {
      const students = this.students.map( student => student );

      students.sort( /** @param {StudentStat} a; @param {StudentStat} b; @returns {number} */ ( a, b ) => {
        if ( statIndex < 0 ) {
          return sortDirection > 0 ? (a.ref.name < b.ref.name ? 1 : 0) : (a.ref.name > b.ref.name ? 1 : 0);
        }
        else {
          const valA = /** @type {number} */ (a.statistics[ statIndex ]);
          const valB = /** @type {number} */ (b.statistics[ statIndex ]);
          return sortDirection > 0 ? valB - valA : valA - valB;
        }
      } );

      this.students = students;
    },

    // Stats computation in

    /**
     * @param {DataPage[]} pages
     * @param {function} onPage
     * @return {{duration: number, wordCount: number}}
     */
    computeDurationAndWords( pages, onPage ) {
      let duration = 0;
      let wordCount = 0;

      /** @type {DataPage} */
      let firstPage;
      let lastPage;
      pages.forEach( ( page, pageIndex ) => {
        if ( !firstPage && page.fixations ) {
          firstPage = page;
        }
        if ( page.fixations ) {
          lastPage = page;

          const fixRange = {
            first: page.fixations[0],
            last: page.fixations[ page.fixations.length - 1 ],
          };

          duration += ( fixRange.last.ts + fixRange.last.duration ) - fixRange.first.ts;
          wordCount += page.text.length;

          if (onPage) {
            onPage( page );
          }
        }
      } );

      if ( firstPage && lastPage ) {
        return { duration, wordCount };
      }
      else {
        return null;
      }
    },

    /**
     * @param {StudentStat} student
     */
    computeWPM( student ) {
      /** @type {number[]} */
      const values = [];
      /** @type {string[]} */
      const labels = [];

      student.sessions.forEach( session => {
        const basicStat = this.computeDurationAndWords( session.data.pages, null );
        if ( basicStat ) {
          values.push( basicStat.wordCount ? basicStat.wordCount / ( basicStat.duration / 60000 ) : 0 );
          labels.push( session.name + '|' + session.date );
        }
      } );

      return {
        title: this.tokens[ 'tit_wpm' ],
        values: values,
        labels: labels,
      };
    },

    /**
     * @param {StudentStat} student
     */
    computeSPM( student ) {
      /** @type {number[]} */
      const values = [];
      /** @type {string[]} */
      const labels = [];

      student.sessions.forEach( session => {
        if (!session.feedbacks.syllabification.enabled) {
          return;
        }

        const syllabifier = new Syllabifier( SyllabOptions.from( session.feedbacks.syllabification ) );

        let syllabCount = 0;

        const basicStat = this.computeDurationAndWords( session.data.pages, /** @param {DataPage} page */page => {
            const text =  page.text.map( word => word.text ).join( ' ' );
            syllabCount += syllabifier.getSyllabCount( text );
        });

        if ( basicStat ) {
          values.push( basicStat.duration ? syllabCount / ( basicStat.duration / 60000 ) : 0 );
          labels.push( session.name + '|' + session.date );
        }
      } );

      return {
        title: this.tokens[ 'tit_sylpm' ],
        values: values,
        labels: labels,
      };
    },

    /**
     * @param {StudentStat} student
     */
    computeSPW( student ) {
      /** @type {number[]} */
      const values = [];
      /** @type {string[]} */
      const labels = [];

      student.sessions.forEach( session => {
        const basicStat = this.computeDurationAndWords( session.data.pages, null );

        if ( basicStat ) {
          values.push( basicStat.duration ? basicStat.duration / basicStat.wordCount / 1000 : 0 );
          labels.push( session.name + '|' + session.date );
        }
      } );

      return {
        title: this.tokens[ 'tit_spw' ],
        values: values,
        labels: labels,
      };
    },

    /**
     * @param {StudentStat} student
     */
    computeFixation( student ) {
      /** @type {number[]} */
      const values = [];
      /** @type {string[]} */
      const labels = [];

      student.sessions.forEach( session => {
        const fixations = {
          count: 0,
          duration: 0
        };
        const basicStat = this.computeDurationAndWords( session.data.pages, /** @param {DataPage} page */page => {
          fixations.count += page.fixations.length;
          fixations.duration += page.fixations.reduce( ( sum, fix ) => ( sum + fix.duration ), 0 );
        });

        if ( basicStat ) {
          values.push( fixations.count ? fixations.duration / fixations.count : 0 );
          labels.push( session.name + '|' + session.date );
        }
      } );

      return {
        title: this.tokens[ 'tit_fd' ],
        values: values,
        labels: labels,
      };
    },

    /**
     * @param {StudentStat} student
     */
    computeSyllabifications( student ) {
      /** @type {number[]} */
      const values = [];
      /** @type {string[]} */
      const labels = [];

      student.sessions.forEach( session => {
        let syllabifications = 0;
        const basicStat = this.computeDurationAndWords( session.data.pages, /** @param {DataPage} page */page => {
          syllabifications += page.syllabifications ? page.syllabifications.length : 0;
        });

        if ( basicStat ) {
          values.push( syllabifications );
          labels.push( session.name + '|' + session.date );
        }
      } );

      return {
        title: this.tokens[ 'tit_syllabs' ],
        values: values,
        labels: labels,
      };
    },
    
    /**
     * @param {StudentStat} student
     */
    computeRegressions( student ) {
      /** @type {number[]} */
      const values = [];
      /** @type {string[]} */
      const labels = [];

      student.sessions.forEach( session => {
        let regressionCount = 0;

        const basicStat = this.computeDurationAndWords( session.data.pages, /** @param {DataPage} page */ page => {
          const mappedPage = sgwmController.map( page );
          regressionCount += Regressions.compute( mappedPage.fixations );
        });

        if ( basicStat ) {
          values.push( regressionCount );
          labels.push( session.name + '|' + session.date );
        }
      } );

      return {
        title: this.tokens[ 'tit_regrs' ],
        values: values,
        labels: labels,
      };
    },

    /**
     * @param {StudentStat} student
     * @param {number} statIndex
     */
    showProgress( student, statIndex ) {
      const name = this.statistics[ statIndex ].name;
      const progressData = this[ 'compute' + name ]( student );

      this.progressChartData = {
        title: progressData.title,
        labels: progressData.labels,
        datasets: [
          {
            label: '',
            data: progressData.values.map( v => parseFloat( v.toFixed(1) ) ),

            backgroundColor: '#f87979',
            borderColor: '#7979f8',
            
            fill: false,
            lineTension: 0.2,

            pointRadius: 6,
            pointBorderWidth: 3,
            pointHoverRadius: 10,
            pointHoverBorderWidth: 3,
          }
        ]
      };
    },

    closeChart() {
      this.progressChartData = null;
    },
  },

  created() {
    this.statistics = [
      { name: this.tokens[ 'sessions' ], sortDir: 0, hasProgress: false },
      { name: this.tokens[ 'lbl_time' ], sortDir: 0, hasProgress: false },
      { name: this.tokens[ 'lbl_wpm' ], title: this.tokens[ 'tit_wpm' ], sortDir: 0, hasProgress: true },
      { name: this.tokens[ 'lbl_spm' ], title: this.tokens[ 'tit_sylpm' ], sortDir: 0, hasProgress: true },
      { name: this.tokens[ 'lbl_spw' ], title: this.tokens[ 'tit_spw' ], sortDir: 0, hasProgress: true },
      { name: this.tokens[ 'lbl_fix' ], title: this.tokens[ 'tit_fd' ], sortDir: 0, hasProgress: true },
      { name: this.tokens[ 'lbl_fsd' ], title: this.tokens[ 'tit_fsd' ], sortDir: 0, hasProgress: false },
      { name: this.tokens[ 'tit_syllabs' ], sortDir: 0, hasProgress: true },
      { name: this.tokens[ 'tit_regrs' ], sortDir: 0, hasProgress: true },
    ];
  },

  mounted() {
    console.log( 'Student summary created' );
    this.makeStudents();
  },
};
</script>

<style lang="less" scoped>
  @import "../../styles/visualization.less";

  #student-summary {
    .visualization();

    .container {
      position: fixed;
      left: 0;
      right: 0;
      top: 52px;
      bottom: 8px;
      max-width: 100vw;

      overflow-y: auto;
      padding: 0.3em 0.5em;

      font-family: Calibri, Arial, sans-serif;
      font-size: 20px;

      table {
        padding: 8px;
        margin: 0 auto;

        border-collapse: collapse;

        tr:nth-child(even) {
          background-color: #cfc;
        }

        thead {
          background-color: #464;
          background-image: linear-gradient(#686, #464);
          font-weight: bold;

          position: sticky;
          top: 0;

          th,
          td {
            color: #fff;

            background-origin: border-box;
            background-position: 98% center;
            background-repeat: no-repeat;

            border-width: 2px;
            padding: 0.3em 1em;
            cursor: pointer;

            &.sorted {
              color: #cfc;
            }

            &.up {
              background-image: url("../../assets/img/up-arrow.png");
            }

            &.down {
              background-image: url("../../assets/img/down-arrow.png");
            }
          }
        }

        th,
        td {
          border: 1px solid black;
          text-align: center;
          padding: 0 4px;
        }

        tfoot {
          font-weight: bold;

          td {
            border-width: 1px 0 0;
          }
        }

        td:first-of-type {
          text-align: right;
        }
      }
    }

    .progressLink {
      cursor: pointer;
      color: #246;
      font-weight: bold;
    }

    .chart {
      min-width: 60vw;
      max-width: 90vw;
      height: 80vh;
      margin: 0 auto
    }
}
</style>
