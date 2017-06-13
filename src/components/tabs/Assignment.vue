<template lang="pug">
  #assignment
    nav.panel
      p.panel-heading {{ task ? task.name : '' }}

    calib-page(:texts="introTexts" v-if="state === 'calibrate'" @close="calibrate")
    start-page(
      :texts="introTexts"
      :task="task"
      :intro="intro.firstPage"
      :student="student"
      v-if="intro"
      v-show="state === 'start'"
      @close="start"
      @saved="done"
    )
    finished-page(:texts="introTexts" :saving="!isDataSaved" v-if="state === 'finished'" )

    modal-error(:text="errorText" @close="exit")
</template>

<script>
  import Student from '@/model/student.js';

  import gazeTracking from '@/utils/gazeTracking.js';
  import eventBus  from '@/utils/event-bus.js';

  import ModalError from '@/components/widgets/ModalError';
  import CalibPage from '@/components/widgets/CalibPage';
  import StartPage from '@/components/widgets/StartPage';
  import FinishedPage from '@/components/widgets/FinishedPage';

  export default {
    name: 'assignments',

    data() {
      return {
        student: null,
        task: null,
        intro: null,

        state: 'calibrate',
        isDataSaved: false,

        errorText: null,
      };
    },

    components: {
      'modal-error': ModalError,
      'calib-page': CalibPage,
      'start-page': StartPage,
      'finished-page': FinishedPage,
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
              return this.errorText = err;
            }

            this.task = task;

          }).then( value => {
            this.task.getIntro( (err, intro) => {
              if (err) {
                return this.errorText = err;
              }

              this.intro = intro;

              // this.$refs.fullscreen.mozRequestFullScreen();
            });
          });
        }
      },

      makeFullscreen( element ) {
        if(element.requestFullscreen) {
          element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      },

      exit() {
        this.errorText = null;
        this.$router.replace( '/assignments' );
      },

      checkAccess() {
        if (!Student.isLogged) {
          this.$router.replace( '/' );
        }
      },

      calibrate( e ) {
        if (!e.skip) {
          gazeTracking.calibrate();
        }

        this.state = 'start';
      },

      start( e ) {
        console.dir( e );
        if (e.finished) {
          this.state = 'finished';
        }
        else if (e.cancelled) {
          this.state = 'calibrate';
        }
      },

      done( e ) {
        if (!e.err) {
          this.student.taskDone( this.task.cls, e.session, err => {
            if (err) {
              console.log( 'TODO task done', e.err );
            }
          });
        }
        else {
          console.log( 'TODO data saved', e.err );
        }

        this.isDataSaved = true;
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
  }
</script>

<style lang="less" scoped>
</style>