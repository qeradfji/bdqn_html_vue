<template>
  <div class="teachers-container">
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
            <span class="title">教师列表</span>
            <el-tag type="info" effect="plain" round>共 {{ total }} 条</el-tag>
          </div>
          <div class="right">
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>新增教师
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="teacherList" border stripe v-loading="loading">
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="departmentId" label="部门" width="120">
          <template #default="{ row }">
            {{ row.departmentId === 1 ? '学管部' : '教质部' }}
          </template>
        </el-table-column>
        <el-table-column prop="position" label="职位" width="120">
          <template #default="{ row }">
            <el-tag :type="getPositionTagType(row.position)">
              {{ getPositionLabel(row.position) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinTime" label="入职时间" width="180" />
        <el-table-column prop="departmentName" label="所属部门" width="120" align="center" />
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
      :title="dialogType === 'add' ? '新增教师' : '编辑教师'"
      v-model="dialogVisible"
      width="500px"
      @closed="resetForm">
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-select 
            v-model="form.departmentId" 
            placeholder="请选择所属部门"
            style="width: 100%">
            <el-option
              v-for="item in departmentList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-select v-model="form.position" placeholder="请选择职位">
            <el-option label="主管" :value="0" />
            <el-option label="普通员工" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="入职时间" prop="joinTime">
          <el-date-picker
            v-model="form.joinTime"
            type="datetime"
            placeholder="请选择入职时间"
            value-format="YYYY-MM-DD HH:mm:ss"
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
import { Search, Refresh, User, List, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeacherList, addTeacher, updateTeacher, deleteTeacher } from '@/api/teacher'
import request from '@/utils/request'

// 表格数据
const loading = ref(false)
const teacherList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const filterForm = reactive({
  name: ''
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const form = reactive({
  username: '',
  realName: '',
  password: '',
  departmentId: undefined,
  departmentName: '',
  position: 1,
  phone: '',
  email: '',
  status: 1,
  joinTime: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  joinTime: [
    { required: true, message: '请选择入职时间', trigger: 'change' }
  ]
}

// 获取职位标签类型
const getPositionTagType = (position) => {
  switch (position) {
    case -1:
      return 'danger'
    case 0:
      return 'warning'
    default:
      return 'info'
  }
}

// 获取职位标签文本
const getPositionLabel = (position) => {
  switch (position) {
    case -1:
      return '超级管理员'
    case 0:
      return '主管'
    default:
      return '普通员工'
  }
}

// 获取教师列表
const fetchTeacherList = async () => {
  loading.value = true
  try {
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      name: filterForm.name || undefined
    }
    
    const res = await getTeacherList(params)
    if (res.code === 200) {
      teacherList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索和重置
const handleSearch = () => {
  currentPage.value = 1
  fetchTeacherList()
}

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    departmentId: undefined,
    departmentName: ''
  })
  currentPage.value = 1
  fetchTeacherList()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchTeacherList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchTeacherList()
}

// 删除教师
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该教师吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteTeacher(row.userId)
      if (res.code === 200) {
        ElMessage.success(res.message || '删除成功')
        fetchTeacherList()
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 新增教师
const handleAdd = () => {
  dialogType.value = 'add'
  form.username = ''
  form.realName = ''
  form.password = ''
  form.departmentId = undefined
  form.departmentName = ''
  form.position = 1
  form.phone = ''
  form.email = ''
  form.status = 1
  form.joinTime = ''
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const api = dialogType.value === 'add' ? addTeacher : updateTeacher
        const res = await api(form)
        
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '编辑成功')
          dialogVisible.value = false
          fetchTeacherList()
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '新增失败:' : '编辑失败:', error)
        ElMessage.error(dialogType.value === 'add' ? '新增失败' : '编辑失败')
      }
    }
  })
}

// 部门列表
const departmentList = ref([])

// 获取所有部门列表
const fetchAllDepartments = async () => {
  try {
    const res = await request.get('/sys-department/list', {
      params: {
        current: 1,
        size: 99999
      }
    })
    
    if (res && res.records) {
      departmentList.value = res.records.map(item => ({
        value: item.departmentId,
        label: item.name,
        description: item.description
      }))
    } else {
      ElMessage.error('获取部门列表失败')
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
  }
}

// 编辑教师
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    departmentId: row.departmentId,
    departmentName: row.departmentName
  })
  dialogVisible.value = true
}

onMounted(() => {
  fetchAllDepartments()
  fetchTeacherList()
})
</script>

<style scoped>
.teachers-container {
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