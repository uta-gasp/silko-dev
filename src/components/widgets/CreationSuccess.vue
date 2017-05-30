<template lang="pug">
  #creation-success
    .zero-height
      transition(name="fade")
        .notification.is-success(v-if="showState")
          span The {{object}} was created
</template>

<script>
const MSG_SHOW_DURATION = 4000;

export default {
  name: 'creation-success',
  data() {
    return {
      showState: false,
      timer: null
    };
  },
  props: {
    object: String,
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