<script>
import dataUtils from '@/utils/data-utils.js';

import { OptionsCreator, OptionGroup, OptionItem } from '@/vis/optionsCreator.js';
import { Painter } from '@/vis/painter.js';
import ReplayTrack from '@/vis/replayTrack2.js';
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

      this.redraw();

      if ( !this.track ) {
        this.track = new ReplayTrack(
          /** @type {HTMLElement} */ (this.$refs.root),
          this.record.data.pages,
          this.painter.offset,
        );
      }

      this.track.setPage( this.pageIndex );
      this.loadAudio( err => {
        if (err) {
          console.error( 'AudioReplay', err );
        }
        else {
          this.audio.play();
        }
      });
    },

    redraw() {
      this.painter.clean();
      this.drawText();
    },

    createTrack() {
    },

    loadAudio( cb ) {
      const page = this.record.data.pages[ this.pageIndex ];
      const audioFile = page.audio;
      
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
          this.track.setTime( (page.ts || 0) + this.audio.currentTime * 1000 );
          if (this.track.fixation) {
            this.updateImages( this.track.fixation.tsSync );
          }
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

    /**
     * @param {number} time
     */
    updateImages( time ) {
      const missingImages = this.currentImages.filter( image => {
        return !this.visibleImages.find( img => img.src === image.src ) && 
                image.shown < time; 
      });
      const imagesToHide = this.currentImages.filter( image => {
        return !!this.visibleImages.find( img => img.src === image.src ) && 
                image.hidden > 0 && image.hidden < time;
      });

      if (missingImages.length > 0 || imagesToHide.legnth > 0) {
        this.visibleImages = this.currentImages
          .filter( image => image.shown <= time && (image.hidden > 0 ? time < image.hidden : true) )
          .map( image => TextPageImage.from( image, { ignoreDisplayCondition: true } ) );
      }
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
    this.audioPlayerProps.visible = true;
    this.audioPlayerProps.toggled = e => { 
      if (!this.audio) {
        return;
      }
      if (e.isPlaying && this.audio.paused) {
        this.audio.play();
      }
      else if (!e.isPlaying && !this.audio.paused) {
        this.audio.pause();
      }
    };
    this.audioPlayerProps.slided = e => { 
      if (this.audio) {
        this.audio.currentTime = e.time;
      }

      this.track.setTime( e.time * 1000 );
    };
  },

  mounted() {
    console.log( 'AudioReplay created' );
  },

  beforeDestroy() {
      if (this.track) {
        this.track.cleanup();
      }
      if (this.audio && !this.audio.paused) {
        this.audio.pause();
      }
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
