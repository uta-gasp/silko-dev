<template lang="pug">
  #vis-title
    slot
</template>

<script>
  export default {
    name: 'vis-title',
  };
</script>

<style lang="less" scoped>
  #vis-title {
    position: fixed;
    width: 100vw;
    color: #444;
    font: 18px 'Roboto Condensed', Arial, sans-serif;
    top: 0.5em;
    left: 0;
    text-align: center;
    line-height: 32px;
  }
</style>
