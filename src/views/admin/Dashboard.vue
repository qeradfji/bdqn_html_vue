<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 学生总数卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-wrapper">
            <div class="card-label">学生总数</div>
            <div class="card-value">{{ studentCount }}</div>
            <div class="card-footer">在校学生总人数</div>
          </div>
        </el-card>
      </el-col>

      <!-- 班级总数卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <div class="card-title">班级总数</div>
          </div>
          <div class="card-body">
            <div class="card-value">{{ classCount }}</div>
            <div class="card-label">班级数量</div>
          </div>
        </el-card>
      </el-col>

      <!-- 教师总数卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <div class="card-header">
            <div class="card-title">教师总数</div>
          </div>
          <div class="card-body">
            <div class="card-value">{{ teacherCount }}</div>
            <div class="card-label">教师数量</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllStudentCount } from '@/api/student'

// 学生总数
const studentCount = ref(0)

// 获取学生总数
const fetchStudentCount = async () => {
  try {
    const res = await getAllStudentCount()
    if (res.code === 200) {
      studentCount.value = res.data
    } else {
      console.error('获取学生总数失败:', res.message)
    }
  } catch (error) {
    console.error('获取学生总数失败:', error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchStudentCount()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-card {
  height: 180px;
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 4px;
}

.card-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.card-label {
  font-size: 15px;
  color: #909399;
  margin-bottom: 15px;
}

.card-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 23px;
}

.card-footer {
  font-size: 13px;
  color: #909399;
}

/* 覆盖 element-plus 的默认样式 */
:deep(.el-card__body) {
  height: 100%;
  padding: 0;
}

:deep(.el-card) {
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

:deep(.el-card:hover) {
  border-color: #c6e2ff;
}

/* 为不同卡片设置不同的数字颜色 */
.dashboard-card:nth-child(1) .card-value {
  color: #409EFF;
}

.dashboard-card:nth-child(2) .card-value {
  color: #722ed1;
}

.dashboard-card:nth-child(3) .card-value {
  color: #fa8c16;
}

.dashboard-card:nth-child(4) .card-value {
  color: #52c41a;
}
</style> 