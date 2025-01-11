<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'  // 导入请求工具

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const filterForm = reactive({
  name: ''
})

// 违纪类型选项
const disciplinaryTypes = [
  { label: '考勤', value: '考勤' },
  { label: '课堂纪律', value: '课堂纪律' },
  { label: '行为规范', value: '行为规范' },
  { label: '其他', value: '其他' }
]

// 处理状态选项
const statusOptions = [
  { label: '待处理', value: 0 },
  { label: '已处理', value: 1 }
]

// 对话框控制
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)

// 表单数据
const form = reactive({
  name: '',
  timeOfInfraction: '',
  descriptionOfTheIndiscipline: '',
  processing: '',
  processingStatus: 0,
  classe: '',
  headteacher: '',
  processors: '',
  remarks: '',
  processingTime: '',
  type: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入学生姓名', trigger: 'blur' }
  ],
  timeOfInfraction: [
    { required: true, message: '请选择违纪时间', trigger: 'change' }
  ],
  descriptionOfTheIndiscipline: [
    { required: true, message: '请输入违纪描述', trigger: 'blur' }
  ],
  processing: [
    { required: true, message: '请输入处理方式', trigger: 'blur' }
  ],
  classe: [
    { required: true, message: '请输入班级', trigger: 'blur' }
  ],
  headteacher: [
    { required: true, message: '请输入班主任', trigger: 'blur' }
  ],
  processors: [
    { required: true, message: '请输入处理人', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择违纪类型', trigger: 'change' }
  ]
}

// 获取违纪记录列表
const fetchDisciplinaryList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      name: filterForm.name || undefined
    }
    
    const res = await request({
      url: '/sys-student-disciplinary/page',
      method: 'GET',
      params
    })
    
    if (res.code === 200) {
      tableData.value = res.records || []
      total.value = res.total || 0
    } else {
      ElMessage.error(res.message || '获取违纪记录失败')
    }
  } catch (error) {
    console.error('获取违纪记录失败:', error)
    ElMessage.error('获取违纪记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchDisciplinaryList()
}

// 重置搜索
const handleReset = () => {
  filterForm.name = ''
  currentPage.value = 1
  fetchDisciplinaryList()
}

// 分页变化
const handlePageChange = (val) => {
  currentPage.value = val
  fetchDisciplinaryList()
}

// 每页条数变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchDisciplinaryList()
}

// 新增记录
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: undefined,
    name: '',
    timeOfInfraction: '',
    descriptionOfTheIndiscipline: '',
    processing: '',
    processingStatus: 0,
    classe: '',
    headteacher: '',
    processors: '',
    remarks: '',
    processingTime: '',
    type: ''
  })
}

// 编辑记录
const handleEdit = (row) => {
  dialogType.value = 'edit'
  // 复制行数据到表单
  Object.assign(form, {
    id: row.id,  // 添加id字段用于修改
    name: row.name,
    timeOfInfraction: row.timeOfInfraction,
    descriptionOfTheIndiscipline: row.descriptionOfTheIndiscipline,
    processing: row.processing,
    processingStatus: row.processingStatus,
    classe: row.classe,
    headteacher: row.headteacher,
    processors: row.processors,
    remarks: row.remarks,
    processingTime: row.processingTime,
    type: row.type
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url = dialogType.value === 'add' 
          ? '/sys-student-disciplinary/add'
          : '/sys-student-disciplinary/update'
        
        const res = await request({
          url,
          method: 'PUT',
          data: form
        })
        
        if (res.code === 200) {
          ElMessage.success(res.data || (dialogType.value === 'add' ? '添加成功' : '修改成功'))
          dialogVisible.value = false
          fetchDisciplinaryList()
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

// 删除记录
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除学生 ${row.name} 的违纪记录吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res = await request({
        url: `/sys-student-disciplinary/delete/${row.id}`,
        method: 'DELETE'
      })
      
      if (res.code === 200) {
        ElMessage.success(res.data || '删除成功')
        // 如果当前页只有一条数据且不是第一页，则跳转到上一页
        if (tableData.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
        }
        fetchDisciplinaryList()
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
  fetchDisciplinaryList()
})
</script>

<template>
  <div class="disciplinary-container">
    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="学生姓名">
          <el-input 
            v-model="filterForm.name" 
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
          <span class="header-title">违纪记录列表</span>
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
        <el-table-column prop="name" label="学生姓名" width="100" align="center" />
        <el-table-column prop="classe" label="班级" width="100" align="center" />
        <el-table-column prop="headteacher" label="班主任" width="100" align="center" />
        <el-table-column prop="type" label="违纪类型" width="100" align="center" />
        <el-table-column prop="timeOfInfraction" label="违纪时间" width="120" align="center" />
        <el-table-column prop="descriptionOfTheIndiscipline" label="违纪描述" min-width="150" align="center" />
        <el-table-column prop="processing" label="处理方式" width="100" align="center" />
        <el-table-column prop="processors" label="处理人" width="100" align="center" />
        <el-table-column prop="processingTime" label="处理时间" width="120" align="center" />
        <el-table-column prop="processingStatus" label="处理状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.processingStatus === 1 ? 'success' : 'warning'">
              {{ row.processingStatus === 1 ? '已处理' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="200" align="center" />
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
      :title="dialogType === 'add' ? '新增违纪记录' : '编辑违纪记录'"
      v-model="dialogVisible"
      width="600px"
      @closed="resetForm">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-form-item label="学生姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="班级" prop="classe">
          <el-input v-model="form.classe" placeholder="请输入班级" />
        </el-form-item>
        <el-form-item label="班主任" prop="headteacher">
          <el-input v-model="form.headteacher" placeholder="请输入班主任姓名" />
        </el-form-item>
        <el-form-item label="违纪类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择违纪类型" style="width: 100%">
            <el-option
              v-for="item in disciplinaryTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="违纪时间" prop="timeOfInfraction">
          <el-date-picker
            v-model="form.timeOfInfraction"
            type="date"
            placeholder="请选择违纪时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="违纪描述" prop="descriptionOfTheIndiscipline">
          <el-input
            v-model="form.descriptionOfTheIndiscipline"
            type="textarea"
            :rows="3"
            placeholder="请输入违纪描述"
          />
        </el-form-item>
        <el-form-item label="处理方式" prop="processing">
          <el-input v-model="form.processing" placeholder="请输入处理方式" />
        </el-form-item>
        <el-form-item label="处理人" prop="processors">
          <el-input v-model="form.processors" placeholder="请输入处理人" />
        </el-form-item>
        <el-form-item label="处理时间" prop="processingTime">
          <el-date-picker
            v-model="form.processingTime"
            type="date"
            placeholder="请选择处理时间"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="处理状态" prop="processingStatus">
          <el-radio-group v-model="form.processingStatus">
            <el-radio :label="0">待处理</el-radio>
            <el-radio :label="1">已处理</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
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
.disciplinary-container {
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

:deep(.el-tag) {
  width: 65px;
  text-align: center;
}
</style> 