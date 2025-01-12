<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">
        <span>教务管理系统</span>
      </div>
      <el-menu
        :default-active="route.path"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
        router>
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/admin/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/teachers">
          <el-icon><UserFilled /></el-icon>
          <span>教师管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/guardian">
          <el-icon><Avatar /></el-icon>
          <span>家长管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/classes">
          <el-icon><School /></el-icon>
          <span>班级管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/disciplinary">
          <el-icon><Warning /></el-icon>
          <span>违纪管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/interview">
          <el-icon><ChatDotRound /></el-icon>
          <span>访谈管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/department">
          <el-icon><OfficeBuilding /></el-icon>
          <span>部门管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ teacherName }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Odometer, 
  User, 
  UserFilled, 
  School, 
  ArrowDown, 
  Warning,
  ChatDotRound,
  OfficeBuilding,
  Avatar
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const teacherName = ref(localStorage.getItem('teacherName') || '管理员')

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.clear()
    router.push('/login')
    ElMessage.success('退出成功')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  padding: 0 20px;
  background-color: #2b3649;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.el-aside {
  background-color: #304156;
}
</style> 