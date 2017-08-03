<template lang="pug">
  #student-summary
    .title {{ data.title }}
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
              span(v-if="index === 1") {{ `${(stat / 60).toFixed(0)}:${secondsToString( stat % 60 )}` }}
              span(v-else) {{ stat }}

    control-panel(:options="options" :show-options-button="false"
      @show-options="showOptions"
      @close="close"
    )
    //- options(v-show="isOptionsDisplayed" :values="options" @close="closeOptions" @apply="applyOptions")

</template>

<script>
  // import OptionsCreator from '@/vis/optionsCreator.js';

  import ControlPanel from '@/components/vis/controlPanel';
  // import Options from '@/components/vis/Options';

  const UI = {
  };

  export default {
    name: 'student-summary',

     components: {
      'control-panel': ControlPanel,
      // 'options': Options,
    },

   data() {
      return {
        // isOptionsDisplayed: false,

        students: [],

        // options representation for editor
        // options: {
        //   gazePlot: {
        //     id: 'studentSummary',
        //     title: 'Student summary',
        //     options: OptionsCreator.createOptions({
        //       // units: { type: Array, items: Object.values( UNITS ), label: 'Units' },
        //     }, UI )
        //   }
        // },

        sortedStatIndex: -1,
        nameSortDir: 1,

        statistics: [
          { name: 'Sessions', sortDir: 0 },
          { name: 'Reading time', sortDir: 0 },
          { name: 'WPM', sortDir: 0 },
          { name: 'Seconds per word', sortDir: 0 },
          { name: 'Fixation, ms', sortDir: 0 },
          { name: 'Hyphenations', sortDir: 0 },
        ],
      };
    },

    props: {
      data: {   // { name, title, records, props }
        type: Object,
        required: true,
      }
    },

    computed: {
      headerNameClass() {
        return {
          sorted: this.sortedStatIndex < 0,
          up: this.sortedStatIndex < 0 && this.nameSortDir > 0,
          down: this.sortedStatIndex < 0 && this.nameSortDir < 0,
        };
      }
    },

    methods: {
      // showOptions( e ) {
      //   this.isOptionsDisplayed = true;
      // },

      close( e ) {
        this.$emit( 'close' );
      },

      // applyOptions( e ) {
      //   // this.makeStudents();
      // },

      // closeOptions( e ) {
      //   this.isOptionsDisplayed = false;
      // },

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
            data: record.data
          };

          if (students.has( record.student.id )) {
            const student = students.get( record.student.id );
            student.sessions.push( session );
          }
          else {
            const student = {
              ref: record.student,
              sessions: [ session ],
              statistics: null
            };
            students.set( record.student.id, student );
          }
        });

        const studentList = [];
        students.forEach( student => {
          student.statistics = this.calculateStatistics( student );
          studentList.push( student );
        });

        this.students = studentList;
        this.sort( this.sortedStatIndex );
      },

      calculateStatistics( student ) {
        const result = [];

        result.push( student.sessions.length );

        let duration = 0;
        let sessionCount = 0;
        let wordCount = 0;
        let fixations = {
            count: 0,
            duration: 0,
            hyphenations: 0
        };

        student.sessions.forEach( session => {
            const pages = session.data.pages;

            let lastPage;
            for (let i = pages.length - 1; i >= 0; i--) {
                const page = pages[i];
                if (page.fixations) {
                    lastPage = page;
                    break;
                }
            }

            if (!lastPage) {
                return;
            }

            const lastFixation = lastPage.fixations[ lastPage.fixations.length - 1 ];
            duration += lastFixation.tsSync + lastFixation.duration;

            wordCount += pages.reduce( (acc, page) => {
                return acc + page.text.length;
            }, 0);

            fixations = pages.reduce( (acc, page) => {
                return {
                    count: acc.count + page.fixations.length,
                    duration: acc.duration + page.fixations.reduce( (sum, fix) => (sum + fix.duration), 0 ),
                    hyphenations: acc.hyphenations + (page.syllabifications ? page.syllabifications.length : 0)
                };
            }, fixations);

            sessionCount++;
        });

        const totalDuration = new Date( 0, 0, 0, 0, 0, Math.round( duration / 1000 ) );

        result.push( totalDuration.getMinutes() * 60 + totalDuration.getSeconds() );
        result.push( (wordCount / (duration / 60000)).toFixed(0) );
        result.push( (duration / wordCount / 1000).toFixed(2) );
        result.push( Math.round( fixations.duration / fixations.count ) );
        result.push( fixations.hyphenations / student.sessions.length );

        return result;
      },

      secondsToString( seconds ) {
        let text = '' + seconds;
        if (text.length < 2) {
          text = '0' + text;
        }
        return text;
      },

      sort( statIndex ) {
        const newSortDirection = this.computeSortDirection( statIndex );

        this.nameSortDir = statIndex < 0 ? newSortDirection : 0;
        this.statistics.forEach( (stat, index) => {
          stat.sortDir = statIndex === index ? newSortDirection : 0;
        });

        this.sortData( statIndex, newSortDirection );

        this.sortedStatIndex = statIndex;
      },

      computeSortDirection( statIndex ) {
        let currentSortDirection = 0;
        if (this.sortedStatIndex < 0) {
          currentSortDirection = this.nameSortDir;
        }
        else {
          currentSortDirection = this.statistics[ this.sortedStatIndex ].sortDir;
        }

        return currentSortDirection < 1 ? 1 : -1;
      },

      sortData( statIndex, sortDirection ) {
        const students = this.students.map( student => student );

        students.sort( (a, b) => {
          if (statIndex < 0) {
            return sortDirection > 0 ? a.ref.name < b.ref.name : a.ref.name > b.ref.name;
          }
          else {
            return sortDirection > 0 ?
              b.statistics[ statIndex ] - a.statistics[ statIndex ] :
              a.statistics[ statIndex ] - b.statistics[ statIndex ] ;
          }
        });

        this.students = students;
      },
    },

    mounted() {
      console.log('Student summary created');
      this.makeStudents();
    }
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