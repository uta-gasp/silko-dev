<template lang="pug">
  #assignment
    .panel
      p.panel-heading {{ task ? task.name : '' }}

    calib-page(:texts="introTexts" v-if="state === STATES.calibrate" @close="calibrate")
    start-page(
      :texts="introTexts"
      :task="task"
      :intro="intro.firstPage"
      :student="student"
      v-if="intro"
      v-show="state === STATES.start"
      @close="startPageClosed"
      @saved="gazeDataSaved"
    )
    questionnaire-page(
      :questionnaire="task.questionnaire"
      :longGazedWords="longGazedWords"
      v-if="state === STATES.questionnaire"
      @finished="questionnaireDone")
    finished-page(:texts="introTexts" :saving="!isDataSaved" v-if="state === STATES.finished" )

    modal-error(:text="errorText" @close="exit")
</template>

<script>
  import Student from '@/model/student.js';

  import gazeTracking from '@/utils/gazeTracking.js';
  import eventBus from '@/utils/event-bus.js';

  import ModalError from '@/components/widgets/ModalError';

  import CalibPage from '@/components/task/CalibPage';
  import StartPage from '@/components/task/StartPage';
  import QuestionnairePage from '@/components/task/QuestionnairePage';
  import FinishedPage from '@/components/task/FinishedPage';

  const STATES = {
    calibrate: { },
    start: { },
    questionnaire: { },
    finished: { }
  };

  export default {
    name: 'assignments',

    components: {
      'modal-error': ModalError,
      'calib-page': CalibPage,
      'start-page': StartPage,
      'questionnaire-page': QuestionnairePage,
      'finished-page': FinishedPage,
    },

    data() {
      return {
        student: null,
        task: null,
        intro: null,

        state: STATES.calibrate,
        isDataSaved: false,

        errorText: null,
        keys: null,
        questionnaire: null,
        longGazedWords: [],

        STATES,
      };
    },

    computed: {

      introTexts() {
        return this.intro ? this.intro : {};
      }
    },

    methods: {

      init() {
        this.student = Student.instance;
        if (this.student) {
          const taskID = this.student.assignments[ this.$route.params.id ];
          if (!taskID) {
            return this.$router.replace( '/assignments' );
          }

          this.student.loadTask( taskID, (err, task ) => {
            if (err) {
              this.errorText = err;
              return;
            }

            this.task = task;
          }).then( value => {
            this.task.getIntro( (err, intro) => {
              if (err) {
                this.errorText = err;
                return;
              }

              this.intro = intro;

              // this.$refs.fullscreen.mozRequestFullScreen();
            });
          });
        }
      },

      checkAccess() {
        if (!Student.isLogged) {
          this.$router.replace( '/' );
        }
      },

      exit( e ) {
        this.errorText = null;
        this.$router.replace( '/assignments' );
      },

      calibrate( e ) {
        if (!e.skip) {
          gazeTracking.calibrate();
        }

        this.state = STATES.start;
      },

      startPageClosed( e ) {
        if (e.finished) {
          if (this.task.questionnaire && this.task.questionnaire.length) {
            this.longGazedWords = e.longGazedWords;
            this.state = STATES.questionnaire;
          }
          else {
            this.state = STATES.finished;
          }
        }
        else if (e.cancelled) {
          this.state = STATES.calibrate;
        }
      },

      gazeDataSaved( e ) {
        if (!e.err) {
          this.keys = e.keys;
          if (this.state === STATES.finished) {
            this.taskDone();
          }
        }
        else {
          console.log( 'TODO data saved', e.err );
        }

        this.isDataSaved = true;
      },

      questionnaireDone( e ) {
        this.questionnaire = e.questionnaire;
        this.state = STATES.finished;

        this.taskDone();
      },

      taskDone() {
        if (!this.keys) {
          return;
        }

        if (this.questionnaire) {
          this.student.addQuestionnaire( this.keys.data, this.questionnaire, err => {
            if (err) {
              console.log( 'TODO questionnaire done', err );
            }
          });
        }

        this.student.taskDone( this.task.cls, this.keys.session, err => {
          if (err) {
            console.log( 'TODO task done', err );
          }
        });
      }
    },

    created() {
      console.log('Assignment component created');
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
</style>
