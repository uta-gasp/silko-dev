<template lang="pug">
  #results.section
    .container(v-if="!classes.length")
      i No data was recorded yet
    //- .tile.is-ancestor(v-else)
    nav.panel(v-for="cls in classes" :key="cls.ref.id")
      .panel-block.is-marginless.is-paddingless
        //- .tile.is-parent(v-for="cls in classes" :key="cls.ref.id")
          //- .tile.is-child
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
              tbody
                tr(v-for="task in cls.tasks" :key="task.id")
                  td {{ task.name }}
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectStudents( task, VISUALIZATIONS.durations )") Durations
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectStudents( task, VISUALIZATIONS.gazeReplay )") Gaze replay
                  td.is-narrow
                    button.button.is-primary(:disabled="!isLoaded" @click="selectStudents( task, VISUALIZATIONS.wordReplay )") Word replay

            table.table(v-if="cls.students.length")
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

    modal-editor-container(
      v-if="gradeWithStudents"
      :title="gradeWithStudents[0].name"
      @close="closeStudentSelectionBox")
      student-select-box(:grades="gradeWithStudents" @accept="continueDeferredWithStudents")

    modal-editor-container(
      v-if="studentWithSessions"
      :title="studentWithSessions[0].name"
      @close="closeSessionSelectionBox")
      session-select-box(:students="studentWithSessions" :multiple="false" @accept="continueDeferredWithSessions")

    modal-editor-container(
      v-if="editingStudent"
      :title="`Sessions of ${editingStudent.ref.name}`"
      @close="closeSessionEditingBox")
      session-editing-box(:student="editingStudent" @deleted="sessionDeleted")

    gaze-plot(v-if="isShowing( VISUALIZATIONS.gazePlot )" :data="visualization" @close="closeVisualization")

    durations(v-if="isShowing( VISUALIZATIONS.durations )" :data="visualization" @close="closeVisualization")

    gaze-replay(v-if="isShowing( VISUALIZATIONS.gazeReplay )" :data="visualization" @close="closeVisualization")

    word-replay(v-if="isShowing( VISUALIZATIONS.wordReplay )" :data="visualization" @close="closeVisualization")

    students-summary(v-if="isShowing( VISUALIZATIONS.studentsSummary )" :data="visualization" @close="closeVisualization")

</template>

<script>
  import eventBus from '@/utils/event-bus.js';
  import dataUtils from '@/utils/data-utils.js';

  import Teacher from '@/model/teacher.js';
  import Student from '@/model/student.js';

  import ModalEditorContainer from '@/components/widgets/ModalEditorContainer';
  import StudentSelectBox from '@/components/widgets/StudentSelectBox';
  import SessionSelectBox from '@/components/widgets/SessionSelectBox';
  import SessionEditBox from '@/components/widgets/SessionEditBox';

  import GazePlot from '@/components/vis/GazePlot';
  import Durations from '@/components/vis/Durations';
  import GazeReplay from '@/components/vis/GazeReplay';
  import WordReplay from '@/components/vis/WordReplay';
  import StudentsSummary from '@/components/vis/StudentsSummary';

  class _Session {

    constructor( ref, student, task, cls ) {
      this.ref = ref;           // Session
      this.student = student;   // Student
      this.task = { id: task.id, name: task.name };
      this.cls = { id: cls.id, name: cls.name };
    }

}

  class _Student {

    constructor( ref ) {
      this.ref = ref;     // Student
      this.sessions = []; // [ _Session ]
    }

}

  class _Task {

    constructor( id, name ) {
      this.id = id;
      this.name = name;
      this.students = new Set();  // ( _Student )
      this.sessions = [];         // [ _Session ]
    }

}

  class _Class {

    constructor( ref, tasks ) {
      this.ref = ref;     // Class
      this.tasks = tasks; // [ _Task ]
      this.students = []; // [ _Student ]
    }

    loadInfo( cb ) {
      this._loadStudents( cb );
    }

    _loadStudents( cb ) {
      this.ref.getStudents( (err, students) => {
        if (err) {
          return cb( err );
        }

        students.sort( dataUtils.byName );

        students.forEach( student => {
          this._loadStudentSessions( student, cb );
        });
      });
    }

    _loadStudentSessions( student, cb ) {
      student.getSessions( (err, sessions) => {
        if (err) {
          return cb( err );
        }

        const _student = new _Student( student );

        sessions.forEach( session => {
          const task = this.tasks.find( task => task.id === session.task );
          if (!task) {
            return;
          }

          const _session = new _Session( session, student, task, this.ref );
          task.sessions.push( _session );
          task.students.add( _student );
          _student.sessions.push( _session );
        });

        if (_student.sessions.length) {
          this.students.push( _student );
        }

        cb();
      });
    }

}

  class _Record {

    constructor( session, data ) {
      this.student = session.student;
      this.session = session.ref;
      this.task = session.task;
      this.cls = session.cls;
      this.data = data.find( item => item.id === session.ref.data );
    }

}

  class _VisualizationInitialData {

    constructor( name, sessions ) {
      this.name = name;
      this.sessions = sessions;
    }

}

  export default {
    name: 'results',

    components: {
      'modal-editor-container': ModalEditorContainer,
      'student-select-box': StudentSelectBox,
      'session-select-box': SessionSelectBox,
      'session-editing-box': SessionEditBox,
      'gaze-plot': GazePlot,
      'durations': Durations,
      'gaze-replay': GazeReplay,
      'word-replay': WordReplay,
      'students-summary': StudentsSummary
    },

    data() {
      return {
        teacher: null,
        isLoaded: false,
        deferredVisualization: null,

        editingStudent: null,
        reloadAfterEditing: false,

        gradeWithStudents: null,
        studentWithSessions: null,
        visualization: null,

        classes: [],  // [ _Class ]
        students: [],  // [ _Student ]

        VISUALIZATIONS: {
          gazePlot: 'GazePlot',
          durations: 'Durations',
          gazeReplay: 'GazeReplay',
          wordReplay: 'WordReplay',
          studentsSummary: 'StudentsSummary',
        }
      };
    },

    methods: {

      init() {
        this.teacher = Teacher.instance;
        if (this.teacher) {
          this.loadClasses( err => {
            if (err) {
              return console.log( 'TODO handle error', err );
            }

            this.isLoaded = true;
          });
        }
      },

      loadClasses( cb ) {
        this.teacher.getClasses( (err, classes) => {
          if (err) {
            return cb( err );
          }

          const _classes = [];

          classes.sort( dataUtils.byName );

          classes.forEach( cls => {
            if (!cls.tasks) {
              return;
            }

            const tasks = [];
            for (let taskID in cls.tasks) {
              tasks.push( new _Task( taskID, cls.tasks[ taskID ] ) );
            }

            const _cls = new _Class( cls, tasks );
            _classes.push( _cls );

            _cls.loadInfo( cb );
          });

          this.classes = _classes;
        });
      },

      checkAccess() {
        if (!Teacher.isLogged) {
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

        if (this.reloadAfterEditing) {
          this.init();
        }

        this.reloadAfterEditing = false;
      },

      editSessions( student ) {
        this.editingStudent = student;
      },

      selectStudents( task, deferredVisualizationName ) {
        this.deferredVisualization = new _VisualizationInitialData( deferredVisualizationName, task.sessions );

        const grade = {
          name: `Students completed "${task.name}"`,
          students: []
        };

        task.students.forEach( student => {
          grade.students.push({
            ref: student.ref,
            selected: true
          });
        });

        this.gradeWithStudents = [ grade ];
      },

      selectClassStudents( cls, deferredVisualizationName ) {
        const sessions = [];
        cls.students.forEach( student => {
          sessions.push( ...student.sessions );
        });

        this.deferredVisualization = new _VisualizationInitialData( deferredVisualizationName, sessions );

        const grade = {
          name: `Students of "${cls.ref.name}"`,
          students: []
        };

        cls.students.forEach( student => {
          grade.students.push({
            ref: student.ref,
            selected: true
          });
        });

        this.gradeWithStudents = [ grade ];
      },

      selectSession( student, deferredVisualizationName ) {
        if (student.sessions.length === 1) {
          this.visualizeSessions( student.sessions, deferredVisualizationName, {
            student: student.ref.name
          });
          return;
        }

        this.deferredVisualization = new _VisualizationInitialData( deferredVisualizationName, student.sessions );

        const studentWithSessions = {
          name: `Sessions of ${student.ref.name}`,
          sessions: []
        };

        student.sessions.forEach( session => {
          studentWithSessions.sessions.push({
            ref: session.ref,
            task: session.task.name,
            selected: false
          });
        });

        this.studentWithSessions = [ studentWithSessions ];
      },

      continueDeferredWithStudents( e ) {
        const sessions = this.deferredVisualization.sessions.filter( session =>
          e.students[ session.student.id ]
        );

        this.visualizeSessions( sessions, this.deferredVisualization.name, {
          student: e.students.length === 1 ? e.students[0] : null
        });

        this.closeStudentSelectionBox();
      },

      continueDeferredWithSessions( e ) {
        const sessions = this.deferredVisualization.sessions.filter( session =>
          e.sessions[ session.ref.id ]
        );

        this.visualizeSessions( sessions, this.deferredVisualization.name, {
          student: sessions.length === 1 ? sessions[0].student.name : null,
          session: e.sessions.length === 1 ? e.sessions[0] : null
        });

        this.closeSessionSelectionBox();
      },

      sessionDeleted( e ) {
        this.reloadAfterEditing = true;
      },

      visualizeSessions( sessions, name, params ) {
        if (!sessions || !sessions.length) {
          return;
        }

        params.grade = this.gradeWithStudents ? this.gradeWithStudents[0] : null;

        const dataIDs = sessions.map( session => session.ref.data );
        Student.getData( dataIDs, (err, data) => {
          if (err) {
            return;
          }

          const records = sessions.map( session => new _Record( session, data ) );
          const visSpecData = this[ 'create' + name ]( records, params );

          const r = records[0];
          const props = {
            speech: r.session.feedbacks.speech,
            syllab: r.session.feedbacks.syllabification,
          };
          this.visualization = Object.assign( { name, records, props }, visSpecData );
        });
      },

      showStudentsSummary( cls ) {
        console.log('summary');
      },

      createGazePlot( records ) {
        const r = records[0];
        return {
          title: `${r.student.name} reading "${r.task.name}"`,
        };
      },

      createDurations( records, params ) {
        const r = records[0];
        const student = params.student ? ` for ${params.student}` : '';
        return {
          title: `Word reading durations in "${r.task.name}"${student}`,
        };
      },

      createGazeReplay( records, params ) {
        const r = records[0];
        const student = params.student ? ` for ${params.student}` : '';
        return {
          title: `Gaze replay in "${r.task.name}"${student}`,
        };
      },

      createWordReplay( records, params ) {
        const r = records[0];
        const student = params.student ? ` for ${params.student}` : '';
        return {
          title: `Word replay in "${r.task.name}"${student}`
       };
      },

      createStudentsSummary( records, params ) {
        return {
          title: `${params.grade.students.length} students from ${params.grade.name}`
        };
      },

      isShowing( visualizationName ) {
        return this.visualization ? this.visualization.name === visualizationName : false;
      },

      closeVisualization( e ) {
        this.visualization = null;
      },
    },

    created() {
      console.log('Results component created');
      eventBus.$on( 'logout', () => {
        this.checkAccess();
      });
      eventBus.$on( 'login', () => {
        this.init();
      });

      this.checkAccess();
    },

    mounted() {
      this.init();
    }
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
