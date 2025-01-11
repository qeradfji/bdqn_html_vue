<template>
  <div class="home-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="data-card">
          <div class="data-item">
            <div class="data-title">学生总人数</div>
            <div class="data-value">{{ studentCount }}</div>
          </div>
        </el-card>
      </el-col>
      <!-- 其他统计卡片... -->
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllStudentCount } from '@/api/student'

const studentCount = ref(0)

// 获取学生总数
const fetchStudentCount = async () => {
  try {
    const res = await getAllStudentCount()
    if (res.code === 200) {
      studentCount.value = res.data
    }
  } catch (error) {
    console.error('获取学生总数失败:', error)
  }
}

onMounted(() => {
  fetchStudentCount()
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.data-card {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-item {
  text-align: center;
}

.data-title {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.data-value {
  font-size: 28px;
  font-weight: bold;
  color: #409EFF;
}
</style> 