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
          <span>访谈记录列表</span>
          <el-button type="primary" @click="handleAdd">添加访谈</el-button>
        </div>
      </template>

      <el-table :data="interviewList" border v-loading="loading">
        <el-table-column prop="student_id" label="学生ID" width="80" />
        <el-table-column prop="student_name" label="学生姓名" width="100" />
        <el-table-column prop="class_id" label="班级ID" width="80" />
        <el-table-column prop="interview_date" label="访谈日期" width="120" />
        <el-table-column prop="interview_type" label="访谈对象" width="100">
          <template #default="scope">
            {{ scope.row.interview_type === 1 ? '学员' : '监护人' }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="访谈内容" show-overflow-tooltip />
        <el-table-column prop="feedback" label="反馈建议" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            {{ scope.row.status === 1 ? '正常' : '需要关注' }}
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="创建时间" width="160" />
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
      :title="dialogType === 'add' ? '添加访谈记录' : '编辑访谈记录'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="学生ID" prop="student_id">
          <el-input v-model="form.student_id" type="number" />
        </el-form-item>
        <el-form-item label="班级ID" prop="class_id">
          <el-input v-model="form.class_id" type="number" />
        </el-form-item>
        <el-form-item label="访谈日期" prop="interview_date">
          <el-date-picker
            v-model="form.interview_date"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="访谈对象" prop="interview_type">
          <el-select v-model="form.interview_type">
            <el-option :value="1" label="学员" />
            <el-option :value="2" label="监护人" />
          </el-select>
        </el-form-item>
        <el-form-item label="访谈内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="反馈建议" prop="feedback">
          <el-input v-model="form.feedback" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status">
            <el-option :value="1" label="正常" />
            <el-option :value="2" label="需要关注" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getInterviewList, addInterview, updateInterview, deleteInterview } from '@/api/interview'

// 表格数据
const loading = ref(false)
const interviewList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const filterForm = reactive({
  name: ''
})

// 弹窗表单
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = reactive({
  interview_id: '',
  student_id: '',
  class_id: '',
  teacher_id: '',
  interview_date: '',
  interview_type: 1,
  content: '',
  feedback: '',
  status: 1,
  create_by: '',
  update_by: '',
  create_time: '',
  update_time: '',
  deleted: 0
})

// 表单验证规则
const rules = {
  student_id: [
    { required: true, message: '请输入学生ID', trigger: 'blur' }
  ],
  class_id: [
    { required: true, message: '请输入班级ID', trigger: 'blur' }
  ],
  interview_date: [
    { required: true, message: '请选择访谈日期', trigger: 'change' }
  ],
  interview_type: [
    { required: true, message: '请选择访谈对象', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入访谈内容', trigger: 'blur' }
  ],
  feedback: [
    { required: true, message: '请输入反馈建议', trigger: 'blur' }
  ]
}

// 获取访谈记录列表
const fetchList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      name: filterForm.name || undefined
    }
    
    const res = await getInterviewList(params)
    console.log('访谈列表响应:', res)
    
    if (res.code === 200 && res.data) {
      interviewList.value = res.data.records.map(item => ({
        interview_id: item.id,
        student_name: item.studentName,
        class_id: item.classId,
        interview_date: item.interviewDate,
        interview_type: item.interviewType,
        content: item.content,
        feedback: item.feedback,
        status: item.status,
        create_time: item.createTime,
        update_time: item.updateTime,
        teacher_id: item.teacherId,
        student_id: item.studentId
      }))
      total.value = res.data.total
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
  fetchList()
}

// 重置搜索
const resetForm = () => {
  filterForm.name = ''
  currentPage.value = 1
  fetchList()
}

// 添加记录
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  Object.keys(form).forEach(key => {
    form[key] = key === 'interview_type' ? 1 : key === 'status' ? 1 : ''
  })
}

// 编辑记录
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  // 将后端返回的数据映射到表单
  form.interview_id = row.interview_id
  form.student_id = row.student_id
  form.class_id = row.class_id
  form.teacher_id = row.teacher_id
  form.interview_date = row.interview_date
  form.interview_type = row.interview_type
  form.content = row.content
  form.feedback = row.feedback
  form.status = row.status
  form.create_by = row.create_by
  form.update_by = row.update_by
  form.create_time = row.create_time
  form.update_time = row.update_time
  form.deleted = row.deleted
}

// 删除记录
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条访谈记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteInterview(row.interview_id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.log('接口开发中...')
    }
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const teacherId = localStorage.getItem('userId')
        if (!teacherId) {
          ElMessage.error('获取用户信息失败')
          return
        }

        const submitData = {
          id: form.interview_id || undefined,
          studentId: form.student_id,
          classId: form.class_id,
          teacherId: Number(teacherId),
          interviewDate: form.interview_date,
          interviewType: form.interview_type,
          content: form.content,
          feedback: form.feedback,
          status: form.status
        }

        if (dialogType.value === 'add') {
          await addInterview(submitData)
          ElMessage.success('添加成功')
        } else {
          await updateInterview(submitData)
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        fetchList()
      } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败')
      }
    }
  })
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchList()
}

onMounted(() => {
  fetchList()
})
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 