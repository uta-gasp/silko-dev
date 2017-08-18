<template lang="pug">
  #student-summary
    vis-title {{ title }}
    .container
      table
        thead
          tr
            th(:class="headerNameClass" @click="sort( -1 )") Name
            th(:class="statNameClass( stat, index )" v-for="(stat, index) in statistics" @click="sort( index )") {{ stat.name }}
        tbody
          tr(v-for="student in students" :key="student.ref.id")
            td {{ student.ref.name }}
            td(v-for="(stat, index) in student.statistics")
              span(v-if="index === 1") {{ `${Math.floor(stat / 60).toFixed(0)}:${secondsToString( stat % 60 )}` }}
              span(v-else) {{ stat }}

    control-panel(:options="options"
      @show-options="showOptions"
      @close="close"
    )
    options(v-show="isOptionsDisplayed" :values="options" @close="closeOptions" @apply="applyOptions")

</template>

<script>
import Regressions from '@/vis/regressions.js';
import sgwmController from '@/vis/sgwmController.js';
// import OptionsCreator from '@/vis/optionsCreator.js';

import ControlPanel from '@/components/vis/controlPanel';
import Options from '@/components/vis/Options';
import VisTitle from '@/components/vis/VisTitle';

sgwmController.initializeSettings();

export default {
  name: 'student-summary',

  components: {
    'control-panel': ControlPanel,
    'options': Options,
    'vis-title': VisTitle,
  },

  data() {
    return {
      isOptionsDisplayed: false,

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
        { name: 'WPM', sortDir: 0 },
        { name: 'SPW', sortDir: 0 },
        { name: 'Fixation, ms', sortDir: 0 },
        { name: 'Syllabifications', sortDir: 0 },
        { name: 'Regressions', sortDir: 0 },
      ],
    };
  },

  props: {
    data: {   // vis/Data
      type: Object,
      required: true,
    },
  },

  computed: {
    headerNameClass() {
      return {
        sorted: this.sortedStatIndex < 0,
        up: this.sortedStatIndex < 0 && this.nameSortDir > 0,
        down: this.sortedStatIndex < 0 && this.nameSortDir < 0,
      };
    },

    title() {
      const grade = this.data.params.grade;
      return `${grade.studentCount} ${grade.name}`;
    },
  },

  methods: {
    showOptions( e ) {
      this.isOptionsDisplayed = true;
    },

    close( e ) {
      this.$emit( 'close' );
    },

    applyOptions( e ) {
      sgwmController.save();
      this.makeStudents();
    },

    closeOptions( e ) {
      this.isOptionsDisplayed = false;
    },

    statNameClass( stat, index ) {
      return {
        sorted: this.sortedStatIndex === index,
        up: this.sortedStatIndex === index && stat.sortDir > 0,
        down: this.sortedStatIndex === index && stat.sortDir < 0,
      };
    },

    makeStudents() {
      const students = new Map();

      this.data.records.forEach( record => {
        const session = {
          data: record.data,
        };

        if ( students.has( record.student.id ) ) {
          const student = students.get( record.student.id );
          student.sessions.push( session );
        }
        else {
          const student = {
            ref: record.student,
            sessions: [ session ],
            statistics: null,
          };
          students.set( record.student.id, student );
        }
      } );

      const studentList = [];
      students.forEach( student => {
        student.statistics = this.calculateStatistics( student );
        studentList.push( student );
      } );

      this.students = studentList;
      this.sort( this.sortedStatIndex );
    },

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

      student.sessions.forEach( session => {
        const pages = session.data.pages;

        let firstPage;
        let lastPage;
        pages.forEach( page => {
          if ( !firstPage && page.fixations ) {
            firstPage = page;
          }
          if ( page.fixations ) {
            lastPage = page;
          }
        } );

        if ( !firstPage || !lastPage ) {
          return;
        }

        const firstFixation = firstPage.fixations[0];
        const lastFixation = lastPage.fixations[ lastPage.fixations.length - 1 ];
        duration += ( lastFixation.ts + lastFixation.duration ) - firstFixation.ts;

        wordCount += pages.reduce( ( acc, page ) => {
          return acc + page.text.length;
        }, 0 );

        fixations = pages.reduce( ( acc, page ) => {
          return {
            count: acc.count + page.fixations.length,
            duration: acc.duration + page.fixations.reduce( ( sum, fix ) => ( sum + fix.duration ), 0 ),
            hyphenations: acc.hyphenations + ( page.syllabifications ? page.syllabifications.length : 0 ),
          };
        }, fixations );

        regressionCount += pages.reduce( ( acc, page ) => {
          const mappedPage = sgwmController.map( page );
          return acc + Regressions.compute( mappedPage.fixations );
        }, 0 );

        // sessionCount++;
      } );

      const totalDuration = new Date( 0, 0, 0, 0, 0, Math.round( duration / 1000 ) );

      result.push( totalDuration.getMinutes() * 60 + totalDuration.getSeconds() );
      result.push( ( wordCount / ( duration / 60000 ) ).toFixed( 0 ) );
      result.push( ( duration / wordCount / 1000 ).toFixed( 2 ) );
      result.push( Math.round( fixations.duration / fixations.count ) );
      result.push( fixations.hyphenations / student.sessions.length );
      result.push( regressionCount );

      return result;
    },

    secondsToString( seconds ) {
      let text = '' + seconds;
      if ( text.length < 2 ) {
        text = '0' + text;
      }
      return text;
    },

    sort( statIndex ) {
      const newSortDirection = this.computeSortDirection( statIndex );

      this.nameSortDir = statIndex < 0 ? newSortDirection : 0;
      this.statistics.forEach( ( stat, index ) => {
        stat.sortDir = statIndex === index ? newSortDirection : 0;
      } );

      this.sortData( statIndex, newSortDirection );

      this.sortedStatIndex = statIndex;
    },

    computeSortDirection( statIndex ) {
      let currentSortDirection = 0;
      if ( this.sortedStatIndex < 0 ) {
        currentSortDirection = this.nameSortDir;
      }
      else {
        currentSortDirection = this.statistics[ this.sortedStatIndex ].sortDir;
      }

      return currentSortDirection < 1 ? 1 : -1;
    },

    sortData( statIndex, sortDirection ) {
      const students = this.students.map( student => student );

      students.sort( ( a, b ) => {
        if ( statIndex < 0 ) {
          return sortDirection > 0 ? a.ref.name < b.ref.name : a.ref.name > b.ref.name;
        }
        else {
          return sortDirection > 0
            ? b.statistics[ statIndex ] - a.statistics[ statIndex ]
            : a.statistics[ statIndex ] - b.statistics[ statIndex ];
        }
      } );

      this.students = students;
    },

    map( session ) {
      const sgwmSession = {
        fixations: session.fixations,
        words: session.words.map( word => {
          return {
            id: word.id,
            x: word.rect.x,
            y: word.rect.y,
            width: word.rect.width,
            height: word.rect.height,
            text: word.text,
          };
        } ),
      };

      const sgwm = new SGWM();
      const result = sgwm.map( sgwmSession );

      return result;
    },
  },

  mounted() {
    console.log( 'Student summary created' );
    this.makeStudents();
  },
};
</script>

<style lang="less" scoped>
  #student-summary {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
    background-color: white;

    .container {
      position: fixed;
      left: 0;
      top: 48px;
      right: 0;
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
