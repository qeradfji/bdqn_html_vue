<template>
  <div class="students-container">
    <!-- 搜索区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="姓名">
          <el-input v-model="filterForm.name" placeholder="请输入姓名" clearable>
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="resetForm">
              <el-icon><Refresh /></el-icon>重置
            </el-button>
          </el-button-group>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="left">
            <el-icon class="icon"><List /></el-icon>
            <span class="title">学生列表</span>
            <el-tag type="info" effect="plain" round>共 {{ total }} 条</el-tag>
          </div>
          <div class="right">
            <el-button-group>
              <el-button type="primary" @click="handleDownloadTemplate">
                <el-icon><Download /></el-icon>下载模板
              </el-button>
              <el-upload
                class="upload-demo"
                :show-file-list="false"
                :before-upload="handleImport">
                <el-button type="success">
                  <el-icon><Upload /></el-icon>导入Excel
                </el-button>
              </el-upload>
              <el-button type="warning" @click="handleExport">
                <el-icon><Download /></el-icon>导出Excel
              </el-button>
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>新增学生
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 表格内容 -->
      <el-table :data="studentList" border stripe v-loading="loading">
        <!-- 表格列配置 -->
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="classe" label="班级" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '在读' : '离校' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, User, List, Plus, Download, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStudentList, deleteStudent } from '@/api/student'
import { exportExcel } from '@/utils/excel'

// 表格数据
const loading = ref(false)
const studentList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const filterForm = reactive({
  name: ''
})

// 获取学生列表
const fetchStudentList = async () => {
  loading.value = true
  try {
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      name: filterForm.name || undefined
    }
    
    const res = await getStudentList(params)
    if (res.code === 200) {
      studentList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索和重置
const handleSearch = () => {
  currentPage.value = 1
  fetchStudentList()
}

const resetForm = () => {
  filterForm.name = ''
  currentPage.value = 1
  fetchStudentList()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchStudentList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchStudentList()
}

// 导出学生数据到Excel
const handleExport = () => {
  try {
    // 准备表头数据
    const headers = [
      { header: '学号', key: 'studentNo', width: 15 },
      { header: '姓名', key: 'name', width: 10 },
      { header: '性别', key: 'gender', width: 8 },
      { header: '年龄', key: 'age', width: 8 },
      { header: '手机号', key: 'phone', width: 15 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '班级', key: 'className', width: 15 },
      { header: '入学时间', key: 'enrollTime', width: 15 },
      { header: '状态', key: 'status', width: 8 },
      { header: '备注', key: 'remark', width: 20 }
    ]

    // 准备导出数据
    const data = classList.value.map(student => ({
      studentNo: student.studentNo,
      name: student.name,
      gender: student.gender === 1 ? '男' : '女',
      age: student.age,
      phone: student.phone,
      email: student.email,
      className: student.className,
      enrollTime: student.enrollTime,
      status: student.status === 1 ? '在读' : '离校',
      remark: student.remark || ''
    }))

    // 调用通用导出方法
    exportExcel({
      title: '北大青鸟教务系统 - 学生信息表',
      headers,
      data,
      filename: '学生信息表.xlsx'
    })

    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 下载模板
const handleDownloadTemplate = () => {
  try {
    // 准备表头数据
    const headers = [
      { header: '学号', key: 'studentNo', width: 15 },
      { header: '姓名', key: 'name', width: 10 },
      { header: '性别', key: 'gender', width: 12 },
      { header: '年龄', key: 'age', width: 10 },
      { header: '手机号', key: 'phone', width: 20 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '班级', key: 'className', width: 15 },
      { header: '入学时间', key: 'enrollTime', width: 15 },
      { header: '状态', key: 'status', width: 12 },
      { header: '备注', key: 'remark', width: 20 }
    ]

    // 准备模板数据
    const data = [{
      studentNo: '示例：2024001',
      name: '示例：张三',
      gender: '示例：男/女',
      age: '示例：18',
      phone: '示例：13800138000',
      email: '示例：zhangsan@example.com',
      className: '示例：Java开发1班',
      enrollTime: '示例：2024-01-01',
      status: '示例：在读/离校',
      remark: '示例：任何补充说明'
    }]

    // 调用通用导出方法
    exportExcel({
      title: '北大青鸟教务系统 - 学生信息模板',
      headers,
      data,
      filename: '学生信息导入模板.xlsx'
    })

    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('模板下载失败:', error)
    ElMessage.error('模板下载失败')
  }
}

// 导入Excel
const handleImport = async (file) => {
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 转换为JSON数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // 移除表头
        jsonData.shift()
        
        // 转换为学生对象数组
        const studentList = jsonData.map(row => ({
          studentNo: row[0],
          name: row[1],
          classe: row[2],
          phone: row[3],
          age: parseInt(row[4]) || 0,
          idCard: row[5],
          nation: row[6],
          nativePlace: row[7],
          politicalStatus: row[8],
          address: row[9],
          wechat: row[10],
          qq: row[11],
          enrollmentDate: row[12],
          status: 1
        }))

        // 发送数据到后端
        const res = await importStudents(studentList)
        
        if (res.code === 200) {
          const { successCount, failCount, failList } = res.data
          if (failCount > 0) {
            ElMessage.warning(`导入完成：成功${successCount}条，失败${failCount}条`)
            console.error('失败数据:', failList)
          } else {
            ElMessage.success(`成功导入${successCount}条数据`)
          }
          fetchStudentList()
        } else {
          ElMessage.error(res.message || '导入失败')
        }
      } catch (error) {
        console.error('处理Excel数据失败:', error)
        ElMessage.error('处理Excel数据失败')
      }
    }
    reader.readAsArrayBuffer(file)
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
  return false
}

onMounted(() => {
  fetchStudentList()
})
</script>

<style scoped>
.students-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 20px;
}

.title {
  font-size: 16px;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-button-group {
  display: flex;
  gap: 10px;
}

:deep(.el-upload) {
  width: auto;
}

:deep(.el-upload-list) {
  display: none;
}
</style> 