<script>
  export default {
    name: 'progress-chart', 

    extends: VueChartJs.Line,

    props: ['data'],

    mounted () {
      this.renderChart(this.data, {
        responsive: true, 
        maintainAspectRatio: false,
      });
    }
  };
</script>
