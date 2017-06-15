<template lang="pug">
  #app
    navbar
    section.section
      .container.is-fluid
        router-view
</template>

<script>
  import NavBar from '@/components/navbar';

  export default {
    name: 'app',
    components: {
      navbar: NavBar
    }
  }
</script>

<style lang="less" scoped>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    text-align: center;
    color: #2c3e50;
  }
</style>
