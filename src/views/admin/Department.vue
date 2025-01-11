<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import router from '@/router'

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 对话框控制
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const form = reactive({
  departmentId: undefined,
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入部门描述', trigger: 'blur' },
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }
  ]
}

// 获取部门列表
const fetchDepartmentList = async () => {
  loading.value = true
  try {
    const res = await request.get('/sys-department/list', {
      params: {
        current: currentPage.value,
        size: pageSize.value
      }
    })
    
    if (res) {
      tableData.value = res.records || []
      total.value = res.total || 0
    } else {
      ElMessage.error('获取部门列表失败')
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 分页变化
const handlePageChange = (val) => {
  currentPage.value = val
  fetchDepartmentList()
}

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchDepartmentList()
}

// 编辑部门
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(form, {
    departmentId: row.departmentId,
    name: row.name,
    description: row.description
  })
  dialogVisible.value = true
}

// 新增部门
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url = dialogType.value === 'add' 
          ? '/sys-department/add'
          : '/sys-department/update'
        
        const method = dialogType.value === 'add' ? 'POST' : 'PUT'
        
        const data = {
          name: form.name,
          description: form.description
        }
        
        // 如果是修改，需要添加部门ID
        if (dialogType.value === 'edit') {
          data.departmentId = form.departmentId
        }
        
        const res = await request({
          url,
          method,
          data
        })
        
        if (res.code === 200) {
          ElMessage.success(res.data || (dialogType.value === 'add' ? '添加成功' : '修改成功'))
          dialogVisible.value = false
          // 如果是新增，跳转到第一页
          if (dialogType.value === 'add') {
            currentPage.value = 1
          }
          fetchDepartmentList()
        } else {
          ElMessage.error(res.message || (dialogType.value === 'add' ? '添加失败' : '修改失败'))
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '添加失败:' : '修改失败:', error)
        ElMessage.error(dialogType.value === 'add' ? '添加失败' : '修改失败')
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
    departmentId: undefined,
    name: '',
    description: ''
  })
}

// 删除部门
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除部门 "${row.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await request({
        url: `/sys-department/delete/${row.departmentId}`,
        method: 'DELETE'
      })
      
      if (res.code === 200) {
        ElMessage.success(res.data || '删除成功')
        // 如果当前页只有一条数据且不是第一页，则跳转到上一页
        if (tableData.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
        }
        fetchDepartmentList()
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

// 初始化
onMounted(() => {
  fetchDepartmentList()
})
</script>

<template>
  <div class="department-container">
    <!-- 表格区域 -->
    <el-card class="table-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">部门列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增部门
          </el-button>
        </div>
      </template>

      <el-table 
        :data="tableData" 
        border 
        stripe 
        v-loading="loading">
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="name" label="部门名称" min-width="150" align="center" />
        <el-table-column prop="description" label="部门描述" min-width="300" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>删除
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
      :title="dialogType === 'add' ? '新增部门' : '编辑部门'"
      v-model="dialogVisible"
      width="500px"
      @closed="resetForm">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px">
        <el-form-item label="部门名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入部门名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="部门描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入部门描述"
            maxlength="200"
            show-word-limit
          />
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
.department-container {
  padding: 20px;
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