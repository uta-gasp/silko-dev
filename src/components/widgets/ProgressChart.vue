<script>
  import { i10n } from '@/utils/i10n.js';

  export default {
    name: 'progress-chart', 

    extends: VueChartJs.Line,

    data() {
      return {
        tokens: i10n( '_labels' ),
      }
    },

    props: ['data'],

    mounted () {
      this.renderChart( this.data, {
        responsive: true, 
        maintainAspectRatio: false,
        legend: {
          display: false,
          labels: {
            fontColor: 'rgb(255, 99, 132)',
          }
        },
        title: {
            display: false,
        },
        tooltips: {
          displayColors: false,
          callbacks: {
            title: (tooltipItem, data) => data.labels[ tooltipItem[0].index ].split( '|' )[0]
          },
        },
        scales: {
          xAxes: [{
            ticks: {
              callback: (value, index, values) => {
                const p = value.split( '|' )[1].split( 'T' );
                return p[0] + ' ' + p[1].split( '.' )[0];
              }
            },
            scaleLabel: {
              display: true,
              labelString: this.tokens[ 'date' ],
              fontSize: 18,
            },
          }]
        }        
      });
    }
  };
</script>
