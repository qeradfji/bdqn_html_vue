<template>
  <div class="students-container">
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
            <el-upload
              class="excel-upload"
              action="#"
              accept=".xlsx, .xls"
              :show-file-list="false"
              :before-upload="handleImport"
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
            <span class="title">学生列表</span>
            <el-tag type="info" effect="plain" round>共 {{ total }} 条</el-tag>
          </div>
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

    <!-- 编辑对话框 -->
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
        <el-form-item label="学号" prop="studentNo">
          <el-input v-model="form.studentNo" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="班级" prop="classe">
          <el-input v-model="form.classe" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="在读" :value="1" />
            <el-option label="休学" :value="2" />
            <el-option label="退学" :value="3" />
            <el-option label="毕业" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="入学时间" prop="enrollmentDate">
          <el-date-picker
            v-model="form.enrollmentDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model="form.age" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { 
  Search, Refresh, Upload, Download, User, List, Edit, Delete 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { 
  getStudentListByHeadteacher, 
  addStudent, 
  updateStudent, 
  deleteStudent,
  importStudents 
} from '@/api/student'
import * as XLSX from 'xlsx'

// 表格数据
const loading = ref(false)
const studentList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索表单
const filterForm = reactive({
  name: ''
})

// 弹窗表单
const dialogVisible = ref(false)
const dialogType = ref('add')
const formRef = ref(null)
const form = reactive({
  studentNo: '',
  name: '',
  phone: '',
  status: 1,
  classe: '',
  enrollmentDate: '',
  age: ''
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
  ]
}

// 获取学生列表
const fetchStudentList = async () => {
  loading.value = true
  try {
    const teacherName = localStorage.getItem('teacherName')
    if (!teacherName) {
      ElMessage.error('获取教师信息失败，请重新登录')
      return
    }
    
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      headteacher: teacherName,
      name: filterForm.name || undefined
    }
    
    const res = await getStudentListByHeadteacher(params)
    if (res.data && res.data.records) {
      studentList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索和重置
const handleSearch = () => {
  currentPage.value = 1
  fetchStudentList()
}

const resetForm = () => {
  filterForm.name = ''
  currentPage.value = 1
  fetchStudentList()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchStudentList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchStudentList()
}

// 编辑和删除
const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  Object.keys(form).forEach(key => {
    form[key] = row[key]
  })
}

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
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      try {
        if (dialogType.value === 'add') {
          await addStudent(form)
          ElMessage.success('添加成功')
        } else {
          await updateStudent(form)
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        fetchStudentList()
      } catch (error) {
        ElMessage.error('操作失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 状态处理
const getStatusText = (status) => {
  const statusMap = {
    1: '在读',
    2: '休学',
    3: '退学',
    4: '毕业'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status) => {
  const typeMap = {
    1: 'success',
    2: 'warning',
    3: 'danger',
    4: 'info'
  }
  return typeMap[status] || ''
}

// 导入Excel
const handleImport = async (file) => {
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 转换为JSON数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // 移除表头
        jsonData.shift()
        
        // 获取教师信息
        const teacherName = localStorage.getItem('teacherName')
        if (!teacherName) {
          ElMessage.error('获取教师信息失败，请重新登录')
          return
        }

        // 转换为学生对象数组
        const studentList = jsonData.map(row => ({
          studentNo: row[0],
          name: row[1],
          classe: row[2],
          phone: row[3],
          age: parseInt(row[4]) || 0,
          idCard: row[5],
          nation: row[6],
          nativePlace: row[7],
          politicalStatus: row[8],
          address: row[9],
          wechat: row[10],
          qq: row[11],
          enrollmentDate: row[12],
          headteacher: teacherName,
          status: 1
        }))

        // 发送数据到后端
        const res = await importStudents(studentList)
        
        if (res.code === 200) {
          const { successCount, failCount, failList } = res.data
          if (failCount > 0) {
            ElMessage.warning(`导入完成：成功${successCount}条，失败${failCount}条`)
            console.error('失败数据:', failList)
          } else {
            ElMessage.success(`成功导入${successCount}条数据`)
          }
          fetchStudentList()
        } else {
          ElMessage.error(res.message || '导入失败')
        }
      } catch (error) {
        console.error('处理Excel数据失败:', error)
        ElMessage.error('处理Excel数据失败')
      }
    }
    reader.readAsArrayBuffer(file)
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败')
  }
  return false
}

const downloadTemplate = async () => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('学生信息')

    // 设置列
    worksheet.columns = [
      { header: '学号', key: 'studentNo', width: 15 },
      { header: '姓名', key: 'name', width: 12 },
      { header: '班级', key: 'classe', width: 15 },
      { header: '手机号', key: 'phone', width: 15 },
      { header: '年龄', key: 'age', width: 10 },
      { header: '身份证号', key: 'idCard', width: 20 },
      { header: '民族', key: 'nation', width: 10 },
      { header: '籍贯', key: 'nativePlace', width: 15 },
      { header: '政治面貌', key: 'politicalStatus', width: 12 },
      { header: '家庭住址', key: 'address', width: 30 },
      { header: '微信号', key: 'wechat', width: 15 },
      { header: 'QQ号', key: 'qq', width: 15 },
      { header: '入学时间', key: 'enrollmentDate', width: 15 }
    ]

    // 添加示例数据
    worksheet.addRow({
      studentNo: '20240001',
      name: '张三',
      classe: 'Web2401班',
      phone: '13800138001',
      age: 18,
      idCard: '110101200001011234',
      nation: '汉族',
      nativePlace: '北京',
      politicalStatus: '群众',
      address: '北京市海淀区',
      wechat: 'wx123',
      qq: '123456',
      enrollmentDate: '2024-01-01'
    })

    // 设置样式
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F0FF' }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, '学生信息导入模板.xlsx')

    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('模板下载失败:', error)
    ElMessage.error('模板下载失败')
  }
}

const handleExport = async () => {
  try {
    const teacherName = localStorage.getItem('teacherName')
    if (!teacherName) {
      ElMessage.error('获取教师信息失败，请重新登录')
      return
    }

    const res = await getStudentListByHeadteacher({
      currentPage: 1,
      pageSize: 999999,
      headteacher: teacherName
    })

    if (res.code === 200 && res.data.records) {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('学生信息')

      worksheet.columns = [
        { header: '学号', key: 'studentNo', width: 15 },
        { header: '姓名', key: 'name', width: 12 },
        { header: '手机号', key: 'phone', width: 15 },
        { header: '班级', key: 'classe', width: 15 },
        { header: '状态', key: 'status', width: 10 }
      ]

      worksheet.insertRow(1, ['北大青鸟教务系统 - 学生信息表'])
      worksheet.mergeCells('A1:E1')

      const titleRow = worksheet.getRow(1)
      titleRow.height = 40
      titleRow.getCell(1).font = {
        name: '宋体',
        size: 16,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      }
      titleRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4B90FF' }
      }
      titleRow.getCell(1).alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }

      const rows = res.data.records.map(item => ({
        studentNo: item.studentNo,
        name: item.name,
        phone: item.phone,
        classe: item.classe,
        status: getStatusText(item.status)
      }))
      worksheet.addRows(rows)

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.height = 25
          row.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          }
          row.eachCell(cell => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE9E9E9' } },
              left: { style: 'thin', color: { argb: 'FFE9E9E9' } },
              bottom: { style: 'thin', color: { argb: 'FFE9E9E9' } },
              right: { style: 'thin', color: { argb: 'FFE9E9E9' } }
            }
          })
        }
      })

      const timestamp = new Date().toLocaleString().replace(/[/:]/g, '').replace(/\s/g, '_')
      const fileName = `学生信息表_${timestamp}.xlsx`

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, fileName)

      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

onMounted(() => {
  fetchStudentList()
})
</script>

<style scoped>
.students-container {
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

.excel-upload {
  display: inline-block;
}

:deep(.el-upload) {
  display: inline-block;
}

.el-button-group {
  display: flex;
  gap: 10px;
}
</style> 