<template lang="pug">
  #results.section
    .container(v-if="classes === null")
      loading
    .container(v-else-if="!classes.length")
      i No data was recorded yet
    nav.panel(v-for="cls in classes" :key="cls.ref.id")
      .panel-block.is-marginless.is-paddingless
        .card.is-fullwidth
          header.card-header.notification.is-info.is-paddingless
            .card-header-title {{ cls.ref.name }}
          .card-content
            table.table
              thead
                tr
                  th Tasks
                  th
                  th
                  th
                  th
              tbody
                tr(v-for="task in cls.tasks" :key="task.id")
                  td {{ task.name }}
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectTaskStudents( task, VISUALIZATIONS.durations )") Durations
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectTaskStudents( task, VISUALIZATIONS.gazeReplay )") Gaze replay
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectTaskStudents( task, VISUALIZATIONS.wordReplay )") Word replay
                  td.is-narrow
                    span(v-if="task.hasQuestionnaire")
                      button.button.is-primary(:disabled="!isLoaded" @click="selectTaskStudents( task, VISUALIZATIONS.questionnaireResults )") Questionnaire

            .container(v-if="cls.students === null")
              loading
            .container(v-else-if="!cls.students.length")

            table.table(v-else)
              thead
                tr
                  th Students
                  th
                  th
                  th
                  th
                  th
                    button.button.is-primary.is-pulled-right(:disabled="!isLoaded" @click="selectClassStudents( cls, VISUALIZATIONS.studentsSummary )") Summary
              tbody
                tr(v-for="student in cls.students" :key="student.ref.id")
                  td {{ student.ref.name }}
                  td.is-narrow
                    button.button.is-warning(:disabled="!isLoaded || !student.sessions.length" @click="editSessions( student )") Edit
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectSession( student, VISUALIZATIONS.gazePlot )") Gaze plot
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectSession( student, VISUALIZATIONS.durations )") Durations
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectSession( student, VISUALIZATIONS.gazeReplay )") Gaze replay
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectSession( student, VISUALIZATIONS.wordReplay )") Word replay

    modal-container(
      v-if="gradeWithStudents"
      :title="gradeWithStudents[0].text"
      @close="closeStudentSelectionBox")
      item-selection-box(
        :items="gradeWithStudents"
        item-name="grade"
        subitem-name="student"
        @accept="continueDeferredWithStudents")

    modal-container(
      v-if="studentWithSessions"
      :title="studentWithSessions[0].text"
      @close="closeSessionSelectionBox")
      item-selection-box(
        :multiple="!isGazePlot"
        :single-group="!isGazePlot && !studentWithSessions[0].multiGroup"
        :items="studentWithSessions"
        item-name="student"
        subitem-name="session"
        @accept="continueDeferredWithSessions")

    modal-container(
      v-if="editingStudent"
      :title="`Sessions by ${editingStudent.ref.name}`"
      @close="closeSessionEditingBox")
      session-editing-box(:student="editingStudent" @deleted="sessionDeleted")

    gaze-plot(v-if="isShowing( VISUALIZATIONS.gazePlot )" :data="visualization" @close="closeVisualization")

    durations(v-if="isShowing( VISUALIZATIONS.durations )" :data="visualization" @close="closeVisualization")

    gaze-replay(v-if="isShowing( VISUALIZATIONS.gazeReplay )" :data="visualization" @close="closeVisualization")

    word-replay(v-if="isShowing( VISUALIZATIONS.wordReplay )" :data="visualization" @close="closeVisualization")

    questionnaire-results(v-if="isShowing( VISUALIZATIONS.questionnaireResults )" :data="visualization" @close="closeVisualization")

    students-summary(v-if="isShowing( VISUALIZATIONS.studentsSummary )" :data="visualization" @close="closeVisualization")

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}
</template>

<script>
import eventBus from '@/utils/event-bus.js';
import dataUtils from '@/utils/data-utils.js';

import SelectionBoxItem from '@/utils/selectionBoxItem.js';

import Teacher from '@/model/teacher.js';
import ModelStudent from '@/model/student.js';

import Data from '@/vis/data/data.js';
import Record from '@/vis/data/record.js';
import Task from '@/vis/data/task.js';
import Class from '@/vis/data/class.js';
import Params from '@/vis/data/params.js';

import ActionError from '@/components/mixins/actionError';

import Loading from '@/components/widgets/Loading.vue';
import TemporalNotification from '@/components/widgets/TemporalNotification.vue';
import ModalContainer from '@/components/widgets/ModalContainer.vue';
import SessionEditBox from '@/components/widgets/SessionEditBox.vue';
import ItemSelectionBox from '@/components/widgets/ItemSelectionBox.vue';

import GazePlot from '@/components/vis/GazePlot.vue';
import Durations from '@/components/vis/Durations.vue';
import GazeReplay from '@/components/vis/GazeReplay.vue';
import WordReplay from '@/components/vis/WordReplay.vue';
import StudentsSummary from '@/components/vis/StudentsSummary.vue';
import QuestionnaireResults from '@/components/vis/QuestionnaireResults.vue';

// ts-check-only
import ModelData from '@/model/data.js';
import ModelClass from '@/model/class.js';
import Session from '@/vis/data/session.js';
import Student from '@/vis/data/student.js';

class _VisualizationInitialData {

  /**
   * @param {string} name
   * @param {Session[]} sessions
   */
  constructor( name, sessions ) {
    this.name = name;
    this.sessions = sessions; // [ vis/data/Session ]
  }

}

export default {
  name: 'results',

  components: {
    'loading': Loading,
    'temporal-notification': TemporalNotification,
    'modal-container': ModalContainer,
    'session-editing-box': SessionEditBox,
    'item-selection-box': ItemSelectionBox,
    'gaze-plot': GazePlot,
    'durations': Durations,
    'gaze-replay': GazeReplay,
    'word-replay': WordReplay,
    'students-summary': StudentsSummary,
    'questionnaire-results': QuestionnaireResults,
  },

  mixins: [ ActionError ],

  data() {
    return {
      /** @type {Teacher} */
      teacher: null,
      isLoaded: false,
      /** @type {_VisualizationInitialData} */
      deferredVisualization: null,

      /** @type {Student} */
      editingStudent: null,
      reloadAfterEditing: false,

      /** @type {{text: string, subitems: SelectionBoxItem[]}[]} */
      gradeWithStudents: null,
      /** @type {{text: string, subitems: SelectionBoxItem[], multigroup?: boolean}[]} */
      studentWithSessions: null,
      /** @type {Data} */
      visualization: null,    // vis/data/Data

      /** @type {Class[]} */
      classes: null,  // [ vis/data/Class ]
      /** @type {Student[]} */
      students: [],  // [ vis/data/Student ]

      VISUALIZATIONS: {
        gazePlot: 'GazePlot',
        durations: 'Durations',
        gazeReplay: 'GazeReplay',
        wordReplay: 'WordReplay',
        studentsSummary: 'StudentsSummary',
        questionnaireResults: 'QuestionnaireResults',
      },
    };
  },

  computed: {
    /** @returns {boolean} */
    isGazePlot() {
      return this.deferredVisualization ? this.deferredVisualization.name === this.VISUALIZATIONS.gazePlot : false;
    },
  },

  methods: {

    init() {
      this.teacher = Teacher.instance;
      if ( this.teacher ) {
        this.loadClasses( /** @param {Error | string} err */ err => {
          if ( err ) {
            this.classes = [];
            return this.setError( err, 'Failed to load classes' );
          }

          this.isLoaded = true;
        } );
      }
    },

    /** @param {(err?: string | Error) => void} cb */
    loadClasses( cb ) {
      this.teacher.getClasses( /** @param {Error | string} err; @param {ModelClass[]} classes */ ( err, classes ) => {
        if ( err ) {
          return cb( err );
        }

        /** @type {Class[]} */
        const _classes = [];

        classes.sort( dataUtils.byName );

        classes.forEach( cls => {
          if ( !cls.tasks ) {
            return;
          }

          const tasks = [];
          for ( let taskID in cls.tasks ) {
            tasks.push( new Task( taskID, cls.tasks[ taskID ] ) );
          }

          const _cls = new Class( cls, tasks );
          _classes.push( _cls );

          _cls.loadStudents( cb );
        } );

        this.classes = _classes;
      } );
    },

    checkAccess() {
      if ( !Teacher.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    /** @param {Event} e */
    closeStudentSelectionBox( e ) {
      this.gradeWithStudents = null;
      this.deferredVisualization = null;
    },

    /** @param {Event} e */
    closeSessionSelectionBox( e ) {
      this.studentWithSessions = null;
      this.deferredVisualization = null;
    },

    /** @param {Event} e */
    closeSessionEditingBox( e ) {
      this.editingStudent = null;

      if ( this.reloadAfterEditing ) {
        this.init();
      }

      this.reloadAfterEditing = false;
    },

    /**
     * @param {Student} student 
     * @param {Event} e
     */
    editSessions( student, e ) {
      this.editingStudent = student;
    },

    /**
     * @param {Task} task 
     * @param {string} visualizationName 
     */
    selectTaskStudents( task, visualizationName ) {
      this.deferredVisualization = new _VisualizationInitialData( visualizationName, task.sessions );

      const grade = {
        text: `Students completed "${task.name}"`,
        multiGroup: true,
        /** @type {SelectionBoxItem[]} */
        subitems: [],
      };

      task.students.forEach( student => {
        student.sessions.forEach( session => {
          if ( session.task.id === task.id ) {
            grade.subitems.push( new SelectionBoxItem( {
              id: session.ref.id,
              text: `${dataUtils.sessionDate( session.ref.date )}`,
              selected: false,
              group: student.ref.name,
            } ) );
          }
        } );
      } );

      this.studentWithSessions = [ grade ];
    },

    /**
     * @param {Class} cls 
     * @param {string} visualizationName 
     */
    selectClassStudents( cls, visualizationName ) {
      /** @type {Session[]} */
      const sessions = [];
      cls.students.forEach( student => {
        sessions.push( ...student.sessions );
      } );

      this.deferredVisualization = new _VisualizationInitialData( visualizationName, sessions );

      const grade = {
        text: `students of "${cls.ref.name}"`,
        /** @type {SelectionBoxItem[]} */
        subitems: [],
      };

      cls.students.forEach( student => {
        grade.subitems.push( new SelectionBoxItem( {
          id: student.ref.id,
          text: student.ref.name,
          selected: true,
        } ) );
      } );

      this.gradeWithStudents = [ grade ];
    },

    /**
     * @param {Student} student 
     * @param {string} visualizationName 
     */
    selectSession( student, visualizationName ) {
      if ( student.sessions.length === 1 ) {
        this.visualizeSessions( student.sessions, visualizationName, new Params( {
          student: student.ref.name,
        } ) );
        return;
      }

      this.deferredVisualization = new _VisualizationInitialData( visualizationName, student.sessions );

      const studentWithSessions = {
        text: `Sessions by ${student.ref.name}`,
        /** @type {SelectionBoxItem[]} */
        subitems: [],
      };

      student.sessions.forEach( session => {
        studentWithSessions.subitems.push( new SelectionBoxItem( {
          id: session.ref.id,
          text: `${dataUtils.sessionDate( session.ref.date )}`,
          selected: false,
          group: session.task.name,
        } ) );
      } );

      this.studentWithSessions = [ studentWithSessions ];
    },

    /** @param {{subitems: Object.<string>}} e */
    continueDeferredWithStudents( e ) {
      const sessions = this.deferredVisualization.sessions.filter( session =>
        e.subitems[ session.student.id ]
      );

      const grade = {
        name: this.gradeWithStudents[0].text,
        studentCount: this.gradeWithStudents[0].subitems.length,
      };

      this.visualizeSessions( sessions, this.deferredVisualization.name, new Params( {
        student: e.subitems.length === 1 ? e.subitems[0] : null,
        grade,
      } ) );

      this.closeStudentSelectionBox( null );
    },

    /** @param {{subitems: Object.<string>}} e */
    continueDeferredWithSessions( e ) {
      const sessions = this.deferredVisualization.sessions.filter( session =>
        e.subitems[ session.ref.id ]
      );

      this.visualizeSessions( sessions, this.deferredVisualization.name, new Params( {
        student: sessions.length === 1 ? sessions[0].student.name : null,
        session: e.subitems.length === 1 ? e.subitems[0] : null,
      } ) );

      this.closeSessionSelectionBox( null );
    },

    /** @param {Event} e */
    sessionDeleted( e ) {
      this.reloadAfterEditing = true;
    },

    /**
     * @param {Session[]} sessions
     * @param {string} name
     * @param {Params} params
     */
    visualizeSessions( sessions, name, params ) {
      if ( !sessions || !sessions.length ) {
        return;
      }

      const dataIDs = sessions.map( session => session.ref.data );
      ModelStudent.getData( dataIDs, /** @param {Error} err, @param {ModelData[]} data */( err, data ) => {
        if ( err ) {
          return this.setError( err, 'Failed to load student data' );
        }

        const records = sessions.map( session => new Record( session, data ) );
        this.visualization = new Data( name, records, params );
      } );
    },

    /** 
     * @param {string} visualizationName
     * @returns {boolean}
     */
    isShowing( visualizationName ) {
      return this.visualization ? this.visualization.name === visualizationName : false;
    },

    /** @param {Event} e */
    closeVisualization( e ) {
      this.visualization = null;
    },
  },

  created() {
    console.log( 'Results component created' );
    eventBus.$on( 'logout', () => {
      this.checkAccess();
    } );
    eventBus.$on( 'login', () => {
      this.init();
    } );

    this.checkAccess();
  },

  mounted() {
    this.init();
  },
};
</script>

<style lang="less" scoped>
  .card.is-fullwidth {
    width: 100%;
  }

  .card-header-title {
    color: #fff;
  }
</style>
