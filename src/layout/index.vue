<template>
  <el-container class="layout-container">
    <el-aside width="220px">
      <div class="logo">
        <span>北大青鸟教务系统</span>
      </div>
      <el-menu
        router
        :default-active="$route.path"
        class="el-menu-vertical"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF">
        <el-menu-item index="/main/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/main/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="/main/discipline">
          <el-icon><Warning /></el-icon>
          <span>违纪管理</span>
        </el-menu-item>
        <el-menu-item index="/main/interviews">
          <el-icon><ChatLineRound /></el-icon>
          <span>访谈管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          <el-icon class="fold-icon" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse"/>
            <Expand v-else/>
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <el-icon><User /></el-icon>
              <span>欢迎你，{{ teacherName }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  User, Warning, ChatLineRound, Fold, 
  Expand, DataLine 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const currentRoute = computed(() => {
  const routeMap = {
    '/dashboard': '控制台',
    '/students': '学生管理',
    '/discipline': '违纪管理',
    '/interviews': '访谈管理'
  }
  return routeMap[route.path] || '首页'
})

const handleLogout = () => {
  localStorage.removeItem('token')
  ElMessage.success('退出成功')
  router.push('/login')
}

const teacherName = computed(() => {
  return localStorage.getItem('teacherName') || '老师'
})
</script>

<style scoped>
/* 将原 App.vue 的样式复制到这里 */
.layout-container {
  height: 100vh;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: #002140;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.el-header {
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.fold-icon {
  font-size: 20px;
  cursor: pointer;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #333;
  font-size: 14px;
  padding: 0 8px;
  height: 40px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.user-info .el-icon {
  font-size: 16px;
  color: #666;
}

:deep(.el-dropdown-menu__item--divided::before) {
  display: none;
}

:deep(.el-dropdown-menu__item--divided) {
  margin-top: 0;
  border-top: none;
}

:deep(.el-popper) {
  border-radius: 4px;
}

:deep(.el-dropdown-menu) {
  padding: 4px 0;
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  font-size: 14px;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-popper.is-light) {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-aside {
  background-color: #001529;
  transition: width 0.3s;
}

.el-menu {
  border-right: none;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style> 