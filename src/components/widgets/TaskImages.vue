<template lang="pug">
  #task-images
    img.image(v-for="props in imageProps" 
      v-show="hasImageAt( props )" 
      :src="getSource( props )" 
      :class="getClass( props )"
      :style="getStyle( props )"
    )
</template>

<script>
import ImageController from '@/task/imageController.js';
import ScreenSize from '@/model/session/screenSize.js';

// ts-check-only
import { TextPageImage, Word } from '@/model/task/textPageImage.js';
import DataImage from '@/model/data/image.js';

class ImageProps {
  /**
   * @param {TextPageImage} image
   */
  constructor(image) {
    this.location = image.location;
    this.src = image.src;
    this.keepOriginalSize = !!image.keepOriginalSize;
    this.offset = image.offset || 0;
  }
}

/**
 * @fires show
 * @fires hide
 */
export default {
  name: 'task-images',

  data() {
    return {
      imageProps: {
        left: null,
        right: null,
        bottom: null,
      },

      /** @type {ImageController} */
      imageController: null,
    };
  },

  props: {
    images: {
      type: Array,  // TextPageImage[]
      required: true,
      default: /** @returns {Array} */ () => []
    },

    fixation: {
      type: Object, // { word: Word, duration: number }
      default: null
    },

    viewport: {
      type: Object, // ScreenSize
      default: null
    }
  },

  methods: {
    /**
     * @param {ImageProps} props
     * @returns {boolean}
     */
    hasImageAt( props ) {
      const images = this.images;
      if ( !images || !props) {
        return false;
      }

      return images.some( /** @param {DataImage} image */ image => image.location === props.location );
    },

    /**
     * @param {ImageProps} props
     * @returns {string}
     */
    getSource( props ) {
      return props ? props.src : '';
    },

    /**
     * @param {ImageProps} props
     * @returns {any}
     */
    getClass( props ) {
      if (!props)
        return null;

      return {
        [props.location]: true,
        'has-original-size': props.keepOriginalSize,
      }
    },

    /**
     * @param {ImageProps} props
     * @returns {string}
     */
    getStyle( props ) {
      if (!props)
        return '';

      if (this.viewport) {
        let offsetX = -1;
        let offsetY = -1;
        let translateX = 0;
        let translateY = 0;
        let width = 'auto';
        let height = 'auto';

        const SIZE = 0.15; // 15%

        if (props.location === 'bottom') {
          offsetY = this.viewport.height - (props.offset || 0);
          translateY = -100;
          translateX = -50;
          if (!props.keepOriginalSize) {
            height = (this.viewport.height * SIZE).toFixed(0) + 'px';
          }
        }
        else if (props.location === 'right') {
          offsetX = this.viewport.width - (props.offset || 0);
          translateX = -100;
          translateY = -50;
          if (!props.keepOriginalSize) {
            width = (this.viewport.width * SIZE).toFixed(0) + 'px';
          }
        }
        else if (props.location === 'left') {
          offsetX = props.offset || 0;
          translateY = -50;
          if (!props.keepOriginalSize) {
            width = (this.viewport.width * SIZE).toFixed(0) + 'px';
          }
        }

        return [
          `right: auto`,
          `bottom: auto`,
          `left: ${offsetX < 0 ? '50%' : offsetX + 'px'}`,
          `top: ${offsetY < 0 ?'50%' : offsetY + 'px'}`,
          `transform: translateX(${translateX}%) translateY(${translateY}%)`,
          `width: ${width}`,
          `height: ${height}`,
        ].join(';');
      }
      else {
        return [
          `margin-${props.location}: ${props.offset}px`,
        ].join(';');
      }
    },
  },

  watch: {
    /**
     * @param {TextPageImage[]} images
     */
    images( images ) {
      this.imageController.setImages( images );
    },

    /**
     * @param {{word: Word, duration: number}} fixation
     */
    fixation( fixation ) {
      this.imageController.fixate( fixation.word, fixation.duration );
    },
  },

  mounted() {
    this.imageController = new ImageController( {
        onShow: image => {
          console.log('IMC_CB', 'shown', image.src.split('_').find((v, i, a) => i === (a.length - 1)).split('?')[0]);
          this.imageProps[ image.location ] = new ImageProps( image );
          //this._setOffset( this.image[ image.location ] )
          this.$emit( 'show', { image } );
          console.log('IMC_CB', '---');
        },
        onHide: image => {
          console.log('IMC_CB', 'hidden', image.src.split('_').find((v, i, a) => i === (a.length - 1)).split('?')[0]);
          this.imageProps[ image.location ] = null;
          this.$emit( 'hide', { image } );
          console.log('IMC_CB', '---');
        },
      } );
  },

  destroyed() {
    this.imageController.shutdown();
  },

};
</script>

<style lang="less" scoped>

  @size: 15%;
  @margin: 0.25em;

  .horizontal {
    width: calc(@size - 2 * @margin);
    top: 50%;
    transform: translateY(-50%);
  }

  .vertical {
    height: calc(@size - 2 * @margin);
    left: 50%;
    transform: translateX(-50%);
  }

  #task-images {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }

  img.image {
    position: absolute;
    padding: @margin;
    box-sizing: border-box;

    &.left {
      left: 0;
      .horizontal();
    }

    &.right {
      right: 0;
      .horizontal();
    }

    &.bottom {
      bottom: 0;
      .vertical();
    }
  }

  .has-original-size {
    width: auto !important;
    height: auto !important;
  }

</style>
