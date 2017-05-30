<template lang="pug">
  #creation-error
    .zero-height
      transition(name="fade")
        .notification.is-danger(v-if="showState")
          span Failed to &nbsp;
          slot create new
          span &nbsp; {{object}}: {{error}}
</template>

<script>
const MSG_SHOW_DURATION = 5000;

export default {
  name: 'creation-error',
  data() {
    return {
      showState: false,
      timer: null
    };
  },
  props: {
    object: String,
    error: String,
    show: Number
  },
  watch: {
    show() {
      this.showState = true;
      if (this.timer) {
        clearTimeout( this.timer );
      }
      this.timer = setTimeout( () => {
        this.showState = false;
        this.timer = null;
      }, MSG_SHOW_DURATION);
    }
  }
};
</script>

<style lang="less" scoped>
.zero-height {
  position: relative;
  overflow-y: visible;
  height: 0;
}

.notification {
  position: absolute;
  top: 0;
  width: 100%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0
}
</style>