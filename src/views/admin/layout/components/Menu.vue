<template>
  <div class="menu-container">
    <div class="logo">
      <span>超级管理员</span>
    </div>
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      :collapse="isCollapse"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
      @select="handleSelect"
    >
      <el-menu-item index="/admin/dashboard">
        <el-icon><Monitor /></el-icon>
        <template #title>控制台</template>
      </el-menu-item>
      
      <el-menu-item index="/admin/students">
        <el-icon><User /></el-icon>
        <template #title>学生管理</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Monitor, User } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const activeMenu = computed(() => {
  return route.path
})

const handleSelect = (index) => {
  console.log('选中菜单:', index)
  router.push(index)
}
</script>

<style scoped>
.menu-container {
  height: 100%;
  background-color: #304156;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  background-color: #2b3a4d;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}

:deep(.el-menu-item) {
  &.is-active {
    background-color: #263445 !important;
  }
  
  &:hover {
    background-color: #263445 !important;
  }
}

:deep(.el-menu-item) {
  .el-icon {
    width: 24px;
    margin-right: 5px;
  }
}
</style> 