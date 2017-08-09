<template lang="pug">
  #creation-success
    transition(name="slide-fade")
      .modal.on-top.is-active(v-if="showState")
        .modal-content
          .notification(:class="notificationClass")
            slot
</template>

<script>
const MSG_SHOW_DURATION = 4000;

export default {
  name: 'creation-success',

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

  mounted() {
    this.showState = false;
  },
};
</script>

<style lang="less" scoped>

  #creation-success {
    z-index: 30;
  }

  .modal.on-top {
    top: 50px;
    bottom: inherit;
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
