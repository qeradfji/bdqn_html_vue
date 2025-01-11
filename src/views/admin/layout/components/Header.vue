<template>
  <div class="header-container">
    <div class="left">
      <el-icon class="toggle-icon" @click="toggleSidebar">
        <Expand v-if="isCollapse" />
        <Fold v-else />
      </el-icon>
      <Breadcrumb />
    </div>
    <div class="right">
      <el-dropdown trigger="click" @command="handleCommand">
        <span class="user-info">
          <img :src="userAvatar" class="avatar">
          <span class="username">{{ username }}</span>
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Expand, Fold, CaretBottom } from '@element-plus/icons-vue'
import Breadcrumb from './Breadcrumb.vue'

const router = useRouter()
const isCollapse = ref(false)
const username = ref(localStorage.getItem('teacherName') || '管理员')
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.clear()
    router.push('/login')
    ElMessage.success('退出成功')
  }
}
</script>

<style scoped>
.header-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
}

.left {
  display: flex;
  align-items: center;
}

.toggle-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 20px;
  color: #606266;
}

.right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.username {
  margin-right: 4px;
  font-size: 14px;
}
</style> 