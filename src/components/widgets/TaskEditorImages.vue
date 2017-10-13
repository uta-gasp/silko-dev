<template lang="pug">
  #task-editor-images
    section.top-only
      table.table(v-if="images.length")
        thead
          tr
            th Preview
            th Name
            th Page
            th Location
            th On-event
            th Off-event
            th
        tbody
          tr(v-for="(image, index) in images" :key="index")
            td
              p.image.is-64x64
                img(v-if="canShow( image )" :src="getLink( image )")
            td {{ getImageName( image ) }}
            td {{ getImagePage( image ) }}
            td {{ image.location }}
            td
              .event-name {{ formatEventName( image.on ) }}
              .event-param {{ formatEventParam0( image.on ) }}
              .event-param {{ formatEventParam1( image.on ) }}
            td
              .event-name {{ formatEventName( image.off ) }}
              .event-param {{ formatEventParam0( image.off ) }}
            td
              button.button.is-danger(
                title="Remove the image"
                @click="remove( image )")
                i.fa.fa-remove
      section(v-else)
        i No images

    section.absolute-parent
      .has-text-centered
        section.is-fullwidth.is-dropzone(
            :class="{ 'is-dragover': isDraggingFileOverDropzone }"
            @drag.stop.prevent=""
            @dragstart.stop.prevent="isDraggingFileOverDropzone = false"
            @dragend.stop.prevent="isDraggingFileOverDropzone = false"
            @dragleave.stop.prevent="isDraggingFileOverDropzone = false"
            @dragenter.stop.prevent="isDraggingFileOverDropzone = true"
            @dragover.stop.prevent="isDraggingFileOverDropzone = true"
            @drop.stop.prevent="dropFile($event)")
          .file.is-centered.is-boxed
            label.file-label
              input.file-input(type="file" @change="selectFile($event)")
              span.file-cta
                span.file-icon
                  i.fa.fa-upload
                span.file-label Choose an image…
                span.help or drag it here

      div.sticked(:class="{ 'at-top': !images.length, 'at-bottom': images.length }" v-if="selectedFile")
        article.media
          figure.media-left
            p.image.is-64x64
              img(:src="getImageURL( selectedFile )")
          .media-content
            .content
              div
                strong {{ selectedFile.name }}
              div
                small {{ selectedFile.size }} bytes
              progress.progress.is-small.is-primary(v-show="isUploading" max="100" :value="uploadProgress")
          .media-right
            .field
              button.button.is-primary(@click="uploadImage" :disabled="isUploading || !hasValidMeta") Upload
              button.button(@click="cancel" :disabled="isUploading") Cancel
        article
          .field.is-horizontal
            .field-label.is-normal Page
            .field-body
              .select
                select(v-model="page")
                  option(value="-1") any
                  option(v-for="(page, index) in task.pages" :key="index" :value="index") {{ index + 1 }}
          .field.is-horizontal
            .field-label.is-normal Location
            .field-body
              .select
                select(v-model="location")
                  option(value="left") left
                  option(value="bottom") bottom
                  option(value="top") top
          .field.is-horizontal
            .field-label.is-normal Show
            .field-body
              .select
                select(v-model="on")
                  option(value="none") initially
                  option(value="fixation") on fixation
              .field.is-horizontal(v-show="on === 'fixation'")
                .field-label.is-normal.is-inner-label.no-wrap at
                .field-body.text-container
                  input.input(type="text" :value="onParams[0]" @input="paramChangeHandler( onParams, 0, $event )")
                .field-label.is-normal.is-inner-label.no-wrap longer than
                .field-body.number-container
                  input.input.is-number(type="text" :value="onParams[1]" @input="paramChangeHandler( onParams, 1, $event )")
                .field-label.is-normal.is-inner-label.no-wrap ms
          .field.is-horizontal
            .field-label.is-normal Hide
            .field-body
              .select
                select(v-model="off")
                  option(value="none") never
                  option(value="image") when other image is shown
                  option(value="delay") after
              .field.is-horizontal(v-show="off === 'delay'")
                .field-body.number-container
                  input.input.is-number(type="text" :value="offParams[0]" @input="paramChangeHandler( offParams, 0, $event )")
                .field-label.is-normal.is-inner-label.no-wrap sec

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}

</template>

<script>
import Task from '@/model/task.js';
import TextPageImage from '@/model/task/textPageImage.js';

import ActionError from '@/components/mixins/actionError';

import TemporalNotification from '@/components/widgets/TemporalNotification';

export default {
  name: 'task-editor-images',

  components: {
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError ],

  data() {
    return {
      images: [],

      selectedFile: null,
      uploadProgress: -1,

      // meta
      page: '-1',
      location: 'bottom',
      on: 'none',
      onParams: ['', 1000],
      off: 'none',
      offParams: [1],

      isDraggingFileOverDropzone: false,
    };
  },

  props: {
    task: {
      type: Object,
      default: () => { return {}; },
    },
  },

  computed: {
    model() {
      return this.images;
    },

    isUploading() {
      return this.uploadProgress >= 0;
    },

    hasValidMeta() {
      return (this.on === 'fixation' ? this.onParams.every( value => !!value ) : true) &&
             (this.off === 'delay' ? this.offParams.every( value => !!value ) : true);
    },
  },

  watch: {
    images() { this.$emit( 'input', this.model ); },
  },

  methods: {
    listImages() {
      const images = [];

      this.task.pages.forEach( (page, index) => {
        if (!page.images) {
          return;
        }

        page.images.forEach( image => {
          images.push( Object.assign( { page: index }, image ) );
        });
      });

      this.images = images;
    },

    remove( index ) {
      this.images.splice( index, 1 );
      // TODO fire event
      // this.$emit( 'input', this.model );
    },

    getImageURL( file ) {
      return window.URL.createObjectURL( file );
    },

    canShow( image ) {
      return !!image.file || !!image.src;
    },

    getLink( image ) {
      return image.file ? this.getImageURL( image.file ) : image.src;
    },

    getImageName( image ) {
      if (image.file) {
        return image.file.name;
      }
      else if (image.src) {
        const splitter = Task.FILE_ID_SPLITTER;
        const parts = image.src.split( splitter );
        parts.shift();
        return parts.join( splitter );
      }
      else {
        return '-';
      }
    },

    getImagePage( image ) {
      return image.page < 0 ? 'any' : (image.page + 1);
    },

    formatEventName( event ) {
      if( event.name === 'none' ) {
        return '-';
      }
      else  if (event.name === 'fixation') {
        return `fixation on word`;
      }
      else {
        return event.name;
      }
    },

    formatEventParam0( event ) {
      if( event.name === 'none' ||
          event.name === 'image' ) {
        return '';
      }
      else  if (event.name === 'fixation') {
        return `"${event.params[0]}"`;
      }
      else if (event.name === 'delay') {
        return `${event.params[0]} seconds`;
      }
      else {
        return event.params.join();
      }
    },

    formatEventParam1( event ) {
      if (event.name === 'fixation') {
        return `longer that ${event.params[1]} ms`;
      }
      else {
        return '';
      }
    },

    dropFile( e ) {
      this.isDraggingFileOverDropzone = false
      const dt = e.dataTransfer;
      const files = dt.files;
      this.selectFile( { target: { files } } );
    },

    selectFile( e ) {
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      else if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        return this.setError( 'Only JPEG and PNG images are supported' );
      }
      else {
        this.selectedFile = file;
      }
    },

    uploadImage( e ) {
      this.uploadProgress = 0;

      const image = new TextPageImage({
        page: this.page,
        location: this.location,
        on: {
          name: this.on,
          params: this.onParams,
        },
        off: {
          name: this.off,
          params: this.offParams,
        },
      });

      this.task.uploadImage( this.selectedFile, image.meta(),
        percentage => {
          this.uploadProgress = percentage;
        },
        (err, url) => {
          this.uploadProgress = -1;

          if (err) {
            this.setError( err, 'Cannot upload the file' );
          }
          else {
            // TODO fire event
            // this.$emit( 'input', this.model );
            image.src = url;
            image.file = this.selectedFile;
            this.images.push( image );

            this.selectedFile = null;
          }
        }
      );
    },

    cancel( e ) {
      this.selectedFile = null;
    },

    paramChangeHandler( array, index, e ) {
      array.splice( index, 1, e.target.value);
    }
  },

  created() {
    this.listImages();
  },
};
</script>

<style lang="less" scoped>
  #task-editor-images {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    max-height: 27em;
  }

  .absolute-parent {
    position: relative;
  }

  .top-only {
    overflow-y: auto;
  }

  .table td {
    padding-top: 0;
    padding-bottom: 0;
  }

  .event-name {

  }

  .event-param {
    font-size: 9pt;
  }

  .is-dropzone {
    background-color: white;
    outline: 2px dashed #aaa;
    outline-offset: -10px;
    padding: 1em;
  }

  .is-dragover {
    background-color: #e4e2e0;
  }

  .sticked {
    position: absolute;
    left: 0;
    right: 0;

    background-color: #eee;
    padding: 0.5em;
    border: 1px solid #aaa;
    border-radius: 5px;

    &.at-top {
      top: 0;
    }

    &.at-bottom {
      bottom: 0;
    }
  }

  .field:not(:last-child) {
    margin-bottom: 0.25em;
  }

  .no-wrap {
    white-space: nowrap;
  }

  .number-container {
    flex-grow: 0;
  }

  .text-container {
    flex-grow: 3;
  }

  .is-number {
    width: 4rem;
  }

  .is-inner-label {
    margin-left: 0.75rem;
    margin-right: 0.75rem;
    flex-grow: 0;
  }
</style>
