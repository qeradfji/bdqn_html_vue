<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <Menu />
    </el-aside>
    <el-container>
      <el-header>
        <Header />
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
import Menu from './components/Menu.vue'
import Header from './components/Header.vue'
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.el-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}
</style> 