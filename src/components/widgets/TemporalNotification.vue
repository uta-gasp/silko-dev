<template lang="pug">
  #temporal-notification
    transition(name="slide-fade")
      .modal.on-top.is-active(v-if="showState")
        .modal-content
          .notification(:class="notificationClass").has-text-centered.is-rounded
            slot
</template>

<script>
const MSG_SHOW_DURATION = 4000;

export default {
  name: 'temporal-notification',

  data() {
    return {
      showState: false,
      timer: null,
    };
  },

  props: {
    type: String,
    show: Number,
  },

  watch: {
    show() {
      this.log();

      this.showState = true;
      if ( this.timer ) {
        clearTimeout( this.timer );
      }
      this.timer = setTimeout( () => {
        this.showState = false;
        this.timer = null;
      }, MSG_SHOW_DURATION );
    },
  },

  computed: {
    notificationClass() {
      return 'is-' + this.type;
    },
  },

  methods: {
    getSlotItemText( item ) {
      let result = '';

      if ( item.text ) {
        result += item.text;
      }
      if ( item.children ) {
        result += item.children.reduce( ( acc, _item ) => {
          return acc + this.getSlotItemText( _item );
        }, '' );
      }

      return result;
    },

    getSlotText() {
      return this.$slots.default.reduce( ( acc, slot ) => {
        return acc + this.getSlotItemText( slot );
      }, '' );
    },

    log() {
      if ( this.type === 'danger' ) {
        console.error( 'TEMP_ERROR: ', this.getSlotText() );
      }
      else if ( this.type === 'success' ) {
        console.log( 'TEMP_SUCCESS:', this.getSlotText() );
      }
    },
  },

  mounted() {
    this.showState = false;
  },
};
</script>

<style lang="less" scoped>

  #temporal-notification {
    z-index: 1000;
  }

  .modal.on-top {
    top: 50px;
    bottom: inherit;
  }

  .is-rounded {
    border-radius: 12px;
  }

  .slide-fade-enter-active {
    transition: all .3s ease;
  }
  .slide-fade-leave-active {
    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(-200px);
    opacity: 0;
  }
</style>
