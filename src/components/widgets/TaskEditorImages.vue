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
            td {{ formatEvent( image.on ) }}
            td {{ formatEvent( image.off ) }}
            td
              button.button.is-danger(
                title="Remove the image"
                @click="remove( image )")
                i.fa.fa-remove
      section(v-else)
        i No images

    section.absolute-parent
      .has-text-centered
        section.section.is-fullwidth.is-dropzone(
            :class="{ 'is-dragover': isDraggingFileOverDropzone }"
            @drag.stop.prevent=""
            @dragstart.stop.prevent=""
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

      div.sticked-to-bottom(v-if="selectedFile")
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
              button.button.is-primary(@click="uploadImage" :disabled="isUploading") Upload
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
                .field-label.is-normal.is-inner-label.no-wrap longer than
                .field-body.number-container
                  input.input.is-number(type="text" v-model="onParam")
                .field-label.is-normal.is-inner-label.no-wrap ms
          .field.is-horizontal
            .field-label.is-normal Hide
            .field-body
              .select
                select(v-model="off")
                  option(value="none") never
                  option(value="image") when other image is shown
                  option(value="delay") after
              .field.is-horizontal(v-show="off === 'after'")
                .field-body.number-container
                  input.input.is-number(type="text" v-model="offParam")
                .field-label.is-normal.is-inner-label.no-wrap sec

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}

</template>

<script>
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
      onParam: 1000,
      off: 'none',
      offParam: 1,

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
        const parts = image.src.split( '_' );
        return parts[ parts.length - 1 ];
      }
      else {
        return '-';
      }
    },

    getImagePage( image ) {
      return image.page < 0 ? 'any' : (image.page + 1);
    },

    formatEvent( event ) {
      if( event.event === 'none' ) {
        return '-';
      }
      else {
        return event.event;
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

      const meta = {
        page: this.page,
        location: this.location,
        on: this.on,
        onParam: this.onParam,
        off: this.off,
        offParam: this.offParam,
      };

      this.task.uploadImage( this.selectedFile, meta,
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
            const image = new TextPageImage({
              src: url,
              page: meta.page,
              location: meta.location,
              on: {
                event: this.on,
                param: this.onParam,
              },
              off: {
                event: this.off,
                param: this.offParam,
              },
            });

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

  .field:not(:last-child) {
    margin-bottom: 0.25em;
  }

  .is-inner-label {
    margin-left: 0.75rem;
    margin-right: 0.75rem;
    flex-grow: 0;
  }

  .number-container {
    flex-grow: 0;
  }

  .is-number {
    width: 4rem;
  }

  .no-wrap {
    white-space: nowrap;
  }

  .sticked-to-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;

    background-color: #eee;
    padding: 0.5em;
    border: 1px solid #888;
    // flex-grow: 3;
    // flex-shrink: 0;
    // flex-basis: 0;
  }

  .is-dropzone {
    background-color: white;
    outline: 2px dashed #aaa;
    outline-offset: -10px;
  }

  .is-dragover {
    background-color: #e4e2e0;
  }
</style>
