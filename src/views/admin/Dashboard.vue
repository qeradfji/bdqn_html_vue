<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 班级数量卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="statistic-card">
          <div class="statistic-item">
            <div class="icon-wrapper blue">
              <el-icon><School /></el-icon>
            </div>
            <div class="content">
              <div class="title">班级总数</div>
              <div class="number">{{ statistics.classCount }}</div>
              <div class="text">个班级</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 学生数量卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="statistic-card">
          <div class="statistic-item">
            <div class="icon-wrapper green">
              <el-icon><User /></el-icon>
            </div>
            <div class="content">
              <div class="title">学生总数</div>
              <div class="number">{{ statistics.studentCount }}</div>
              <div class="text">名学生</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 违纪数量卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="statistic-card">
          <div class="statistic-item">
            <div class="icon-wrapper red">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="content">
              <div class="title">违纪总数</div>
              <div class="number">{{ statistics.disciplinaryCount }}</div>
              <div class="text">条违纪记录</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 部门数量卡片 -->
      <el-col :span="6">
        <el-card shadow="hover" class="statistic-card">
          <div class="statistic-item">
            <div class="icon-wrapper purple">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="content">
              <div class="title">部门总数</div>
              <div class="number">{{ statistics.departmentCount }}</div>
              <div class="text">个部门</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 其他统计卡片 -->
      <!-- ... -->
    </el-row>

    <!-- 图表行 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div ref="genderChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div ref="disciplinaryTrendRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import * as echarts from 'echarts'  // 导入 echarts
import {
  Histogram,
  User,
  School,
  Warning,
  OfficeBuilding
} from '@element-plus/icons-vue'

// 统计数据
const statistics = ref({
  classCount: 0,
  studentCount: 0,
  disciplinaryCount: 0,
  departmentCount: 0
})

// 性别分布数据
const genderData = ref({
  male: 0,
  female: 0
})

// 获取班级数量
const fetchClassCount = async () => {
  try {
    const res = await request.get('/sys-class/count')
    if (res.code === 200) {
      statistics.value.classCount = res.data
    }
  } catch (error) {
    console.error('获取班级数量失败:', error)
  }
}

// 获取学生数量
const fetchStudentCount = async () => {
  try {
    const res = await request.get('/sys-student/count-all', {
      params: {
        status: 1  // 获取正常状态的学生总数
      }
    })
    
    if (res.code === 200) {
      statistics.value.studentCount = res.data
    } else {
      console.error('获取学生数量失败:', res.message)
    }
  } catch (error) {
    console.error('获取学生数量失败:', error)
  }
}

// 获取违纪数量统计
const fetchDisciplinaryCount = async () => {
  try {
    const res = await request.get('/sys-student-disciplinary/type-count-by-processor')
    if (res.code === 200) {
      // 只计算总数
      statistics.value.disciplinaryCount = res.typeCount.reduce((total, item) => total + item.count, 0)
    } else {
      console.error('获取违纪统计失败:', res.message)
    }
  } catch (error) {
    console.error('获取违纪统计失败:', error)
  }
}

// 获取部门数量
const fetchDepartmentCount = async () => {
  try {
    const res = await request.get('/sys-department/count')
    if (res.code === 200) {
      statistics.value.departmentCount = res.count
    } else {
      console.error('获取部门数量失败:', res.message)
    }
  } catch (error) {
    console.error('获取部门数量失败:', error)
  }
}

// 性别分布图表
const genderChartRef = ref(null)
let genderChart = null

// 获取性别分布数据
const fetchGenderDistribution = async () => {
  try {
    const res = await request.get('/sys-student/count-by-sex')
    if (res.code === 200) {
      genderData.value = res.data
      initGenderChart()
    } else {
      console.error('获取性别分布失败:', res.message)
    }
  } catch (error) {
    console.error('获取性别分布失败:', error)
  }
}

// 初始化性别分布图表
const initGenderChart = () => {
  if (!genderChartRef.value) return

  genderChart = echarts.init(genderChartRef.value)
  const option = {
    title: {
      text: '学生性别分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%'
    },
    series: [
      {
        name: '性别分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}人'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { 
            value: genderData.value.male, 
            name: '男生',
            itemStyle: { color: '#409EFF' }
          },
          { 
            value: genderData.value.female, 
            name: '女生',
            itemStyle: { color: '#FF69B4' }
          }
        ]
      }
    ]
  }

  genderChart.setOption(option)
}

// 违规趋势图表
const disciplinaryTrendRef = ref(null)
let disciplinaryTrendChart = null

// 初始化违规趋势图表
const initDisciplinaryTrendChart = () => {
  if (!disciplinaryTrendRef.value) return

  disciplinaryTrendChart = echarts.init(disciplinaryTrendRef.value)
  const option = {
    title: {
      text: '学生违规趋势分析',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['学生总数', '违规总数'],
      bottom: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['总数对比']
    },
    yAxis: {
      type: 'value',
      name: '人数/次数'
    },
    series: [
      {
        name: '学生总数',
        type: 'bar',
        data: [statistics.value.studentCount],
        itemStyle: {
          color: '#67C23A'
        },
        label: {
          show: true,
          position: 'top'
        }
      },
      {
        name: '违规总数',
        type: 'bar',
        data: [statistics.value.disciplinaryCount],
        itemStyle: {
          color: '#F56C6C'
        },
        label: {
          show: true,
          position: 'top'
        }
      }
    ]
  }

  disciplinaryTrendChart.setOption(option)
}

// 更新所有图表
const updateCharts = () => {
  initGenderChart()
  initDisciplinaryTrendChart()
}

// 监听窗口大小变化
const handleResize = () => {
  if (genderChart) {
    genderChart.resize()
  }
  if (disciplinaryTrendChart) {
    disciplinaryTrendChart.resize()
  }
}

// 初始化数据
onMounted(async () => {
  await Promise.all([
    fetchClassCount(),
    fetchStudentCount(),
    fetchDisciplinaryCount(),
    fetchDepartmentCount(),
    fetchGenderDistribution()
  ])
  
  // 等待所有数据加载完成后初始化图表
  nextTick(() => {
    updateCharts()
  })
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (genderChart) {
    genderChart.dispose()
  }
  if (disciplinaryTrendChart) {
    disciplinaryTrendChart.dispose()
  }
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.statistic-card {
  margin-bottom: 20px;
  width: 332px;
  height: 170px;
}

.statistic-item {
  display: flex;
  align-items: center;
  padding: 20px;
  height: 100%;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
}

.icon-wrapper :deep(.el-icon) {
  font-size: 30px;
  color: #fff;
}

.content {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 16px;
  color: #909399;
  margin-bottom: 8px;
}

.number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.text {
  font-size: 14px;
  color: #909399;
}

.type-list {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #EBEEF5;
  flex: 1;
  overflow-y: auto;
}

.type-item {
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
}

.blue {
  background-color: #409EFF;
}

.green {
  background-color: #67C23A;
}

.red {
  background-color: #F56C6C;
}

.purple {
  background-color: #909399;
}

.chart-card {
  margin-top: 20px;
}

.chart-container {
  height: 400px;
  width: 100%;
}
</style> 