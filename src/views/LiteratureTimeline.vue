<template>
  <div class="timeline-page">
    <div class="container">
      <div class="header">
        <h1>📚 文献时间线可视化</h1>
        <p>探索学术发展的时间脉络</p>
      </div>
      
      <div class="content">
        <!-- 认证区域 -->
        <div v-if="showAuthSection" id="authSection" class="auth-section">
          <h3>🔐 身份验证</h3>
          <div class="auth-form">
            <div class="form-group">
              <label for="tokenInput">访问令牌 (JWT Token):</label>
              <input 
                type="text" 
                id="tokenInput" 
                v-model="tokenInput"
                placeholder="请输入您的访问令牌"
                @keypress="handleTokenKeypress"
              >
              <button @click="saveToken" class="search-btn">保存令牌</button>
            </div>
          </div>
        </div>
        
        <!-- 搜索区域 -->
        <div class="search-section">
          <h3>🔍 文献搜索</h3>
          <div class="search-form">
            <div class="form-row">
              <div class="form-group">
                <label for="query">搜索关键词:</label>
                <input 
                  type="text" 
                  id="query" 
                  v-model="searchForm.query"
                  placeholder="输入搜索关键词，如：machine learning"
                  @keypress="handleSearchKeypress"
                >
              </div>
              <div class="form-group">
                <label for="rows">结果数量:</label>
                <select id="rows" v-model="searchForm.rows">
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="500">500</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="filter">过滤条件 (可选):</label>
                <input 
                  type="text" 
                  id="filter" 
                  v-model="searchForm.filter"
                  placeholder="如：from-pub-date:2020,until-pub-date:2023"
                >
              </div>
              <div class="form-group">
                <label for="sort">排序方式:</label>
                <select id="sort" v-model="searchForm.sort">
                  <option value="">默认排序</option>
                  <option value="published">按发表日期</option>
                  <option value="relevance">按相关性</option>
                  <option value="score">按评分</option>
                </select>
              </div>
            </div>
            
            <button @click="searchLiteratures" class="search-btn" :disabled="loading">
              {{ loading ? '搜索中...' : '🔍 开始搜索' }}
            </button>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>正在搜索文献数据，请稍候...</p>
        </div>
        
        <!-- 错误信息 -->
        <div v-if="error" class="error">
          {{ error }}
        </div>
        
        <!-- 结果展示 -->
        <div v-if="results.timeline.length > 0" class="results">
          <!-- 统计信息 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ results.total_count }}</div>
              <div class="stat-label">总文献数</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ yearRangeText }}</div>
              <div class="stat-label">时间跨度</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ avgPerYear }}</div>
              <div class="stat-label">年均发表</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ peakYear }}</div>
              <div class="stat-label">发表高峰年</div>
            </div>
          </div>
          
          <!-- 图表 -->
          <TimelineChart :timeline="results.timeline" />
          
          <!-- 时间线列表 -->
          <TimelineList :timeline="results.timeline" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'
import TimelineChart from '../components/TimelineChart.vue'
import TimelineList from '../components/TimelineList.vue'

export default {
  name: 'LiteratureTimeline',
  components: {
    TimelineChart,
    TimelineList
  },
  data() {
    return {
      showAuthSection: false,
      tokenInput: '',
      loading: false,
      error: '',
      searchForm: {
        query: '',
        rows: 100,
        filter: '',
        sort: ''
      },
      results: {
        timeline: [],
        total_count: 0,
        year_range: { start: null, end: null }
      }
    }
  },
  computed: {
    yearRangeText() {
      const { start, end } = this.results.year_range
      return start && end ? `${start} - ${end}` : '-'
    },
    avgPerYear() {
      const { start, end } = this.results.year_range
      if (!start || !end) return '0'
      const yearSpan = parseInt(end) - parseInt(start) + 1
      return Math.round(this.results.total_count / yearSpan)
    },
    peakYear() {
      if (this.results.timeline.length === 0) return '-'
      const peak = this.results.timeline.reduce((max, current) => 
        current.count > max.count ? current : max, this.results.timeline[0])
      return peak ? peak.year : '-'
    }
  },
  mounted() {
    const savedToken = localStorage.getItem('access_token')
    if (savedToken) {
      this.tokenInput = savedToken
    } else {
      this.showAuthSection = true
    }
  },
  methods: {
    saveToken() {
      const token = this.tokenInput.trim()
      if (!token) {
        alert('请输入有效的访问令牌')
        return
      }
      
      localStorage.setItem('access_token', token)
      this.showAuthSection = false
      alert('令牌保存成功！')
    },
    
    handleTokenKeypress(e) {
      if (e.key === 'Enter') {
        this.saveToken()
      }
    },
    
    handleSearchKeypress(e) {
      if (e.key === 'Enter') {
        this.searchLiteratures()
      }
    },
    
    async searchLiteratures() {
      const query = this.searchForm.query.trim()
      if (!query) {
        alert('请输入搜索关键词')
        return
      }
      
      const token = localStorage.getItem('access_token')
      if (!token) {
        alert('请先登录或输入访问令牌')
        return
      }
      
      this.loading = true
      this.error = ''
      
      try {
        const requestData = {
          query: query,
          rows: this.searchForm.rows,
          offset: 0
        }
        
        if (this.searchForm.filter) requestData.filter = this.searchForm.filter
        if (this.searchForm.sort) requestData.sort = this.searchForm.sort
        
        const response = await api.post('/search/crossref', requestData)
        
        if (response.data.status === 'success') {
          this.processLiteratureData(response.data.data)
        } else {
          throw new Error(response.data.data || '搜索失败')
        }
      } catch (err) {
        console.error('搜索错误:', err)
        let errorMsg = '搜索失败: '
        if (err.response?.status === 401) {
          errorMsg += '访问令牌无效，请重新登录'
          localStorage.removeItem('access_token')
          this.showAuthSection = true
        } else {
          errorMsg += err.response?.data?.data || err.message
        }
        this.error = errorMsg
      } finally {
        this.loading = false
      }
    },
    
    processLiteratureData(literatureData) {
      const yearStats = {}
      
      literatureData.forEach(lit => {
        if (lit.publication_date) {
          try {
            const year = lit.publication_date.split('-')[0]
            if (!yearStats[year]) {
              yearStats[year] = []
            }
            yearStats[year].push({
              title: lit.title,
              author: lit.author,
              doi: lit.doi,
              publication_date: lit.publication_date,
              reference_count: lit.reference_count,
              is_referenced_by_count: lit.is_referenced_by_count,
              score: lit.score
            })
          } catch (e) {
            console.warn('处理文献日期时出错:', e)
          }
        }
      })
      
      const timeline = []
      const years = Object.keys(yearStats).sort()
      
      years.forEach(year => {
        timeline.push({
          year: year,
          count: yearStats[year].length,
          literatures: yearStats[year]
        })
      })
      
      this.results = {
        timeline: timeline,
        total_count: literatureData.length,
        year_range: {
          start: years.length > 0 ? years[0] : null,
          end: years.length > 0 ? years[years.length - 1] : null
        }
      }
    }
  }
}
</script>

<style scoped>
.timeline-page {
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.content {
  padding: 30px;
}

.auth-section, .search-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.auth-section h3, .search-section h3 {
  margin-bottom: 20px;
  color: #495057;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: #00b894;
}

.search-btn {
  padding: 12px 25px;
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s;
}

.search-btn:hover {
  transform: translateY(-2px);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #00b894;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  background: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px;
  border-radius: 12px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.1);
  transform: translateX(-100%);
  transition: transform 0.3s;
}

.stat-card:hover::before {
  transform: translateX(0);
}

.stat-number {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 1em;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
</style>