<template>
  <div class="classes-container">
    <!-- 搜索区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="班级名称">
          <el-input v-model="filterForm.name" placeholder="请输入班级名称" clearable>
            <template #prefix>
              <el-icon><School /></el-icon>
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
            <span class="title">班级列表</span>
            <el-tag type="info" effect="plain" round>共 {{ total }} 条</el-tag>
          </div>
          <div class="right">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增班级
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="classList" border stripe v-loading="loading">
        <el-table-column prop="name" label="班级名称" width="150" />
        <el-table-column prop="courseType" label="课程类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getCourseTypeTag(row.courseType)">
              {{ getCourseTypeLabel(row.courseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="班主任" width="120" />
        <el-table-column prop="startDate" label="开班时间" width="120" />
        <el-table-column prop="endDate" label="结课时间" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '在训' : '结课' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="班级描述" show-overflow-tooltip />
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog 
      :title="dialogType === 'add' ? '新增班级' : '编辑班级'"
      v-model="dialogVisible"
      width="500px">
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-form-item label="班级名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="课程类型" prop="courseType">
          <el-select v-model="form.courseType" placeholder="请选择课程类型">
            <el-option label="Java开发" :value="1" />
            <el-option label="Web前端" :value="2" />
            <el-option label="Python开发" :value="3" />
            <el-option label="大数据" :value="4" />
            <el-option label="人工智能" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="班主任" prop="teacherId">
          <el-select 
            v-model="form.teacherId" 
            placeholder="请选择班主任"
            filterable>
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.userId"
              :label="teacher.realName"
              :value="teacher.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开班时间" prop="startDate">
          <el-date-picker
            v-model="form.startDate"
            type="date"
            placeholder="请选择开班时间"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="结课时间" prop="endDate">
          <el-date-picker
            v-model="form.endDate"
            type="date"
            placeholder="请选择结课时间"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">在训</el-radio>
            <el-radio :label="2">结课</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="班级描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入班级描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, School, List, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getClassList, deleteClass, createClass, updateClass } from '@/api/class'
import { getAllTeachers } from '@/api/teacher'

// 表格数据
const loading = ref(false)
const classList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const filterForm = reactive({
  name: ''
})

// 新增/编辑表单
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = reactive({
  classId: undefined,
  name: '',
  courseType: '',
  teacherId: '',
  startDate: '',
  endDate: '',
  status: 1,
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入班级名称', trigger: 'blur' }
  ],
  courseType: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ],
  teacherId: [
    { required: true, message: '请选择班主任', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开班时间', trigger: 'change' }
  ],
  endDate: [
    { required: true, message: '请选择结课时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (form.startDate && value && value < form.startDate) {
          callback(new Error('结课时间不能早于开班时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 获取课程类型标签
const getCourseTypeTag = (type) => {
  const tags = {
    1: 'success',
    2: 'warning',
    3: 'danger',
    4: 'info',
    5: 'primary'
  }
  return tags[type] || ''
}

// 获取课程类型标签文本
const getCourseTypeLabel = (type) => {
  const labels = {
    1: 'Java开发',
    2: 'Web前端',
    3: 'Python开发',
    4: '大数据',
    5: '人工智能'
  }
  return labels[type] || '未知'
}

// 班主任选项
const teacherOptions = ref([])

// 获取所有教师信息
const fetchAllTeachers = async () => {
  try {
    const res = await getAllTeachers()
    if (res.code === 200 && res.data.records) {
      teacherOptions.value = res.data.records.map(teacher => ({
        userId: teacher.userId,
        realName: teacher.realName
      }))
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
  }
}

// 获取班级列表
const fetchClassList = async () => {
  loading.value = true
  try {
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      name: filterForm.name || undefined
    }
    
    const res = await getClassList(params)
    if (res.code === 200) {
      const list = res.data.records
      
      // 使用已加载的教师信息
      classList.value = list.map(item => ({
        ...item,
        teacherName: item.teacherId ? 
          teacherOptions.value.find(t => t.userId === item.teacherId)?.realName || '' : 
          ''
      }))
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索和重置
const handleSearch = () => {
  currentPage.value = 1
  fetchClassList()
}

const resetForm = () => {
  filterForm.name = ''
  currentPage.value = 1
  fetchClassList()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchClassList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchClassList()
}

// 删除班级
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该班级吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteClass(row.classId)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchClassList()
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

// 编辑班级
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 直接使用已加载的教师信息
  Object.assign(form, {
    classId: row.classId,
    name: row.name,
    courseType: row.courseType,
    teacherId: row.teacherId,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    description: row.description
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const api = dialogType.value === 'add' ? createClass : updateClass
        // 构造提交的数据
        const submitData = {
          ...form,
          classId: dialogType.value === 'edit' ? form.classId : undefined
        }
        
        const res = await api(submitData)
        
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
          dialogVisible.value = false
          fetchClassList()
          
          // 重置表单
          form.classId = undefined
          form.name = ''
          form.courseType = ''
          form.teacherId = ''
          form.startDate = ''
          form.endDate = ''
          form.status = 1
          form.description = ''
        } else {
          ElMessage.error(res.message || (dialogType.value === 'add' ? '新增失败' : '修改失败'))
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '新增失败:' : '修改失败:', error)
        ElMessage.error(error.message || (dialogType.value === 'add' ? '新增失败' : '修改失败'))
      }
    }
  })
}

// 新增班级
const handleAdd = () => {
  dialogType.value = 'add'
  // 重置表单
  form.classId = undefined
  form.name = ''
  form.courseType = ''
  form.teacherId = ''
  form.startDate = ''
  form.endDate = ''
  form.status = 1
  form.description = ''
  dialogVisible.value = true
}

onMounted(async () => {
  // 先获取所有教师信息
  await fetchAllTeachers()
  // 再获取班级列表
  fetchClassList()
})
</script>

<style scoped>
.classes-container {
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
</style> 