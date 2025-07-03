<template>
  <div class="chart-section">
    <h3 class="section-title">📈 发表趋势图</h3>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default {
  name: 'TimelineChart',
  props: {
    timeline: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    timeline: {
      handler() {
        this.createChart()
      },
      immediate: true
    }
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    createChart() {
      if (this.chart) {
        this.chart.destroy()
      }
      
      if (this.timeline.length === 0) return
      
      const ctx = this.$refs.chartCanvas.getContext('2d')
      const years = this.timeline.map(item => item.year)
      const counts = this.timeline.map(item => item.count)
      
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: '文献发表数量',
            data: counts,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              titleColor: 'white',
              bodyColor: 'white',
              borderColor: '#667eea',
              borderWidth: 1,
              callbacks: {
                title: function(context) {
                  return `${context[0].label}年`
                },
                label: function(context) {
                  return `发表文献: ${context.parsed.y} 篇`
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: '年份',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              grid: {
                display: false
              }
            },
            y: {
              title: {
                display: true,
                text: '文献数量',
                font: {
                  size: 14,
                  weight: 'bold'
                }
              },
              beginAtZero: true,
              grid: {
                color: 'rgba(0,0,0,0.1)'
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.chart-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 20px;
  color: #495057;
  border-bottom: 3px solid #667eea;
  padding-bottom: 10px;
}

.chart-container {
  position: relative;
  height: 400px;
}
</style>
