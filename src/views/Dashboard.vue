<template>
  <div class="dashboard-container">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>学生总数</span>
              <el-icon><User /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ stats.studentCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>违纪总数</span>
              <el-icon><Warning /></el-icon>
            </div>
          </template>
          <div class="card-value">{{ stats.disciplineCount }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row class="chart-row">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>违纪类型分布</span>
            </div>
          </template>
          <div class="chart-container" ref="pieChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import { User, Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getStudentCount, getDisciplineCount } from '@/api/dashboard'
import { ElMessage } from 'element-plus'

// 只保留需要的统计数据
const stats = reactive({
  studentCount: 0,
  disciplineCount: 0
})

let pieChart = null
const pieChartRef = ref(null)

// 初始化饼图
const initPieChart = (data) => {
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    title: {
      text: '违纪类型统计',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  })
}

// 获取统计数据
const fetchStats = async () => {
  try {
    const teacherName = localStorage.getItem('teacherName')
    if (!teacherName) {
      console.warn('未获取到教师信息')
      return
    }

    const [studentRes, disciplineRes] = await Promise.all([
      getStudentCount(),
      getDisciplineCount()
    ])

    if (studentRes.code === 200) {
      stats.studentCount = studentRes.data.studentCount
    }

    if (disciplineRes.code === 200 && disciplineRes.typeCount) {
      stats.disciplineCount = disciplineRes.typeCount.reduce((total, item) => {
        return total + item.count
      }, 0)
      
      const pieData = disciplineRes.typeCount.map(item => ({
        name: item.type,
        value: item.count
      }))
      initPieChart(pieData)
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  }
}

onMounted(() => {
  fetchStats()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
})

const handleResize = () => {
  pieChart?.resize()
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.stat-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .card-value {
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    color: #409EFF;
  }
}

.chart-row {
  margin-top: 20px;
}

.chart-container {
  height: 400px;
}
</style> 