<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="login-title">北大青鸟教务系统</div>
        <div class="login-subtitle">Teacher Management System</div>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            size="large"
            clearable
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="login-button"
            size="large"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-copyright">
        Copyright © {{ new Date().getFullYear() }} 北大青鸟
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { login } from '../api/user'

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = () => {
  if (!loginFormRef.value) return
  
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await login(loginForm)
        console.log('登录响应:', res)
        
        if (res.code === 200) {
          const teacherName = res.data.realName
          const userId = res.data.userId
          
          localStorage.setItem('teacherName', teacherName)
          localStorage.setItem('userId', String(userId))
          localStorage.setItem('userInfo', JSON.stringify({
            username: res.data.username,
            realName: teacherName,
            userId: userId,
            role: res.data.role
          }))
          
          ElMessage.success('登录成功')
          router.replace('/main/dashboard')
        } else {
          ElMessage.error(res.message || '登录失败')
        }
      } catch (error) {
        console.error('登录错误:', error)
        ElMessage.error('登录失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1890ff 0%, #001529 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.05)" fill-opacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,165.3C672,160,768,96,864,90.7C960,85,1056,139,1152,144C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
  background-size: cover;
}

.login-box {
  width: 420px;
  padding: 40px 35px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  position: relative;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #001529;
  margin-bottom: 8px;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-subtitle {
  font-size: 16px;
  color: #666;
  letter-spacing: 1px;
}

.login-form {
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 25px;
}

.login-form :deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  box-shadow: none;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
  padding: 0 15px;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #1890ff;
  background-color: #fff;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  background-color: #fff;
  border-color: #1890ff;
  box-shadow: 0 0 0 1px #1890ff;
}

.login-form :deep(.el-input__inner) {
  height: 45px;
}

.login-form :deep(.el-input__prefix-inner) {
  font-size: 18px;
  color: #909399;
}

.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  letter-spacing: 4px;
  background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
  border: none;
  transition: all 0.3s;
}

.login-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.login-copyright {
  text-align: center;
  color: #666;
  font-size: 12px;
  margin-top: 20px;
  opacity: 0.8;
}

/* 添加动画效果 */
.login-box {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media screen and (max-width: 576px) {
  .login-box {
    width: 90%;
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .login-subtitle {
    font-size: 14px;
  }
}
</style> 