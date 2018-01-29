<template lang="pug">
  #task-images
    img.image.left(v-show="hasImageAt( 'left' )" :src="image.left")
    img.image.right(v-show="hasImageAt( 'right' )" :src="image.right")
    img.image.bottom(v-show="hasImageAt( 'bottom' )" :src="image.bottom")
</template>

<script>
import ImageController from '@/task/imageController.js';

// ts-check-only
import { TextPageImage, Word } from '@/model/task/textPageImage.js';
import DataImage from '@/model/data/image.js';

/**
 * @fires show
 * @fires hide
 */
export default {
  name: 'task-images',

  data() {
    return {
      image: {
        left: '',
        right: '',
        bottom: '',
      },

      imageController: new ImageController( {
        onShow: image => {
          this.image[ image.location ] = image.src;
          this.$emit( 'show', { image } );
        },
        onHide: image => {
          this.image[ image.location ] = '';
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
     * @param {string} location
     * @returns {boolean}
     */
    hasImageAt( location ) {
      const images = this.images;
      if ( !images ) {
        return false;
      }

      return images.some( /** @param {DataImage} image */ image => image.location === location );
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

  .horizontal {
    width: calc(@size - 2 * @margin);
    top: 50%;
    transform: translateY(-50%);
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
      height: calc(@size - 2 * @margin);
      left: 50%;
      transform: translateX(-50%);
    }
  }

</style>
