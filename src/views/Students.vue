<template>
  <div class="students-container">
    <!-- 搜索区域 -->
    <el-card class="filter-card" shadow="hover">
      <div class="filter-header">
        <div class="left">
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
        </div>
        <div class="right">
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            :on-change="handleFileChange"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>导入Excel
            </el-button>
          </el-upload>
          <el-button type="info" @click="downloadTemplate">
            <el-icon><Download /></el-icon>下载模板
          </el-button>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>导出Excel
          </el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>添加学生
          </el-button>
        </div>
      </div>
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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>添加学生
          </el-button>
        </div>
      </template>
      
      <el-table 
        :data="studentList" 
        border 
        stripe
        v-loading="loading"
        style="width: 100%">
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="classe" label="班级" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="enrollmentDate" label="入学时间" width="120" />
        <el-table-column prop="age" label="年龄" width="80" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(scope.row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(scope.row)">
                <el-icon><Delete /></el-icon>删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加学生' : '编辑学生'"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        style="max-width: 460px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNo">
              <el-input v-model="form.studentNo" :disabled="dialogType === 'edit'" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="classe">
              <el-input v-model="form.classe" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option label="在读" :value="1" />
                <el-option label="休学" :value="2" />
                <el-option label="退学" :value="3" />
                <el-option label="毕业" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入学时间" prop="enrollmentDate">
              <el-date-picker
                v-model="form.enrollmentDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input v-model="form.age" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="form.wechat" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="QQ号" prop="qq">
              <el-input v-model="form.qq" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model="form.nation" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="籍贯" prop="nativePlace">
              <el-input v-model="form.nativePlace" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="政治面貌" prop="politicalStatus">
              <el-input v-model="form.politicalStatus" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="婚姻状况" prop="maritalStatus">
              <el-select v-model="form.maritalStatus" placeholder="请选择">
                <el-option label="未婚" :value="1" />
                <el-option label="已婚" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="现居地址" prop="address">
              <el-input v-model="form.address" type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Edit, Delete, Plus, Search, Refresh, Document, User, Phone, Male, Female, List, Download, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getStudentList, 
  addStudent, 
  updateStudent, 
  deleteStudent,
  getStudentListByHeadteacher,
  importStudents
} from '@/api/student'
import { exportStudentExcel } from '@/utils/excel'
import { parseExcel, generateExampleExcel } from '../utils/importExcel.js'

// 表格数据
const loading = ref(false)
const studentList = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const filterForm = reactive({
  name: ''  // 只保留姓名查询
})

// 弹窗表单
const dialogVisible = ref(false)
const dialogType = ref('add') // add 或 edit
const formRef = ref(null)
const form = reactive({
  studentId: '',
  studentNo: '',
  name: '',
  phone: '',
  status: 1,
  classId: '',
  teacherId: '',
  enrollmentDate: '',
  graduationDate: '',
  wechat: '',
  qq: '',
  idCard: '',
  birthday: '',
  nation: '',
  nativePlace: '',
  politicalStatus: '',
  maritalStatus: 1,
  address: '',
  age: '',
  classe: ''
})

// 表单验证规则
const rules = {
  studentNo: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  classe: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  idCard: [
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

// 获取学生列表
const fetchStudentList = async () => {
  loading.value = true
  try {
    const teacherName = localStorage.getItem('teacherName')
    console.log('当前教师名称:', teacherName)
    
    if (!teacherName) {
      ElMessage.error('获取教师信息失败，请重新登录')
      return
    }
    
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      headteacher: teacherName,
      name: filterForm.name || undefined
    }
    
    console.log('请求参数:', params)
    const res = await getStudentListByHeadteacher(params)
    console.log('响应数据:', res)
    
    if (res.data && res.data.records) {
      studentList.value = res.data.records
      total.value = res.data.total
    } else {
      studentList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    if (error.response) {
      console.error('错误状态码:', error.response.status)
      console.error('错误信息:', error.response.data)
    }
    ElMessage.error(error.message || error.msg || '获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchStudentList()
}

// 重置搜索
const resetForm = () => {
  filterForm.name = ''
  currentPage.value = 1
  fetchStudentList()
}

// 分页变化
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchStudentList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchStudentList()
}

// 添加学生
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  
  // 重置表单
  Object.keys(form).forEach(key => {
    form[key] = ''
  })
  
  // 设置默认值
  form.gender = '男'
  form.status = 1
  // 自动添加班主任字段
  form.headteacher = localStorage.getItem('teacherName') || ''
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 编辑学生
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.keys(form).forEach(key => {
    form[key] = row[key]
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      try {
        // 确保提交时包含 headteacher 字段
        const submitData = {
          ...form,
          headteacher: localStorage.getItem('teacherName')
        }
        
        if (dialogType.value === 'add') {
          await addStudent(submitData)
          ElMessage.success('添加成功')
        } else {
          await updateStudent(submitData)
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        fetchStudentList()
      } catch (error) {
        ElMessage.error(error.msg || '操作失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除学生
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除学生 ${row.name} 的信息吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteStudent(row.studentId)
      ElMessage.success('删除成功')
      fetchStudentList()
    } catch (error) {
      ElMessage.error(error.msg || '删除失败')
    }
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '在读',
    2: '休学',
    3: '退学',
    4: '毕业'
  }
  return statusMap[status] || '未知'
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    1: 'success',
    2: 'warning',
    3: 'danger',
    4: 'info'
  }
  return typeMap[status] || ''
}

// 添加导出处理函数
const handleExport = async () => {
  try {
    loading.value = true
    // 获取所有学生数据用于导出
    const res = await getStudentListByHeadteacher({
      pageSize: 999999, // 获取所有数据
      pageNum: 1
    })
    
    if (res.code === 200 && res.data.records) {
      exportStudentExcel(res.data.records)
      ElMessage.success('导出成功')
    } else {
      ElMessage.error('导出失败：没有数据')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    loading.value = false
  }
}

// 处理文件选择
const handleFileChange = async (file) => {
  if (!file) return
  
  try {
    ElMessage.info('正在解析Excel文件...')
    const students = await parseExcel(file.raw)
    
    if (students.length === 0) {
      ElMessage.warning('Excel文件中没有数据')
      return
    }
    
    // 确认导入
    ElMessageBox.confirm(
      `确认导入 ${students.length} 条学生数据吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        const teacherName = localStorage.getItem('teacherName')
        const studentsWithTeacher = students.map(student => ({
          ...student,
          headteacher: teacherName,
          status: 1
        }))
        
        await importStudents(studentsWithTeacher)
        ElMessage.success('导入成功')
        fetchStudentList() // 刷新列表
      } catch (error) {
        console.error('导入失败:', error)
        ElMessage.error('导入失败')
      }
    })
  } catch (error) {
    console.error('文件处理失败:', error)
    ElMessage.error('文件处理失败，请确保文件格式正确')
  }
}

// 下载模板
const downloadTemplate = () => {
  generateExampleExcel()
}

// 页面加载时获取数据
onMounted(() => {
  fetchStudentList()
})
</script>

<style scoped>
.students-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  margin-bottom: 0;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header .left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header .icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

/* 动画效果 */
.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.upload-demo {
  display: inline-block;
  margin-right: 10px;
}
</style> 