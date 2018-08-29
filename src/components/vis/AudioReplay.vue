<script>
import dataUtils from '@/utils/data-utils.js';

import { OptionsCreator, OptionGroup, OptionItem } from '@/vis/optionsCreator.js';
import { Painter } from '@/vis/painter.js';
import ReplayTrack from '@/vis/replayTrack.js';
import Metric from '@/vis/metric.js';

import { TextPageImage } from '@/model/task/textPageImage.js';

import VisPlot from '@/components/vis/VisPlot.vue';

// ts-check-only
import Fixation from '@/model/data/fixation';
import Record from '@/vis/data/record.js';

const UI = {
};

export default {
  name: 'audio-replay',

  mixins: [ VisPlot ],

  data() {
    return {
      /** @type {Painter} */
      painter: null,
      /** @type {ReplayTrack} */
      track: null,
      /** @type {Record} */
      record: this.data.records[0],
      /** @type {HTMLAudioElement} */
      audio: null,
    };
  },

  computed: {
    /** @returns {string} */
    title() {
      return `Audio replay in "${this.record.task.name}" for ${this.data.params.student}`;
    },
  },

  methods: {
    /** @param {Event} e */
    restartPlayer( e ) {
      this.stop();
      this.start();

      if (this.audio) {
        this.audio.play();
      }
    },

    /** @param {Event} e */
    togglePlayer( e ) {
      if (this.track) {
        this.isPlayerPaused = !this.isPlayerPaused;
        this.track.togglePause();

        if (this.audio) {
          if (this.isPlayerPaused) {
            this.audio.pause();
          }
          else {
            this.audio.play();
          }
        }
      }
    },

    changePage() {
      this.isWarningMessageVisible = false;
      this.visibleImages = this.currentImages
        .filter( image => image.on === TextPageImage.EVENT.none)
        .map( image => TextPageImage.from( image ) );

      if ( !this.painter ) {
        this.painter = new Painter( /** @type {HTMLCanvasElement}*/ (this.$refs.canvas), {
          syllab: this.defaultFeedback.syllabification,
        } );
        this.painter.setScreenSize( this.data.records[0].session.screen );
      }

      if ( this.track ) {
        this.stop();
        this.loadAudio( err => {
          console.error( 'AudioReplay', err );
          this.start();
        });
      }
    },

    redraw() {
      this.painter.clean();
      this.drawText();
    },

    createTrack() {
      ReplayTrack.resetColors();

      this.track = new ReplayTrack(
        /** @type {HTMLElement} */ (this.$refs.root),
        this.record.student.name,
        this.record.data.pages,
        this.painter.offset,
      );
    },

    loadAudio( cb ) {
      const audioFile = this.record.data.pages[ this.pageIndex ].audio;
      console.log( 'AudioReplay', 'loading audio...' );
      if (audioFile) {
        // const audioUrl = URL.createObjectURL( audioBlob );
        this.audio = new Audio( audioFile );
        this.audio.autoplay = true;
        this.audio.addEventListener( 'loadeddata', e => {
          this.audioPlayerProps.duration = (e.target || e.path[0]).duration;
          cb();
        });
        this.audio.addEventListener( 'timeupdate', e => {
          this.audioPlayerProps.time = (e.target || e.path[0]).currentTime;
        });
        this.audio.addEventListener( 'play', e => {
          this.audioPlayerProps.playing = !(e.target || e.path[0]).paused;
        });
        this.audio.addEventListener( 'pause', e => {
          this.audioPlayerProps.playing = !(e.target || e.path[0]).paused;
        });
        this.audio.addEventListener( 'ended', e => {
          (e.target || e.path[0]).currentTime = 0;
        });
      }
      else {
        cb( 'no audio' );
      }
    },

    stop() {
      if (this.track) {
        this.track.stop();
      }
      if (this.audio) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
    },

    start() {
      this.isPlayerPaused = false;

      this.redraw();

      this.track.start(
        this.pageIndex, {  // callbacks
          fixation: ( /** @type {Fixation} */ fixation, /** @type {HTMLElement} */ pointer ) => {
            const missingImages = this.currentImages.filter( image => {
              return !this.visibleImages.find( img => img.src === image.src ) && 
                      image.shown < fixation.tsSync; 
            });
            const imagesToHide = this.currentImages.filter( image => {
              return !!this.visibleImages.find( img => img.src === image.src ) && 
                      image.hidden > 0 && image.hidden < fixation.tsSync;
            });

            if (missingImages.length > 0 || imagesToHide.legnth > 0) {
              this.visibleImages = this.currentImages
                .filter( image => image.shown <= fixation.tsSync && (image.hidden > 0 ? fixation.tsSync < image.hidden : true) )
                .map( image => TextPageImage.from( image, { ignoreDisplayCondition: true } ) );
            }
          },
          completed: /** @param {string} reason */ reason => {
            this.isWarningMessageVisible = !!reason;
            this.isPlayerPaused = true;
          },
        }
      );
    },

    drawText() {
      this.painter.setFont( this.defaultSession.font );
      this.painter.drawWords( this.currentPages[0].text, Object.assign( { 
        colorMetric: Metric.Type.NONE, 
      }, this.commonUI, {
        drawWordFrame: false,
      } ) );
    },
  },

  created() {
    // options representation for editor
    /*
    options: {
      audioReplay: new OptionGroup({
        id: 'audioReplay',
        title: 'Audio Replay',
        options: OptionsCreator.createOptions( {
          // nothing is here
        }, UI ),
        defaults: OptionsCreator.createDefaults( UI ),
      }),
    },*/
    this.audioPlayerProps.visible = true;
    this.audioPlayerProps.toggled = e => { this.togglePlayer(); }
    this.audioPlayerProps.slided = e => { 
      if (this.audio) {
        this.audio.currentTime = e.time;
        // TODO: slide gaze track
      }
    }
  },

  mounted() {
    console.log( 'AudioReplay created' );

    this.createTrack();
    this.loadAudio( err => {
      if (err) {
        console.error( 'AudioReplay', err );
      }
      this.start();
    });
  },

  beforeDestroy() {
    this.stop();
  },
};
</script>

<style lang="less">
  .track-pointer {
    position: absolute;
    height: 8px;
    width: 8px;
    background-color: #f80;
    border: 1px solid black;
    border-radius: 4px;
    opacity: 0.7;

    &.invisible {
        display: none;
    }
  }
</style>
