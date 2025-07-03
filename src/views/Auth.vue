<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <h1>📚 LitMind</h1>
        <p>智能文献管理与分析平台<br>探索学术世界的无限可能</p>
      </div>
      
      <div class="auth-right">
        <div class="auth-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'login' }"
            @click="switchTab('login')"
          >
            登录
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'register' }"
            @click="switchTab('register')"
          >
            注册
          </button>
        </div>
        
        <div v-if="message.text" class="message" :class="message.type">
          {{ message.text }}
        </div>
        
        <!-- 登录表单 -->
        <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="loginUsername">用户名或邮箱</label>
            <input 
              type="text" 
              id="loginUsername" 
              v-model="loginForm.username" 
              required
            >
          </div>
          <div class="form-group">
            <label for="loginPassword">密码</label>
            <input 
              type="password" 
              id="loginPassword" 
              v-model="loginForm.password" 
              required
            >
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
        
        <!-- 注册表单 -->
        <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="registerUsername">用户名</label>
            <input 
              type="text" 
              id="registerUsername" 
              v-model="registerForm.username" 
              required
            >
          </div>
          <div class="form-group">
            <label for="registerEmail">邮箱</label>
            <input 
              type="email" 
              id="registerEmail" 
              v-model="registerForm.email" 
              required
            >
          </div>
          <div class="form-group">
            <label for="registerPassword">密码</label>
            <input 
              type="password" 
              id="registerPassword" 
              v-model="registerForm.password" 
              required
            >
          </div>
          <div class="form-group">
            <label for="confirmPassword">确认密码</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="registerForm.confirmPassword" 
              required
            >
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>
        
        <div class="redirect-link">
          <router-link to="/timeline">使用JWT进入</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../services/api'

export default {
  name: 'Auth',
  data() {
    return {
      activeTab: 'login',
      loading: false,
      message: {
        text: '',
        type: ''
      },
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  mounted() {
    const token = localStorage.getItem('access_token')
    if (token) {
      this.showMessage('您已登录，可以直接使用系统', 'success')
    }
  },
  methods: {
    switchTab(tab) {
      this.activeTab = tab
      this.hideMessage()
    },
    
    showMessage(text, type = 'success') {
      this.message = { text, type }
    },
    
    hideMessage() {
      this.message = { text: '', type: '' }
    },
    
    async handleLogin() {
      this.loading = true
      
      try {
        const response = await api.post('/auth/login', {
          username: this.loginForm.username,
          password: this.loginForm.password,
          email: this.loginForm.username
        })
        
        if (response.data.status === 'success') {
          const token = response.data.Authorization.replace('Bearer ', '')
          localStorage.setItem('access_token', token)
          localStorage.setItem('user_info', JSON.stringify(response.data.data))
          
          this.showMessage('登录成功！正在跳转...', 'success')
          
          setTimeout(() => {
            this.$router.push('/timeline')
          }, 2000)
        } else {
          this.showMessage(response.data.data || '登录失败', 'error')
        }
      } catch (error) {
        console.error('登录错误:', error)
        const errorMsg = error.response?.data?.data || error.message || '登录失败，请检查网络连接'
        this.showMessage(errorMsg, 'error')
      } finally {
        this.loading = false
      }
    },
    
    async handleRegister() {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.showMessage('两次输入的密码不一致', 'error')
        return
      }
      
      this.loading = true
      
      try {
        const response = await api.post('/auth/register', {
          username: this.registerForm.username,
          email: this.registerForm.email,
          password: this.registerForm.password
        })
        
        if (response.data.status === 'success') {
          this.showMessage('注册成功！正在自动登录...', 'success')
          
          // 清空表单
          this.registerForm = {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          }
          
          // 自动登录
          try {
            const loginResponse = await api.post('/auth/login', {
              username: this.registerForm.username,
              password: this.registerForm.password
            })
            
            if (loginResponse.data.status === 'success') {
              const token = loginResponse.data.Authorization.replace('Bearer ', '')
              localStorage.setItem('access_token', token)
              localStorage.setItem('user_info', JSON.stringify(loginResponse.data.data))
              
              this.showMessage('注册并登录成功！正在跳转...', 'success')
              
              setTimeout(() => {
                this.$router.push('/timeline')
              }, 2000)
            } else {
              this.showMessage('注册成功！请手动登录', 'success')
              setTimeout(() => {
                this.switchTab('login')
                this.loginForm.username = this.registerForm.username
              }, 2000)
            }
          } catch (loginError) {
            this.showMessage('注册成功！请手动登录', 'success')
            setTimeout(() => {
              this.switchTab('login')
              this.loginForm.username = this.registerForm.username
            }, 2000)
          }
        } else {
          this.showMessage(response.data.data || '注册失败', 'error')
        }
      } catch (error) {
        console.error('注册错误:', error)
        const errorMsg = error.response?.data?.data || error.message || '注册失败，请检查网络连接'
        this.showMessage(errorMsg, 'error')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.auth-page {
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-container {
  background: white;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
  overflow: hidden;
  width: 100%;
  max-width: 900px;
  min-height: 600px;
  display: flex;
}

.auth-left {
  flex: 1;
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.auth-left h1 {
  font-size: 3em;
  margin-bottom: 20px;
  font-weight: 300;
}

.auth-left p {
  font-size: 1.2em;
  opacity: 0.9;
  line-height: 1.6;
}

.auth-right {
  flex: 1;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-tabs {
  display: flex;
  margin-bottom: 40px;
  border-bottom: 1px solid #e9ecef;
}

.tab-btn {
  flex: 1;
  padding: 15px;
  background: none;
  border: none;
  font-size: 1.1em;
  font-weight: 600;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: #00b894;
  border-bottom-color: #00b894;
}

.message {
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
}

.form-group input {
  width: 100%;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #00b894;
}

.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 20px;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.redirect-link a {
  color: #00b894;
  text-decoration: none;
  font-weight: 600;
}

.redirect-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    max-width: 400px;
  }
  
  .auth-left {
    padding: 40px 20px;
  }
  
  .auth-left h1 {
    font-size: 2em;
  }
  
  .auth-right {
    padding: 40px 20px;
  }
}
</style>
