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
import Student from '@/model/student.js';

import Data from '@/vis/data/data.js';
import Record from '@/vis/data/record.js';
import Task from '@/vis/data/task.js';
import Class from '@/vis/data/class.js';
import Params from '@/vis/data/params.js';

import ActionError from '@/components/mixins/actionError';

import Loading from '@/components/widgets/Loading';
import TemporalNotification from '@/components/widgets/TemporalNotification';
import ModalContainer from '@/components/widgets/ModalContainer';
import SessionEditBox from '@/components/widgets/SessionEditBox';
import ItemSelectionBox from '@/components/widgets/ItemSelectionBox';

import GazePlot from '@/components/vis/GazePlot';
import Durations from '@/components/vis/Durations';
import GazeReplay from '@/components/vis/GazeReplay';
import WordReplay from '@/components/vis/WordReplay';
import StudentsSummary from '@/components/vis/StudentsSummary';
import QuestionnaireResults from '@/components/vis/QuestionnaireResults';

class _VisualizationInitialData {

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
      teacher: null,
      isLoaded: false,
      deferredVisualization: null,

      editingStudent: null,
      reloadAfterEditing: false,

      gradeWithStudents: null,
      studentWithSessions: null,
      visualization: null,    // vis/data/Data

      classes: null,  // [ vis/data/Class ]
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
    isGazePlot() {
      return this.deferredVisualization ? this.deferredVisualization.name === this.VISUALIZATIONS.gazePlot : false;
    },
  },

  methods: {

    init() {
      this.teacher = Teacher.instance;
      if ( this.teacher ) {
        this.loadClasses( err => {
          if ( err ) {
            this.classes = [];
            return this.setError( err, 'Failed to load classes' );
          }

          this.isLoaded = true;
        } );
      }
    },

    loadClasses( cb ) {
      this.teacher.getClasses( ( err, classes ) => {
        if ( err ) {
          return cb( err );
        }

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

    closeStudentSelectionBox( e ) {
      this.gradeWithStudents = null;
      this.deferredVisualization = null;
    },

    closeSessionSelectionBox( e ) {
      this.studentWithSessions = null;
      this.deferredVisualization = null;
    },

    closeSessionEditingBox( e ) {
      this.editingStudent = null;

      if ( this.reloadAfterEditing ) {
        this.init();
      }

      this.reloadAfterEditing = false;
    },

    editSessions( student, e ) {
      this.editingStudent = student;
    },

    selectTaskStudents( task, visualizationName ) {
      this.deferredVisualization = new _VisualizationInitialData( visualizationName, task.sessions );

      const grade = {
        text: `Students completed "${task.name}"`,
        multiGroup: true,
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

        // No sessions, just student names
        // grade.subitems.push( new SelectionBoxItem( {
        //   id: student.ref.id,
        //   text: student.ref.name,
        //   selected: true,
        // } ) );
      } );

      this.studentWithSessions = [ grade ];

      // No sessions, just student names
      // this.gradeWithStudents = [ grade ];
    },

    selectClassStudents( cls, visualizationName ) {
      const sessions = [];
      cls.students.forEach( student => {
        sessions.push( ...student.sessions );
      } );

      this.deferredVisualization = new _VisualizationInitialData( visualizationName, sessions );

      const grade = {
        text: `students of "${cls.ref.name}"`,
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

      this.closeStudentSelectionBox();
    },

    continueDeferredWithSessions( e ) {
      const sessions = this.deferredVisualization.sessions.filter( session =>
        e.subitems[ session.ref.id ]
      );

      this.visualizeSessions( sessions, this.deferredVisualization.name, new Params( {
        student: sessions.length === 1 ? sessions[0].student.name : null,
        session: e.subitems.length === 1 ? e.subitems[0] : null,
      } ) );

      this.closeSessionSelectionBox();
    },

    sessionDeleted( e ) {
      this.reloadAfterEditing = true;
    },

    // sessions: [ vis/data/Session ]
    // name: String
    // params: vis/data/DataParams
    visualizeSessions( sessions, name, params ) {
      if ( !sessions || !sessions.length ) {
        return;
      }

      const dataIDs = sessions.map( session => session.ref.data );
      Student.getData( dataIDs, ( err, data ) => {
        if ( err ) {
          return this.setError( err, 'Failed to load student data' );
        }

        const records = sessions.map( session => new Record( session, data ) );
        this.visualization = new Data( name, records, params );
      } );
    },

    isShowing( visualizationName ) {
      return this.visualization ? this.visualization.name === visualizationName : false;
    },

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
