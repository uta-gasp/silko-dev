<template lang="pug">
    #loading(:class="{ 'is-modal': isModal }")
</template>

<script>
export default {
  name: 'loading',

  data() {
    return {
    };
  },

  props: {
    isModal: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="less" scoped>
    #loading {
      background: url("../../assets/img/wait.gif") no-repeat center;
      width: 100%;
      height: 32px;
      padding: 2rem 2rem;
    }

    .is-modal {
      position: fixed;
      top: 8px;
      left: 8px;
      width: 100vw;
      height: 100vh;
      padding: 0;
      z-index: 1000;
    }
</style>
