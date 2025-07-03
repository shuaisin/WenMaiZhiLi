<template>
  <div class="timeline-section">
    <h3 class="section-title">📋 详细时间线</h3>
    <div class="timeline-container">
      <div v-if="timeline.length === 0" class="no-data">
        <p>暂无数据</p>
      </div>
      <div v-else>
        <div 
          v-for="yearData in timeline" 
          :key="yearData.year"
          class="year-item"
        >
          <div 
            class="year-header" 
            @click="toggleYear(yearData.year)"
          >
            <span>{{ yearData.year }}年</span>
            <span>{{ yearData.count }} 篇文献</span>
          </div>
          <div 
            class="year-content" 
            :class="{ active: expandedYears.includes(yearData.year) }"
          >
            <div 
              v-for="(lit, index) in yearData.literatures" 
              :key="index"
              class="literature-item"
            >
              <div class="lit-title">{{ lit.title }}</div>
              <div class="lit-meta">
                <strong>作者:</strong> {{ lit.author || '未知' }}<br>
                <strong>发表日期:</strong> {{ lit.publication_date }}<br>
                <strong>DOI:</strong> 
                <a 
                  :href="`https://doi.org/${lit.doi}`" 
                  target="_blank" 
                  class="doi-link"
                >
                  {{ lit.doi }}
                </a>
              </div>
              <div class="lit-stats">
                <span class="stat-badge">📚 参考文献: {{ lit.reference_count }}</span>
                <span class="stat-badge">📈 被引用: {{ lit.is_referenced_by_count }}</span>
                <span class="stat-badge">⭐ 评分: {{ lit.score.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimelineList',
  props: {
    timeline: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      expandedYears: []
    }
  },
  methods: {
    toggleYear(year) {
      const index = this.expandedYears.indexOf(year)
      if (index > -1) {
        this.expandedYears.splice(index, 1)
      } else {
        this.expandedYears.push(year)
      }
    }
  }
}
</script>

<style scoped>
.timeline-section {
  background: white;
  border-radius: 12px;
  padding: 25px;
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

.no-data {
  text-align: center;
  color: #6c757d;
  padding: 40px;
}

.year-item {
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.year-item:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.year-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 18px 25px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  transition: background 0.3s;
}

.year-content {
  display: none;
  padding: 20px;
  background: #f8f9fa;
}

.year-content.active {
  display: block;
}

.literature-item {
  background: white;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  transition: transform 0.2s;
}

.literature-item:hover {
  transform: translateX(5px);
}

.literature-item:last-child {
  margin-bottom: 0;
}

.lit-title {
  font-size: 1.1em;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  line-height: 1.4;
}

.lit-meta {
  color: #6c757d;
  font-size: 0.9em;
  margin-bottom: 12px;
  line-height: 1.5;
}

.doi-link {
  color: #007bff;
  text-decoration: none;
}

.doi-link:hover {
  text-decoration: underline;
}

.lit-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.stat-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 500;
}

@media (max-width: 768px) {
  .lit-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-badge {
    text-align: center;
  }
}
</style>