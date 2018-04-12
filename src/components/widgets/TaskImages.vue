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

      imageController: new ImageController( {
        onShow: image => {
          this.imageProps[ image.location ] = new ImageProps( image );
          //this._setOffset( this.image[ image.location ] )
          this.$emit( 'show', { image } );
        },
        onHide: image => {
          this.imageProps[ image.location ] = null;
          this.$emit( 'hide', { image } );
        },
      } ),
    };
  },

  props: {
    images: {
      type: Array,
      required: true,
      default: /** @returns {Array} */ () => []
    },

    fixation: {
      type: Object, // { word: Word, duration: number }
      default: null
    },
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

      return [
        `margin-${props.location}: ${props.offset}%`,
      ].join(' ');
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

  destroyed() {
    this.imageController.shutdown();
  },

};
</script>

<style lang="less" scoped>

  @size: 15%;
  @margin: 0.25em;

  .fit-to-margin {

  }

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
