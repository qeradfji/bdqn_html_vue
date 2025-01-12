<template>
  <div class="guardian-container">
    <!-- 搜索卡片 -->
    <el-card class="search-card">
      <div class="search-form">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入家长姓名"
          clearable
          style="width: 200px; margin-right: 16px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model="searchForm.studentName"
          placeholder="请输入学生姓名"
          clearable
          style="width: 200px; margin-right: 16px"
          @keyup.enter="handleStudentSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button-group>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>按家长搜索
          </el-button>
          <el-button type="primary" @click="handleStudentSearch">
            <el-icon><Search /></el-icon>按学生搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-button-group>
      </div>
    </el-card>

    <!-- 表格卡片 -->
    <el-card class="table-card">
      <div class="card-header">
        <div class="left">
          <el-icon class="icon"><User /></el-icon>
          <span class="title">家长列表</span>
        </div>
        <div class="right">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增家长
          </el-button>
        </div>
      </div>
      
      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="studentName" label="学生姓名" width="100" align="center" />
        <el-table-column prop="name" label="家长姓名" min-width="100" align="center">
          <template #default="{ row }">
            {{ row.name || '未设置' }}
          </template>
        </el-table-column>
        <el-table-column prop="relationship" label="关系" width="100" align="center" />
        <el-table-column prop="phone" label="联系电话" width="120" align="center" />
        <el-table-column prop="wechat" label="微信" width="120" align="center" />
        <el-table-column prop="occupation" label="职业" width="120" align="center" />
        <el-table-column prop="workUnit" label="工作单位" min-width="150" align="center" />
        <el-table-column prop="address" label="家庭住址" min-width="200" align="center" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
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
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="学生" prop="studentId">
          <el-select v-model="form.studentId" placeholder="请选择学生" clearable>
            <el-option
              v-for="item in studentOptions"
              :key="item.studentId"
              :label="item.name"
              :value="item.studentId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="家长姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入家长姓名" />
        </el-form-item>
        <el-form-item label="关系" prop="relationship">
          <el-select v-model="form.relationship" placeholder="请选择关系">
            <el-option label="父亲" value="父亲" />
            <el-option label="母亲" value="母亲" />
            <el-option label="爷爷" value="爷爷" />
            <el-option label="奶奶" value="奶奶" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="微信" prop="wechat">
          <el-input v-model="form.wechat" placeholder="请输入微信" />
        </el-form-item>
        <el-form-item label="职业" prop="occupation">
          <el-input v-model="form.occupation" placeholder="请输入职业" />
        </el-form-item>
        <el-form-item label="工作单位" prop="workUnit">
          <el-input v-model="form.workUnit" placeholder="请输入工作单位" />
        </el-form-item>
        <el-form-item label="家庭住址" prop="address">
          <el-input v-model="form.address" placeholder="请输入家庭住址" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, User, Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 表格数据
const tableData = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const searchForm = reactive({
  name: '',
  studentName: ''
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增家长')
const formRef = ref(null)

// 表单数据
const form = reactive({
  guardianId: '',
  studentId: '',
  name: '',
  relationship: '',
  phone: '',
  wechat: '',
  occupation: '',
  workUnit: '',
  address: '',
  studentName: ''
})

// 表单校验规则
const rules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  name: [{ required: true, message: '请输入家长姓名', trigger: 'blur' }],
  relationship: [{ required: true, message: '请选择关系', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 学生选项
const studentOptions = ref([])

// 获取学生列表
const fetchStudentOptions = async () => {
  try {
    console.log('获取学生列表请求参数:', {
      url: '/sys-student/list',
      method: 'get',
      params: {
        size: 9999,  // 设置最大数量
        current: 1
      }
    })

    const res = await request({
      url: '/sys-student/list',
      method: 'get',
      params: {
        size: 9999,  // 设置最大数量
        current: 1
      }
    })
    
    console.log('获取学生列表响应:', res)
    
    if (res.code === 200) {
      studentOptions.value = res.data.records || []  // 使用分页数据中的 records
      console.log('学生选项:', studentOptions.value)
    } else {
      ElMessage.error(res.message || '获取学生列表失败')
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  }
}

// 获取家长列表
const fetchGuardianList = async (byStudent = false) => {
  loading.value = true
  try {
    const config = {
      url: byStudent ? '/sys-student-guardian/list-by-student-name' : '/sys-student-guardian/list',
      method: 'get',
      params: {
        current: currentPage.value,
        size: pageSize.value,
        ...(byStudent 
          ? { studentName: searchForm.studentName || undefined }
          : { name: searchForm.name || undefined }
        )
      }
    }

    console.log('请求参数:', config)

    const res = await request(config)
    
    console.log('家长列表响应:', res)
    
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
      currentPage.value = res.data.current
      pageSize.value = res.data.size
    } else {
      ElMessage.error(res.message || '获取家长列表失败')
    }
  } catch (error) {
    console.error('获取家长列表失败:', error)
    ElMessage.error('获取家长列表失败')
  } finally {
    loading.value = false
  }
}

// 按家长姓名搜索
const handleSearch = () => {
  if (searchForm.studentName) {
    searchForm.studentName = ''  // 清空学生姓名
  }
  currentPage.value = 1
  fetchGuardianList(false)
}

// 按学生姓名搜索
const handleStudentSearch = () => {
  if (searchForm.name) {
    searchForm.name = ''  // 清空家长姓名
  }
  currentPage.value = 1
  fetchGuardianList(true)
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.studentName = ''
  currentPage.value = 1
  fetchGuardianList()
}

// 分页大小改变
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchGuardianList()
}

// 当前页改变
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchGuardianList()
}

// 是否是编辑模式
const isEdit = ref(false)

// 打开编辑弹窗
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑家长'
  dialogVisible.value = true
  
  // 填充表单数据
  form.guardianId = row.guardianId
  form.studentId = row.studentId
  form.name = row.name || ''
  form.relationship = row.relationship || ''
  form.phone = row.phone || ''
  form.wechat = row.wechat || ''
  form.occupation = row.occupation || ''
  form.workUnit = row.workUnit || ''
  form.address = row.address || ''
  form.studentName = row.studentName || ''
  
  // 获取学生列表
  fetchStudentOptions()
  
  console.log('编辑数据:', form)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const isAdd = !isEdit.value
        const config = {
          url: isAdd ? '/sys-student-guardian/add' : '/sys-student-guardian/update',
          method: isAdd ? 'post' : 'put',
          data: {
            ...form,
            guardianId: isAdd ? undefined : form.guardianId
          }
        }
        
        console.log(`${isAdd ? '新增' : '编辑'}请求参数:`, config)

        const res = await request(config)
        
        console.log(`${isAdd ? '新增' : '编辑'}响应:`, res)
        
        if (res.code === 200) {
          ElMessage.success(isAdd ? '添加成功' : '编辑成功')
          dialogVisible.value = false
          fetchGuardianList()
        } else {
          ElMessage.error(res.message || (isAdd ? '添加失败' : '编辑失败'))
        }
      } catch (error) {
        console.error(isAdd ? '添加失败:' : '编辑失败:', error)
        ElMessage.error(isAdd ? '添加失败' : '编辑失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  // 重置所有字段
  form.guardianId = ''
  form.studentId = ''
  form.name = ''
  form.relationship = ''
  form.phone = ''
  form.wechat = ''
  form.occupation = ''
  form.workUnit = ''
  form.address = ''
  form.studentName = ''
  
  isEdit.value = false
}

// 打开新增弹窗
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增家长'
  dialogVisible.value = true
  resetForm()  // 清空表单
  fetchStudentOptions()
}

// 删除家长
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除该家长信息吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        console.log('删除请求参数:', {
          url: `/sys-student-guardian/delete/${row.guardianId}`,
          method: 'delete'
        })

        const res = await request({
          url: `/sys-student-guardian/delete/${row.guardianId}`,
          method: 'delete'
        })

        console.log('删除响应:', res)

        if (res.code === 200) {
          ElMessage.success('删除成功')
          fetchGuardianList() // 刷新列表
        } else {
          ElMessage.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 初始化
onMounted(() => {
  fetchGuardianList()
})
</script>

<style scoped>
.guardian-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.search-card :deep(.el-card__body) {
  padding: 15px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.right {
  display: flex;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.el-button-group {
  display: flex;
  gap: 10px;
}
</style> 