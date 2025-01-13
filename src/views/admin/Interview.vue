<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { addInterview, getStudentOptions, getClassOptions, getTeacherOptions } from '@/api/interview'

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const filterForm = reactive({
  studentName: ''  // 学生姓名用于模糊查询
})

// 对话框控制
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const form = reactive({
  studentId: undefined,      // 学生ID
  classId: undefined,       // 班级ID
  teacherId: null,          // 教师ID，改为 null
  interviewDate: '',        // 访谈日期
  interviewType: 1,         // 访谈类型，默认为学员访谈
  content: '',              // 访谈内容
  feedback: '',             // 反馈建议
  status: 1,                // 状态，默认为正常
  // 以下是显示用的字段
  studentName: '',          // 学生姓名
  className: '',           // 班级名称
  teacherName: ''          // 教师姓名
})

// 访谈类型选项
const interviewTypes = [
  { label: '学员访谈', value: 1 },
  { label: '监护人访谈', value: 2 }
]

// 状态选项
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '需要关注', value: 2 }
]

// 获取访谈类型标签
const getInterviewTypeLabel = (type) => {
  const found = interviewTypes.find(item => item.value === type)
  return found ? found.label : '未知类型'
}

// 表单验证规则
const rules = {
  studentId: [
    { required: true, message: '请选择学生', trigger: 'change' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  interviewDate: [
    { required: true, message: '请选择访谈日期', trigger: 'change' }
  ],
  interviewType: [
    { required: true, message: '请选择访谈类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入访谈内容', trigger: 'blur' }
  ],
  feedback: [
    { required: true, message: '请输入反馈建议', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  teacherId: [
    { required: true, message: '请选择访谈教师', trigger: 'change' }
  ]
}

// 获取访谈记录列表
const fetchInterviewList = async () => {
  loading.value = true
  try {
    const params = {
      current: currentPage.value,
      size: pageSize.value,
      studentName: filterForm.studentName || undefined
    }
    
    const res = await request({
      url: '/sys-interview/list-by-student-name-and-teacher-id',
      method: 'GET',
      params
    })
    
    if (res.code === 200) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取访谈记录失败')
    }
  } catch (error) {
    console.error('获取访谈记录失败:', error)
    ElMessage.error('获取访谈记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchInterviewList()
}

// 重置搜索
const handleReset = () => {
  filterForm.studentName = ''  // 重置学生姓名
  currentPage.value = 1
  fetchInterviewList()
}

// 分页变化
const handlePageChange = (val) => {
  currentPage.value = val
  fetchInterviewList()
}

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchInterviewList()
}

// 编辑记录
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    interviewId: row.interviewId,
    studentId: row.studentId,
    classId: row.classId,
    teacherId: row.teacherId,
    interviewDate: row.interviewDate,
    interviewType: row.interviewType,
    content: row.content,
    feedback: row.feedback,
    status: row.status,
    studentName: row.studentName,
    className: row.className,
    teacherName: row.teacherName
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 获取当前教师信息
        const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}')
        
        console.log('Form before submit:', form)  // 添加日志
        
        // 确保有选择教师
        if (!form.teacherId) {
          ElMessage.warning('请选择访谈教师')
          return
        }

        // 构造提交数据
        const submitData = {
          studentId: form.studentId,
          classId: form.classId,
          teacherId: Number(form.teacherId),  // 确保是数字类型
          interviewDate: form.interviewDate,
          interviewType: form.interviewType,
          content: form.content,
          feedback: form.feedback,
          status: form.status,
          createBy: teacherInfo.id,
          updateBy: teacherInfo.id
        }

        console.log('Submit data:', submitData)  // 添加日志

        const res = await addInterview(submitData)
        
        if (res.code === 200) {
          ElMessage.success('添加成功')
          dialogVisible.value = false
          fetchInterviewList()
          resetForm()
        } else {
          ElMessage.error(res.message || '添加失败')
        }
      } catch (error) {
        console.error('添加失败:', error)
        ElMessage.error(error.message || '添加失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    interviewId: undefined,
    studentId: undefined,
    classId: undefined,
    teacherId: undefined,  // 改回 undefined
    interviewDate: '',
    interviewType: undefined,
    content: '',
    feedback: '',
    status: 1,
    studentName: '',
    className: '',
    teacherName: ''
  })
}

// 删除记录
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除学生 ${row.studentName} 的访谈记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await request({
        url: `/sys-interview/delete/${row.interviewId}`,
        method: 'DELETE'
      })
      
      if (res.code === 200) {
        ElMessage.success(res.data || '删除成功')
        // 如果当前页只有一条数据且不是第一页，则跳转到上一页
        if (tableData.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
        }
        fetchInterviewList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 取消删除，不做任何操作
  })
}

// 新增记录
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 添加下拉选项数据
const studentOptions = ref([])
const classOptions = ref([])
const teacherOptions = ref([])

// 获取学生列表
const fetchStudentOptions = async () => {
  try {
    const res = await getStudentOptions()
    if (res.code === 200) {
      // 处理分页数据结构，与 Students.vue 保持一致
      const students = res.data.records || []
      studentOptions.value = students.map(item => ({
        value: item.studentId,
        label: `${item.name} (${item.classe})`,  // 显示学生姓名和班级
        classId: item.classId,
        className: item.classe,
        headteacher: item.headteacher
      }))
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  }
}

// 获取班级列表
const fetchClassOptions = async () => {
  try {
    const res = await getClassOptions()
    if (res.code === 200) {
      // 处理分页数据结构
      const classes = res.data.records || []
      classOptions.value = classes.map(item => ({
        value: item.classId,
        label: item.name
      }))
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
  }
}

// 获取教师列表
const fetchTeacherOptions = async () => {
  try {
    const res = await getTeacherOptions()
    if (res.code === 200) {
      // 处理分页数据结构
      const teachers = res.data.records || []
      teacherOptions.value = teachers.map(item => ({
        value: item.userId,
        label: item.realName
      }))
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
  }
}

// 修改学生选择变化的处理函数
const handleStudentChange = (studentId) => {
  const student = studentOptions.value.find(item => item.value === studentId)
  if (student) {
    form.classId = student.classId
    form.className = student.className
    form.studentName = student.name  // 设置学生姓名
    form.headteacher = student.headteacher  // 设置班主任名字
  }
}

// 添加班级选择变化的处理函数
const handleClassChange = (classId) => {
  const selectedClass = classOptions.value.find(item => item.value === classId)
  if (selectedClass) {
    form.className = selectedClass.label
  }
}

// 教师选择变化的处理函数
const handleTeacherChange = (teacherId) => {
  console.log('Selected teacherId:', teacherId)  // 添加日志
  if (teacherId) {
    const selectedTeacher = teacherOptions.value.find(item => item.value === teacherId)
    if (selectedTeacher) {
      form.teacherId = teacherId  // 直接使用选择的 teacherId
      form.teacherName = selectedTeacher.label
      console.log('Updated form:', form)  // 添加日志
    }
  }
}

// 初始化
onMounted(async () => {
  // 从localStorage获取教师ID
  const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}')
  filterForm.teacherId = teacherInfo.id
  await Promise.all([
    fetchStudentOptions(),
    fetchClassOptions(),
    fetchTeacherOptions()
  ])
  fetchInterviewList()
})
</script>

<template>
  <div class="interview-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="学生姓名">
          <el-input 
            v-model="filterForm.studentName" 
            placeholder="请输入学生姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button-group>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>查询
            </el-button>
            <el-button @click="handleReset">
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
          <span class="header-title">访谈记录列表</span>
          <el-button-group>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增记录
            </el-button>
          </el-button-group>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        border 
        stripe 
        v-loading="loading">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentName" label="学生姓名" width="120" align="center" />
        <el-table-column prop="className" label="班级" width="120" align="center" />
        <el-table-column prop="teacherName" label="访谈教师" width="120" align="center" />
        <el-table-column prop="interviewDate" label="访谈日期" width="120" align="center" />
        <el-table-column label="访谈类型" width="120" align="center">
          <template #default="{ row }">
            {{ getInterviewTypeLabel(row.interviewType) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="访谈内容" min-width="200" align="center" />
        <el-table-column prop="feedback" label="反馈内容" min-width="200" align="center" />
        <el-table-column prop="createTime" label="创建时间" width="160" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增访谈记录' : '编辑访谈记录'"
      v-model="dialogVisible"
      width="600px"
      @closed="resetForm">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-form-item label="学生" prop="studentId">
          <el-select 
            v-model="form.studentId" 
            placeholder="请选择学生"
            filterable
            @change="handleStudentChange"
            style="width: 100%"
          >
            <el-option
              v-for="item in studentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="班级" prop="classId">
          <el-select 
            v-model="form.classId" 
            placeholder="请选择班级"
            filterable
            @change="handleClassChange"
            style="width: 100%"
          >
            <el-option
              v-for="item in classOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="访谈日期" prop="interviewDate">
          <el-date-picker
            v-model="form.interviewDate"
            type="date"
            placeholder="请选择访谈日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="访谈类型" prop="interviewType">
          <el-select v-model="form.interviewType" placeholder="请选择访谈类型" style="width: 100%">
            <el-option
              v-for="item in interviewTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="访谈内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入访谈内容"
          />
        </el-form-item>
        <el-form-item label="反馈内容" prop="feedback">
          <el-input
            v-model="form.feedback"
            type="textarea"
            :rows="4"
            placeholder="请输入反馈内容"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="访谈教师" prop="teacherId">
          <el-select 
            v-model="form.teacherId" 
            placeholder="请选择教师"
            filterable
            @change="handleTeacherChange"
            style="width: 100%"
          >
            <el-option
              v-for="item in teacherOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ dialogType === 'add' ? '添加' : '修改' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.interview-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-card :deep(.el-card__body) {
  padding: 15px;
}

.table-card :deep(.el-card__header) {
  padding: 10px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 