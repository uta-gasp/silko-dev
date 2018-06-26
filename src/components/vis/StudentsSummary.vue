<template lang="pug">
  #student-summary
    .container
      table
        thead
          tr
            th(:class="headerNameClass" @click="sort( -1 )") Name
            th(:class="statNameClass( stat, index )" 
              v-for="(stat, index) in statistics" :title="stat.title || ''" 
              :key="index"
              @click="sort( index )") {{ stat.name }}
        tbody
          tr(v-for="student in students" :key="student.ref.id")
            td {{ student.ref.name }}
            td(v-for="(stat, index) in student.statistics" :key="index")
              span(v-if="index === 1") {{ `${Math.floor(stat / 60).toFixed(0)}:${secondsToString( stat % 60 )}` }}
              span(v-else) {{ stat }}

    control-panel(
      :title="title"
      :options="options"
      @show-options="showOptions"
      @close="close"
    )
    options(v-show="isOptionsDisplayed" :values="options" @close="closeOptions" @apply="applyOptions")

</template>

<script>
import { Feedbacks, SyllabOptions } from '@/model/session/feedbacks.js';

import Regressions from '@/vis/regressions.js';
import sgwmController from '@/vis/sgwmController.js';

import Syllabifier from '@/task/syllabifier.js';

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
    'control-panel': ControlPanel,
    'options': Options,
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

      statistics: [
        { name: 'Sessions', sortDir: 0 },
        { name: 'Reading time', sortDir: 0 },
        { name: 'WPM', title: 'Words per minute', sortDir: 0 },
        { name: 'SPM', title: 'Syllables per minute (sessions)', sortDir: 0 },
        { name: 'SPW', title: 'Seconds per word', sortDir: 0 },
        { name: 'Fixation', title: 'Average fixation duration in milliseconds', sortDir: 0 },
        { name: 'FSD', title: 'Fixation standard deviation in milliseconds', sortDir: 0 },
        { name: 'Syllabifications', sortDir: 0 },
        { name: 'Regressions', sortDir: 0 },
      ],
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
          page.fixations.forEach( fix => {
            const d = fix.duration - fixationAvg;
            acc += d * d;
          });
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
  }
</style>
