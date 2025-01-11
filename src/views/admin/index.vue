<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 学生总数卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>学生总数</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="card-content">
            <count-to
              :start-val="0"
              :end-val="studentCount"
              :duration="2000"
              class="card-number"
            />
            <div class="card-label">总人数</div>
          </div>
        </el-card>
      </el-col>

      <!-- 其他现有的卡片保持不变 -->
    </el-row>

    <!-- 其他内容保持不变 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User } from '@element-plus/icons-vue'
import CountTo from 'vue-count-to'  // 如果使用了数字动画组件
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
  // 其他现有的初始化代码保持不变
})
</script>

<style scoped>
.dashboard-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  text-align: center;
  padding: 20px 0;
}

.card-number {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  line-height: 1;
}

.card-label {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

/* 其他现有的样式保持不变 */
</style>