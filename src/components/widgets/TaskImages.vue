<template lang="pug">
  #task-images
    img.image.left(v-show="hasImageAt( 'left' )" :src="image.left")
    img.image.right(v-show="hasImageAt( 'right' )" :src="image.right")
    img.image.bottom(v-show="hasImageAt( 'bottom' )" :src="image.bottom")
</template>

<script>
import ImageController from '@/task/imageController.js';

export default {
  name: 'task-images',

  data() {
    return {
      image: {
        left: '',
        right: '',
        bottom: '',
      },

      imageController: new ImageController({
        onShow: image => this.image[ image.location ] = image.src,
        onHide: image => this.image[ image.location ] = '',
      }),
    };
  },

  props: {
    images: {
      type: Array,
      required: true,
    },

    fixation: {
      type: Object, // { word: String, duration: Number }
    },
  },

  methods: {
    hasImageAt( location ) {
      const images = this.images;
      if (!images) {
        return false;
      }

      return images.some( image => image.location === location );
    }
  },

  watch: {
    images( images ) {
      this.imageController.setImages( images );
    },

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
