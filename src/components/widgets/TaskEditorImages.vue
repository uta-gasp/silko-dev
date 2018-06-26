<template lang="pug">
  #task-editor-images
    section.top-only(v-if="!isEditing")
      table.table(v-if="images.length")
        thead
          tr
            th Preview
            th Name
            th Page
            th Location
            th Size
            th On
            th Off
            th
        tbody
          tr.is-64(v-for="(image, index) in images" :key="index")
            td
              p.image.is-64x64.preview(v-if="canShow( image )" :style="getCSSBackgroundImage( image )")
            td {{ getImageName( image ) }}
            td {{ getImagePage( image ) }}
            td {{ getImageLocation( image ) }}
            td {{ image.keepOriginalSize ? 'original' : 'shrinked' }}
            td
              .event-name {{ formatEventName( image.on ) }}
              .event-param(v-show="hasParameters( image.on )") {{ formatEventParams( image.on ) }}
            td
              .event-name {{ formatEventName( image.off ) }}
              .event-param(v-show="hasParameters( image.off )") {{ formatEventParams( image.off ) }}
            td
              button.button(
                title="Edit the image appearance parameters"
                @click="edit( index )")
                i.far.fa-edit
            td
              button.button(
                title="Remove the image"
                @click="remove( index )")
                i.fa.fa-times
      section(v-else)
        i No images

    section.absolute-parent
      .has-text-centered(v-if="!isEditing")
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

      div(:class="{ 'sticked': !isEditing, 'at-top': !images.length, 'at-bottom': images.length }" v-if="selectedFile || isEditing")
        article.media(v-if="selectedFile")
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
              button.button.is-primary(@click="uploadImage" :disabled="isUploading || !hasValidParams") Upload
              button.button(@click="cancel" :disabled="isUploading") Cancel
        article
          .field.is-horizontal(v-if="isEditing")
            .field-label.is-normal  
            .field-body
              h4.heading.is-4 {{ getImageName( images[ editingImageIndex ] ) }}
          .field.is-horizontal
            .field-label.is-normal Page
            .field-body
              .select
                select(v-model="page")
                  option(value="-1") any
                  option(v-for="index in pageCount" :key="index" :value="index - 1") {{ index }}
          .field.is-horizontal
            .field-label.is-normal Location
            .field-body
              input.input.is-inline(type="number" step="5" v-model.number="offset" min="0" max="800")
              .info-label pixels from
              .select
                select(v-model="location")
                  option(value="left") left
                  option(value="bottom") bottom
                  option(value="right") right
          .field.is-horizontal
            .field-label.is-normal Size
            .field-body
              .select
                select(v-model="keepOriginalSize")
                  option(value="true") original
                  option(value="false") 15% of width / height
          .field.is-horizontal
            .field-label.is-normal Show
            .field-body
              .select
                select(v-model="on")
                  option(v-for="(text, id) in ON" :value="id" :key="id") {{ text }}
              .field.is-horizontal(v-show="on === 'fixation'")
                .field-label.is-normal.is-inner-label.no-wrap at
                .field-body.select-container
                  .select.is-multiple
                    select(v-model="fixationWords" multiple)
                      option(v-for="word in currentWords" :value="word" :key="word.text + Math.random()") {{ word.text }}
                .field-label.is-normal.is-inner-label.no-wrap longer than
                .field-body.number-container
                  input.input.is-number(
                    type="text"
                    v-model="fixationDuration")
                .field-label.is-normal.is-inner-label.no-wrap ms
          .field.is-horizontal
            .field-label.is-normal Hide
            .field-body
              .select
                select(v-model="off")
                  option(v-for="(text, id) in OFF" :value="id" :key="id") {{ text }}
              .field.is-horizontal(v-show="off === 'delay'")
                .field-body.number-container
                  input.input.is-number(
                    type="text"
                    v-model="delayDuration")
                .field-label.is-normal.is-inner-label.no-wrap sec
          .field.is-horizontal(v-if="isEditing")
            .field-label.is-normal
            .field-body
              .is-grouped.is-right  
                button.button.is-primary(@click="saveEdited()") Save
                button.button(@click="cancelEditing()") Cancel

    temporal-notification(type="danger" :show="showError")
      span {{ errorMessage }}

</template>

<script>
import Task from '@/model/task.js';
import { TextPageImage,
  TextPageImageEvent,
  TextPageImageFixationEvent,
  TextPageImageDelayEvent,
  Word } from '@/model/task/textPageImage.js';

import ActionError from '@/components/mixins/actionError';

import TemporalNotification from '@/components/widgets/TemporalNotification.vue';

/** 
 * @param {string} text
 * @returns {string[]}
 */
function getPages( text ) {
  return text.split( '\n\n' ).filter( page => !!page.trim() );
}

/**
 * @param {string} text
 * @returns {string}
 */
function removeFormatting( text ) {
  return text.split( '|' )[0];
}

/** 
 * @param {string} text
 * @returns {Word[]}
 */
function getUniqueWords( text, useIDs = false ) {
  return Array.from(
    new Set( text.trim()
      .split( /\s+/gi )
      .map( word => removeFormatting( word.trim() ) )
      .filter( word => word.length && word.charAt(0) !== '|' )
    )
  ).map( ( word, index ) => new Word( word, useIDs ? index + '' : '' ) ); 
}

/** 
 * @param {string} text
 * @param {number} pageIndex
 * @returns {Word[]}
 */
function getPageUniqueWords( text, pageIndex ) {
  const page = getPages( text )[ pageIndex ];
  if ( !page ) {
    return [];
  }

  return getUniqueWords( page, true );
}

/** 
 * @param {string} text
 * @returns {Word[]}
 */
function getWords( text, useIDs = false ) {
  return text.trim()
    .split( /\s+/gi )
    .map( word => removeFormatting( word.trim() ) )
    .filter( word => word.length && word.charAt(0) !== '|' )
    .map( ( word, index ) => new Word( word, useIDs ? index + '' : '' ) ); 
}

/** 
 * @param {string} text
 * @param {number} pageIndex
 * @returns {Word[]}
 */
function getPageWords( text, pageIndex ) {
  const page = getPages( text )[ pageIndex ];
  if ( !page ) {
    return [];
  }

  return getWords( page, true );
}

/** 
 * @fires input
 */
export default {
  name: 'task-editor-images',

  components: {
    'temporal-notification': TemporalNotification,
  },

  mixins: [ ActionError ],

  data() {
    return {
      /** @type {TextPageImage[]} */
      images: [],

      /** @type {File} */
      selectedFile: null,
      editingImageIndex: -1,
      uploadProgress: -1,

      page: '-1',
      location: 'bottom',
      offset: 0,
      keepOriginalSize: 'false',
      on: TextPageImage.EVENT.none,
      fixationWords: /** @type {Word[]} */ ([]),
      fixationDuration: 1000,
      off: TextPageImage.EVENT.none,
      delayDuration: 1,

      isDraggingFileOverDropzone: false,

      ON: {
        [TextPageImage.EVENT.none]: 'initially',
        [TextPageImage.EVENT.fixation]: 'on fixation',
      },

      OFF: {
        [TextPageImage.EVENT.none]: 'never',
        [TextPageImage.EVENT.image]: 'when other image is shown',
        [TextPageImage.EVENT.delay]: 'after',
      },

    };
  },

  props: {
    task: {
      type: Task,
      default: null,
    },

    currentText: {
      type: String,
      required: true,
    },
  },

  computed: {
    /** @returns {number} */
    pageCount() {
      return getPages( this.currentText ).length;
    },

    /** @returns {Word[]} */
    currentWords() {
      return +this.page < 0
        ? getUniqueWords( this.currentText )
        : getPageWords( this.currentText, +this.page );
    },

    /** @returns {boolean} */
    isUploading() {
      return this.uploadProgress >= 0;
    },

    /** @returns {boolean} */
    isEditing() {
      return this.editingImageIndex >= 0;
    },

    /** @returns {boolean} */
    hasValidParams() {
      return this.constructImageEvent( this.on ).isValid &&
             this.constructImageEvent( this.off ).isValid;
    },
  },

  methods: {
    listImages() {
      /** @type {TextPageImage[]} */
      const images = [];
      if ( !this.task ) {
        return;
      }

      this.task.pages.forEach( page => {
        if ( !page.images ) {
          return;
        }

        page.images.forEach( image => {
          if ( !images.find( img => img.src === image.src ) ) {
            images.push( image );
          }
        } );
      } );

      this.images = images;
    },

    /** 
     * @param {number} index 
     */
    edit( index ) {
      const img = this.images[ index ];

      this.page = '' + img.page;
      this.location = img.location;
      this.offset = img.offset || 0;
      this.keepOriginalSize = '' + !!img.keepOriginalSize;
      this.on = this.deconstructImageEvent( img.on );
      this.off = this.deconstructImageEvent( img.off );

      this.editingImageIndex = index;

      this.$emit( 'editing', true );
    },

    saveEdited() {
      const onEvent = this.constructImageEvent( this.on );
      const offEvent = this.constructImageEvent( this.off );
      this.images[ this.editingImageIndex ] = new TextPageImage( {
        src: this.images[ this.editingImageIndex ].src,
        page: +this.page,
        location: this.location,
        offset: this.offset,
        keepOriginalSize: this.keepOriginalSize === 'true',
        on: onEvent,
        off: offEvent,
      } );
      
      this.editingImageIndex = -1;
      
      this.$emit( 'input', { images: this.images } );
      this.$emit( 'editing', false );
    },

    cancelEditing() {
      this.editingImageIndex = -1;
      this.$emit( 'editing', false );
    },

    /** 
     * @param {number} index 
     */
    remove( index ) {
      const deletedImage = this.images.splice( index, 1 )[0];
      Task.deleteImage( deletedImage, /** @param {Error | string} err */ err => {
        if ( err ) {
          this.setError( err, 'Cannot delete the image' );
        }
      } );
      this.$emit( 'input', { images: this.images } );
    },

    /** 
     * @param {string} file 
     * @returns {string}
     */
    getImageURL( file ) {
      return window.URL.createObjectURL( file );
    },

    /** 
     * @param {TextPageImage & {file: HTMLImageElement}} image 
     * @returns {boolean}
     */
    canShow( image ) {
      return !!image.file || !!image.src;
    },

    /** 
     * @param {TextPageImage & {file: HTMLImageElement}} image 
     * @returns {string}
     */
    getCSSBackgroundImage( image ) {
      return `background-image: url('${image.file ? this.getImageURL( image.file ) : image.src}')`;
    },

    /** 
     * @param {TextPageImage & {file: HTMLImageElement}} image 
     * @returns {string}
     */
    getImageName( image ) {
      if (!image) {
        return '';
      }
      else if ( image.file ) {
        return image.file.name;
      }
      else if ( image.src ) {
        return decodeURIComponent( TextPageImage.getNameFromSource( image.src ) );
      }
      else {
        return '-';
      }
    },

    /** 
     * @param {TextPageImage} image 
     * @returns {string | number}
     */
    getImagePage( image ) {
      return image.page < 0 ? 'any' : ( image.page + 1 );
    },

    /** 
     * @param {TextPageImage} image 
     * @returns {string}
     */
    getImageLocation( image ) {
      return image.location + (image.offset ? ` + ${image.offset}px` : '');
    },
 
    /** 
     * @param {TextPageImageEvent} imageShowEvent
     * @returns {boolean}
     */
    hasParameters( imageShowEvent ) {
      return TextPageImageEvent.hasParameters( imageShowEvent );
    },

    /** 
     * @param {TextPageImageEvent} event
     * @returns {string}
     */
    formatEventName( event ) {
      if ( event.name === TextPageImage.EVENT.none ) {
        return '-';
      }
      else if ( event.name === TextPageImage.EVENT.fixation ) {
        return `fixation on word`;
      }
      else {
        return event.name;
      }
    },

    /** 
     * @param {TextPageImageFixationEvent | TextPageImageDelayEvent} event
     * @returns {string}
     */
    formatEventParams( event ) {
      if ( event.name === TextPageImage.EVENT.fixation ) {
        const fixEvent = /** @type {TextPageImageFixationEvent}*/ (event);
        const words = (fixEvent.word ? [ { text: fixEvent.word } ] : fixEvent.words).map( word => word.text ).join( ' ' );
        return `"${words}"\nlonger than ${event.duration} ms`;
      }
      else if ( event.name === TextPageImage.EVENT.delay ) {
        return `${event.duration} seconds`;
      }
      else {
        return '';
      }
    },

    /** @param {DragEvent} e */
    dropFile( e ) {
      this.isDraggingFileOverDropzone = false;
      const dt = e.dataTransfer;
      const files = dt.files;
      this.selectFile( { target: { files } } );
    },

    /** 
     * @param {DragEvent | {target: {files: FileList}}} e 
     * @returns {*}
     */
    selectFile( e ) {
      const file = /** @type {HTMLInputElement} */ (e.target).files[0];
      if ( !file ) {

      }
      else if ( file.type !== 'image/jpeg' && file.type !== 'image/png' ) {
        return this.setError( 'Only JPEG and PNG images are supported' );
      }
      else if ( file.size > 100000 ) {
        return this.setError( 'File size must not exceed 100 kB' );
      }
      else {
        this.selectedFile = file;
      }
    },

    /** @param {Event} e */
    uploadImage( e ) {
      this.uploadProgress = 0;

      const onEvent = this.constructImageEvent( this.on );
      const offEvent = this.constructImageEvent( this.off );
      const image = new TextPageImage( {
        src: null,
        page: +this.page,
        location: this.location,
        offset: this.offset,
        keepOriginalSize: this.keepOriginalSize === 'true',
        on: onEvent,
        off: offEvent,
      } );

      Task.uploadImage( this.selectedFile, image.meta,
        percentage => {
          this.uploadProgress = percentage;
        },
        /** @param {Error | string} err; @param {string} url */ ( err, url ) => {
          this.uploadProgress = -1;

          if ( err ) {
            this.setError( err, 'Cannot upload the file' );
          }
          else {
            image.src = url;
            image.file = this.selectedFile;
            this.images.push( image );

            this.selectedFile = null;

            this.$emit( 'input', { images: this.images } );
          }
        }
      );
    },

    /** @param {Event} e */
    cancel( e ) {
      this.selectedFile = null;
    },

    /** 
     * @param {string} name
     * @returns {TextPageImageEvent | TextPageImageFixationEvent | TextPageImageDelayEvent}
     */
    constructImageEvent( name ) {
      if ( name === TextPageImage.EVENT.fixation ) {
        return new TextPageImageFixationEvent( this.fixationWords, this.fixationDuration );
      }
      else if ( name === TextPageImage.EVENT.delay ) {
        return new TextPageImageDelayEvent( this.delayDuration );
      }
      else {
        return new TextPageImageEvent( name );
      }
    },

    /** 
     * @param {TextPageImageEvent | TextPageImageFixationEvent | TextPageImageDelayEvent} event
     * @returns {string} Event name
     */
    deconstructImageEvent( event ) {
      if ( event.name === TextPageImage.EVENT.fixation ) {
        this.fixationWords = /** @type {TextPageImageFixationEvent} */ (event).words || [event.word] || [];
        this.fixationDuration = /** @type {TextPageImageFixationEvent} */ (event).duration;
      }
      else if ( name === TextPageImage.EVENT.delay ) {
        this.delayDuration = /** @type {TextPageImageDelayEvent} */ (event).duration;
      }

      return event.name;
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

  .table td {
    padding-top: 0;
    padding-bottom: 0;
  }

  .is-64 td {
    min-height: 64px;
    vertical-align: middle;
  }

  .is-64x64.preview {
    position: relative;
    top: 32px;
    transform: translateY(-50%);
    background-position: center;
    background-size: cover;
  }

  .event-name {
    font-size: 12pt;
  }

  .event-param {
    font-size: 9pt;
    white-space: pre;
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

  .select-container {
    flex-grow: 0;
  }

  .is-number {
    width: 4rem;
  }

  .is-inner-label {
    margin-left: 0.75rem;
    margin-right: 0.75rem;
    flex-grow: 0;
  }

  .info-label {
    display: inline-block;
    line-height: 2.25;
    padding: 0 0.5em;    
  }
</style>
