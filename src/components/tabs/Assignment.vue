<template lang="pug">
  #assignment
    .panel
      p.panel-heading {{ task ? task.name : '' }}

    calib-page(:texts="introTexts" v-if="state === STATES.calibrate" @close="calibrate")
    start-page(
      :texts="introTexts"
      :task="task"
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
import Intro from '@/model/intro.js';

import gazeTracking from '@/utils/gazeTracking.js';
import eventBus from '@/utils/event-bus.js';

import ModalError from '@/components/widgets/ModalError.vue';

import CalibPage from '@/components/task/CalibPage.vue';
import StartPage from '@/components/task/StartPage.vue';
import QuestionnairePage from '@/components/task/QuestionnairePage.vue';
import FinishedPage from '@/components/task/FinishedPage.vue';

// ts-check-only
import Task from '@/model/task.js';
import Question from '@/model/session/question.js';

/**
 * @typedef {Question} AnsweredQuestion
 * @property {string} answer
 */

const STATES = {
  calibrate: { },
  start: { },
  questionnaire: { },
  finished: { },
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
      /** @type {Student} */
      student: null,
      /** @type {Task} */
      task: null,
      /** @type {Intro} */
      intro: null,

      state: STATES.calibrate,
      isDataSaved: false,

      /** @type {string?} */
      errorText: null,

      /** @type {{data: string, session: string}} */
      keys: null,
      /** @type {AnsweredQuestion[]} */
      questionnaire: null,
      /** @type {string[]} */
      longGazedWords: [],

      STATES,
    };
  },

  computed: {
    /** @returns {Intro | any} */
    introTexts() {
      return this.intro ? this.intro : {};
    },
  },

  methods: {

    init() {
      this.student = Student.instance;
      if ( this.student ) {
        let taskID;
        if ( Student.MULTICLASS ) {
          taskID = this.$route.params.id;
          if ( !( taskID in this.student.assignments ) ) {
            return this.$router.replace( 'assignments' );
          }
        }
        else {
          taskID = this.student.assignments[ this.$route.params.id ];
          if ( !taskID ) {
            return this.$router.replace( 'assignments' );
          }
        }

        this.student.loadTask( taskID, ( err, task ) => {
          if ( err ) {
            this.errorText = err;
            return;
          }
          this.task = task;
        } ).then( _ => {
          this.task.getIntro( ( err, intro ) => {
            if ( err ) {
              this.errorText = err.message ? err.message : err;
            }
            else if ( intro ) {
              this.intro = intro;
            }
            else {
              this.intro = new Intro();
            }
          } );
        } );
      }
    },

    checkAccess() {
      if ( !Student.isLogged ) {
        this.$router.replace( '/' );
      }
    },

    exit( e ) {
      this.errorText = null;
      this.$router.replace( '/assignments' );
    },

    calibrate( e ) {
      if ( !e.skip ) {
        gazeTracking.calibrate();
      }

      this.state = STATES.start;
    },

    startPageClosed( e ) {
      if ( e.finished ) {
        if ( this.task.questionnaire && this.task.questionnaire.length ) {
          this.longGazedWords = e.longGazedWords;
          this.state = STATES.questionnaire;
        }
        else {
          this.state = STATES.finished;
        }
      }
      else if ( e.cancelled ) {
        this.state = STATES.calibrate;
      }
    },

    gazeDataSaved( e ) {
      if ( !e.err ) {
        this.keys = e.keys;
        if ( this.state === STATES.finished ) {
          this.taskDone();
        }
      }
      else {
        this.errorText = e.err;
      }

      this.isDataSaved = true;
    },

    questionnaireDone( e ) {
      this.questionnaire = e.questionnaire;
      this.state = STATES.finished;

      this.taskDone();
    },

    taskDone() {
      if ( !this.keys ) {
        return;
      }

      if ( this.questionnaire ) {
        this.student.addQuestionnaire( this.keys.data, this.questionnaire, err => {
          if ( err ) {
            this.errorText = err;
          }
        } );
      }

      const id = Student.MULTICLASS ? this.task.id : this.task.cls;
      this.student.taskDone( id, this.keys.session, err => {
        if ( err ) {
          this.errorText = err;
        }
      } );
    },
  },

  created() {
    console.log( 'Assignment component created' );
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
</style>
