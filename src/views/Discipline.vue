<template>
  <div class="discipline-container">
    <!-- 搜索区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="学生姓名">
          <el-input v-model="filterForm.name" placeholder="请输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="违纪类型">
          <el-select v-model="filterForm.type" placeholder="请选择类型" clearable>
            <el-option
              v-for="(desc, type) in violationDescriptions"
              :key="type"
              :label="type"
              :value="type"
            >
              <el-tooltip
                :content="desc"
                placement="right"
                effect="light"
              >
                <span>{{ type }}</span>
              </el-tooltip>
            </el-option>
          </el-select>
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
          <span>违纪记录列表</span>
          <el-button type="primary" @click="handleAdd">添加记录</el-button>
        </div>
      </template>

      <el-table :data="disciplineList" border v-loading="loading">
        <el-table-column prop="name" label="学生姓名" width="100" />
        <el-table-column prop="classe" label="班级" width="100" />
        <el-table-column prop="type" label="违纪类型" width="100" />
        <el-table-column prop="time_of_infraction" label="违纪时间" width="160">
          <template #default="{ row }">
            {{ row.time_of_infraction || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="description_of_the_indiscipline" label="违纪描述" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.description_of_the_indiscipline || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="processing" label="处理方式" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.processing || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="processing_status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.processing_status)">
              {{ getStatusText(row.processing_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="processing_time" label="处理时间" width="160">
          <template #default="{ row }">
            {{ row.processing_time || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.remarks || '-' }}
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
      :title="dialogType === 'add' ? '添加违纪记录' : '编辑违纪记录'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="学生姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="班级" prop="classe">
          <el-input v-model="form.classe" />
        </el-form-item>
        <el-form-item label="违纪时间" prop="time_of_infraction">
          <el-date-picker
            v-model="form.time_of_infraction"
            type="date"
            placeholder="选择违纪时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="违纪描述" prop="description_of_the_indiscipline">
          <el-input v-model="form.description_of_the_indiscipline" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="处理方式" prop="processing">
          <el-input v-model="form.processing" />
        </el-form-item>
        <el-form-item label="处理状态" prop="processing_status">
          <el-select v-model="form.processing_status" placeholder="请选择处理状态">
            <el-option label="已处理" :value="1" />
            <el-option label="待处理" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理时间" prop="processing_time">
          <el-date-picker
            v-model="form.processing_time"
            type="date"
            placeholder="选择处理时间"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="违纪类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" clearable>
            <el-option
              v-for="(desc, type) in violationDescriptions"
              :key="type"
              :label="type"
              :value="type"
            >
              <el-tooltip
                :content="desc"
                placement="right"
                effect="light"
              >
                <span>{{ type }}</span>
              </el-tooltip>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" :rows="2" />
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
import { Search, Refresh, User, List } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getDisciplineList, addDiscipline, updateDiscipline, deleteDiscipline } from '@/api/discipline'
import { getClassList } from '@/api/class'

// 表格数据
const loading = ref(false)
const disciplineList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 搜索表单
const filterForm = reactive({
  name: '',        // 学生姓名
  type: ''         // 违纪类型
})

// 弹窗表单
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = reactive({
  id: '',
  name: '',
  classe: '',
  time_of_infraction: '',
  description_of_the_indiscipline: '',
  processing: '',
  processing_status: 2,
  processing_time: '',
  type: '',
  remarks: '',
  headteacher: localStorage.getItem('teacherName'),
  processors: localStorage.getItem('teacherName')
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
  classe: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  time_of_infraction: [{ required: true, message: '请选择违纪时间', trigger: 'change' }],
  description_of_the_indiscipline: [{ required: true, message: '请输入违纪描述', trigger: 'blur' }],
  processing: [{ required: true, message: '请输入处理方式', trigger: 'blur' }],
  processing_status: [{ required: true, message: '请选择处理状态', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

// 获取状态标签类型
const getStatusType = (status) => {
  // 确保 status 是数字类型
  const statusNumber = Number(status)
  const statusMap = {
    1: 'success',
    2: 'warning'
  }
  return statusMap[statusNumber] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  console.log('原始状态值:', status, '类型:', typeof status)  // 打印原始值和类型
  const statusNumber = Number(status)
  console.log('转换后的状态值:', statusNumber, '类型:', typeof statusNumber)  // 打印转换后的值和类型
  const statusMap = {
    1: '已处理',
    2: '待处理'
  }
  const result = statusMap[statusNumber]
  console.log('映射结果:', result)  // 打印映射结果
  return result || '未知状态'
}

// 获取违纪记录列表
const fetchList = async () => {
  loading.value = true
  try {
    const teacherName = localStorage.getItem('teacherName')
    if (!teacherName) {
      ElMessage.error('获取教师信息失败，请重新登录')
      return
    }

    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      headteacher: teacherName,
      processors: teacherName,
      name: filterForm.name || undefined,
      type: filterForm.type || undefined
    }
    console.log('请求参数:', params)
    const res = await getDisciplineList(params)
    console.log('后端返回的完整数据:', res)
    
    if (res.records) {
      disciplineList.value = res.records.map(record => {
        console.log('单条违纪记录数据:', record) // 添加日志查看数据结构
        return {
          id: record.id,
          name: record.name,
          classe: record.classe,
          type: record.type,
          time_of_infraction: record.timeOfInfraction,
          description_of_the_indiscipline: record.descriptionOfTheIndiscipline,
          processing: record.processing,
          processing_status: record.processingStatus,
          processing_time: record.processingTime,
          remarks: record.remarks,
          headteacher: record.headteacher,
          processors: record.processors,
          create_by: record.createBy,
          update_by: record.updateBy,
          create_time: record.createTime,
          update_time: record.updateTime,
          deleted: record.deleted || 0
        }
      })
      total.value = res.total
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
  fetchList()
}

// 重置搜索
const resetForm = () => {
  filterForm.name = ''
  filterForm.type = ''
  currentPage.value = 1
  fetchList()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchList()
}

// 添加记录
const handleAdd = () => {
  const teacherName = localStorage.getItem('teacherName')
  if (!teacherName) {
    ElMessage.error('获取教师信息失败，请重新登录')
    return
  }

  dialogType.value = 'add'
  dialogVisible.value = true
  Object.keys(form).forEach(key => {
    if (key === 'processing_status') {
      form[key] = 2  // 默认为待处理
    } else {
      form[key] = ''
    }
  })
  // 设置班主任和处理人为当前教师
  form.headteacher = teacherName
  form.processors = teacherName
}

// 编辑记录
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  
  // 直接使用表格中的数据
  Object.keys(form).forEach(key => {
    form[key] = row[key]
  })
  
  // 确保班级字段直接使用原始值
  form.classe = row.classe
  
  // 其他字段的处理
  form.time_of_infraction = row.time_of_infraction
  form.description_of_the_indiscipline = row.description_of_the_indiscipline
  form.processing_time = row.processing_time
  form.processing_status = Number(row.processing_status)
}

// 删除记录
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteDiscipline(row.id)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 构造提交数据，字段名与后端一致
        const submitData = {
          id: form.id,
          name: form.name,
          timeOfInfraction: form.time_of_infraction,
          descriptionOfTheIndiscipline: form.description_of_the_indiscipline,
          processing: form.processing,
          processingStatus: form.processing_status,  // 不需要 Number() 转换
          classe: form.classe,
          headteacher: form.headteacher,
          processors: form.processors,
          remarks: form.remarks,
          processingTime: form.processing_time,
          type: form.type
        }

        if (dialogType.value === 'add') {
          await addDiscipline(submitData)
          ElMessage.success('添加成功')
        } else {
          await updateDiscipline(submitData)
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

// 定义违规类型说明对象
const violationDescriptions = {
  '考勤违规': '包括迟到、早退、旷课等考勤相关违规行为',
  '打架违规': '包括打架斗殴、寻衅滋事等暴力行为',
  '赌博违规': '包括赌博、参与赌博活动等违规行为',
  '考试作弊': '包括考试作弊、协助作弊等违反考试纪律行为',
  '违反课堂纪律': '包括上课玩手机、扰乱课堂秩序等行为',
  '消防违规': '包括违规使用电器、吸烟等消防安全隐患行为',
  '宿舍违规': '包括夜不归宿、留宿外人、违规使用电器等行为',
  '实训违规': '包括违反操作规程、不遵守安全规定等行为',
  '网络违规': '包括传播不当信息、攻击学校网络等行为',
  '损坏公物': '包括故意损坏学校设施、教学设备等行为',
  '其他违规': '未列入以上类型的其他违规行为'
}

// 获取班级信息
const getClassName = async (classId) => {
  try {
    const res = await getClassList({ classId })  // 使用 getClassList 替代 getClassById
    if (res.code === 200) {
      return res.data.className
    }
    return '未知班级'
  } catch (error) {
    console.error('获取班级信息失败:', error)
    return '未知班级'
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.discipline-container {
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

.el-table :deep(.el-table__cell) {
  padding: 8px 0;
}

.el-tag {
  width: 100%;
  text-align: center;
}
</style> 