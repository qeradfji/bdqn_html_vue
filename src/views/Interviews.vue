<template>
  <div class="interviews-container">
    <!-- 搜索区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="学生姓名">
          <el-input 
            v-model="filterForm.name" 
            placeholder="请输入学生姓名" 
            clearable 
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <div class="left">
            <span>访谈记录列表</span>
            <el-tag type="info" effect="plain" round>共 {{ total }} 条</el-tag>
          </div>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>添加访谈
          </el-button>
        </div>
      </template>

      <el-table 
        :data="interviewList" 
        border 
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="120" />
        <el-table-column 
          prop="interviewDate" 
          label="访谈日期" 
          width="120"
        >
          <template #default="{ row }">
            {{ formatDate(row.interviewDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="interviewType" label="访谈类型" width="120">
          <template #default="{ row }">
            {{ getInterviewTypeText(row.interviewType) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="访谈内容" show-overflow-tooltip />
        <el-table-column prop="feedback" label="反馈内容" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? '正常' : '需要关注' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="访谈教师" width="120" />
        <el-table-column 
          prop="createTime" 
          label="创建时间" 
          width="180"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column 
          prop="updateTime" 
          label="更新时间" 
          width="180"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加访谈' : '编辑访谈'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="学生" prop="studentId">
          <el-select 
            v-model="form.studentId" 
            placeholder="请选择学生"
            filterable
          >
            <el-option
              v-for="student in studentOptions"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="访谈日期" prop="interviewDate">
          <el-date-picker
            v-model="form.interviewDate"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="访谈类型" prop="interviewType">
          <el-select v-model="form.interviewType" placeholder="请选择访谈类型">
            <el-option label="常规访谈" :value="1" />
            <el-option label="特殊访谈" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="访谈内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="3"
            placeholder="请输入访谈内容"
          />
        </el-form-item>
        <el-form-item label="反馈内容" prop="feedback">
          <el-input
            v-model="form.feedback"
            type="textarea"
            :rows="3"
            placeholder="请输入反馈内容"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="正常" :value="1" />
            <el-option label="需要关注" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getInterviewList, addInterview, updateInterview, deleteInterview } from '@/api/interview'
import { getStudentListByHeadteacher } from '@/api/student'
import dayjs from 'dayjs'

// 数据列表
const interviewList = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const filterForm = ref({
  name: ''
})

// 获取访谈类型文本
const getInterviewTypeText = (type) => {
  const typeMap = {
    1: '常规访谈',
    2: '特殊访谈'
  }
  return typeMap[type] || '未知类型'
}

// 获取访谈列表
const fetchInterviewList = async () => {
  loading.value = true
  try {
    const res = await getInterviewList({
      name: filterForm.value.name,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    
    if (res.code === 200) {
      interviewList.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取访谈列表失败')
    }
  } catch (error) {
    console.error('获取访谈列表失败:', error)
    ElMessage.error('获取访谈列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchInterviewList()
}

// 重置搜索
const resetForm = () => {
  filterForm.value.name = ''
  currentPage.value = 1
  fetchInterviewList()
}

// 页码改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchInterviewList()
}

// 每页条数改变
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchInterviewList()
}

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const form = ref({
  interviewId: 0,
  studentId: '',
  classId: 0,
  teacherId: 0,
  interviewDate: '',
  interviewType: 1,
  content: '',
  feedback: '',
  status: 1
})

// 表单验证规则
const rules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  interviewDate: [{ required: true, message: '请选择访谈日期', trigger: 'change' }],
  interviewType: [{ required: true, message: '请选择访谈类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入访谈内容', trigger: 'blur' }],
  feedback: [{ required: true, message: '请输入反馈内容', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 添加访谈
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  form.value = {
    interviewId: 0,
    studentId: '',
    classId: 0,
    teacherId: 0,
    interviewDate: dayjs().format('YYYY-MM-DD'),
    interviewType: 1,
    content: '',
    feedback: '',
    status: 1
  }
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 编辑访谈
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  form.value = {
    interviewId: row.interviewId,
    studentId: row.studentId,
    classId: row.classId,
    teacherId: row.teacherId,
    interviewDate: row.interviewDate,
    interviewType: row.interviewType,
    content: row.content,
    feedback: row.feedback,
    status: row.status
  }
}

// 删除访谈
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条访谈记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteInterview(row.interviewId)
      ElMessage.success('删除成功')
      fetchInterviewList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        const teacherId = localStorage.getItem('userId')
        // 构建提交数据
        const submitData = {
          ...form.value,
          teacherId: Number(teacherId),
          classId: studentOptions.value.find(s => s.id === form.value.studentId)?.classId || 0,
          interviewId: dialogType.value === 'add' ? 0 : form.value.interviewId
        }

        if (dialogType.value === 'add') {
          await addInterview(submitData)
          ElMessage.success('添加成功')
        } else {
          await updateInterview(submitData)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchInterviewList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

// 获取学生列表
const studentOptions = ref([])
const fetchStudentOptions = async () => {
  try {
    const res = await getStudentListByHeadteacher()
    if (res.code === 200) {
      studentOptions.value = res.data.records.map(student => ({
        id: student.studentId,
        name: `${student.name} (${student.classe})`,
        classId: student.classId // 保存班级ID
      }))
    } else {
      ElMessage.error(res.message || '获取学生列表失败')
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchInterviewList()
  fetchStudentOptions()
})

// 时间格式化函数
const formatDateTime = (time) => {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 日期格式化函数
const formatDate = (date) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD')
}
</script>

<style scoped>
.interviews-container {
  padding: 20px;
}

.filter-card {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-tag) {
  margin-right: 8px;
}
</style> 