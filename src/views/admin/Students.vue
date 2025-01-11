<template>
  <div class="students-container">
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
          <div class="left">
            <el-icon class="icon"><List /></el-icon>
            <span class="title">学生列表</span>
            <el-tag type="info" effect="plain" round>共 {{ total }} 条</el-tag>
          </div>
          <div class="right">
            <el-button-group>
              <el-button type="primary" @click="handleDownloadTemplate">
                <el-icon><Download /></el-icon>下载模板
              </el-button>
              <el-upload
                class="upload-demo"
                :show-file-list="false"
                :before-upload="handleImport">
                <el-button type="success">
                  <el-icon><Upload /></el-icon>导入Excel
                </el-button>
              </el-upload>
              <el-button type="warning" @click="handleExport">
                <el-icon><Download /></el-icon>导出Excel
              </el-button>
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>新增学生
              </el-button>
            </el-button-group>
          </div>
        </div>
      </template>

      <!-- 表格内容 -->
      <el-table :data="tableData" border stripe v-loading="loading">
        <!-- 表格列配置 -->
        <el-table-column prop="studentNo" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="classe" label="班级" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '在读' : '离校' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="info" @click="handleDetail(row)">
                查看
              </el-button>
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
          :page-sizes="[10, 20, 30, 50]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog 
      :title="dialogType === 'add' ? '新增学生' : '编辑学生'"
      v-model="dialogVisible"
      width="800px">
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNo">
              <el-input v-model="form.studentNo" placeholder="请输入学号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="form.sex">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄" prop="age">
              <el-input v-model="form.age" placeholder="请输入年龄" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="form.wechat" placeholder="请输入微信号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="QQ号" prop="qq">
              <el-input v-model="form.qq" placeholder="请输入QQ号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="请选择出生日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model="form.nation" placeholder="请输入民族" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="籍贯" prop="nativePlace">
              <el-input v-model="form.nativePlace" placeholder="请输入籍贯" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="政治面貌" prop="politicalStatus">
              <el-select v-model="form.politicalStatus" placeholder="请选择政治面貌">
                <el-option
                  v-for="item in politicalStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="婚姻状况" prop="maritalStatus">
              <el-select v-model="form.maritalStatus" placeholder="请选择婚姻状况">
                <el-option
                  v-for="item in maritalStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="学生状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择学生状态">
                <el-option
                  v-for="item in studentStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="班级" prop="classId">
              <el-select 
                v-model="form.classId" 
                placeholder="请选择班级"
                filterable
                @change="handleClassChange">
                <el-option
                  v-for="item in classOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入学时间" prop="enrollmentDate">
              <el-date-picker
                v-model="form.enrollmentDate"
                type="date"
                placeholder="请选择入学时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="毕业时间" prop="graduationDate">
              <el-date-picker
                v-model="form.graduationDate"
                type="date"
                placeholder="请选择毕业时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="现居地址" prop="address">
          <el-input
            v-model="form.address"
            type="textarea"
            placeholder="请输入现居地址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      title="学生详情"
      v-model="detailDialogVisible"
      width="600px">
      <el-descriptions
        :column="2"
        border>
        <el-descriptions-item label="学号" label-align="right" align="left">
          {{ detailData.studentNo }}
        </el-descriptions-item>
        <el-descriptions-item label="姓名" label-align="right" align="left">
          {{ detailData.name }}
        </el-descriptions-item>
        <el-descriptions-item label="性别" label-align="right" align="left">
          {{ detailData.gender === 1 ? '男' : '女' }}
        </el-descriptions-item>
        <el-descriptions-item label="年龄" label-align="right" align="left">
          {{ detailData.age }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号" label-align="right" align="left">
          {{ detailData.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱" label-align="right" align="left">
          {{ detailData.email }}
        </el-descriptions-item>
        <el-descriptions-item label="班级" label-align="right" align="left">
          {{ detailData.className }}
        </el-descriptions-item>
        <el-descriptions-item label="入学时间" label-align="right" align="left">
          {{ detailData.enrollTime }}
        </el-descriptions-item>
        <el-descriptions-item label="状态" label-align="right" align="left">
          <el-tag :type="detailData.status === 1 ? 'success' : 'info'">
            {{ detailData.status === 1 ? '在读' : '离校' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" label-align="right" align="left">
          {{ detailData.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" label-align="right" align="left">
          {{ detailData.updateTime }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" label-align="right" align="left" :span="2">
          {{ detailData.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, User, List, Plus, Download, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStudentList, deleteStudent, addStudent, updateStudent } from '@/api/student'
import { getClassList } from '@/api/class'
import { exportExcel } from '@/utils/excel'

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

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add') // 'add' 或 'edit'
const formRef = ref(null)

// 表单数据
const form = reactive({
  studentId: undefined,
  studentNo: '',
  name: '',
  sex: 1,  // 改用sex字段
  phone: '',
  status: 1,
  classId: '',
  teacherId: '',
  enrollmentDate: '',  // 使用正确的字段名
  graduationDate: '',
  wechat: '',
  qq: '',
  idCard: '',
  birthday: '',
  nation: '',
  nativePlace: '',
  politicalStatus: '',
  maritalStatus: 1,
  address: '',
  age: '',
  classe: '',  // 班级名称
  headteacher: ''  // 班主任姓名
})

// 表单验证规则
const rules = {
  studentNo: [
    { required: true, message: '请输入学号', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  classId: [
    { required: true, message: '请选择班级', trigger: 'change' }
  ],
  enrollmentDate: [
    { required: true, message: '请选择入学时间', trigger: 'change' }
  ]
}

// 婚姻状况选项
const maritalStatusOptions = [
  { label: '未婚', value: 1 },
  { label: '已婚', value: 2 }
]

// 政治面貌选项
const politicalStatusOptions = [
  { label: '群众', value: '群众' },
  { label: '共青团员', value: '共青团员' },
  { label: '中共党员', value: '中共党员' }
]

// 学生状态选项
const studentStatusOptions = [
  { label: '在读', value: 1 },
  { label: '休学', value: 2 },
  { label: '退学', value: 3 },
  { label: '毕业', value: 4 }
]

// 获取学生列表
const fetchStudentList = async () => {
  loading.value = true
  try {
    const params = {
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      name: filterForm.name || undefined
    }
    
    const res = await getStudentList(params)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchStudentList()
}

// 重置搜索
const handleReset = () => {
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

// 导出学生数据到Excel
const handleExport = async () => {
  try {
    // 显示加载中
    const loading = ElMessage.info({
      message: '正在导出数据，请稍候...',
      duration: 0
    })

    // 获取所有学生数据
    const res = await getStudentList({
      currentPage: 1,
      pageSize: 9999,  // 使用大数值获取所有数据
      name: filterForm.name || undefined
    })

    if (res.code !== 200) {
      ElMessage.error('获取数据失败')
      loading.close()
      return
    }

    const allStudents = res.data.records

    // 准备表头数据
    const headers = [
      { header: '学号', key: 'studentNo', width: 15 },
      { header: '姓名', key: 'name', width: 10 },
      { header: '性别', key: 'gender', width: 8 },
      { header: '年龄', key: 'age', width: 8 },
      { header: '手机号', key: 'phone', width: 15 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '班级', key: 'className', width: 15 },
      { header: '入学时间', key: 'enrollTime', width: 15 },
      { header: '状态', key: 'status', width: 8 },
      { header: '创建时间', key: 'createTime', width: 20 },
      { header: '更新时间', key: 'updateTime', width: 20 },
      { header: '备注', key: 'remark', width: 30 }
    ]

    // 准备导出数据
    const data = allStudents.map(student => {
      // 确保所有字段都有值，避免undefined
      const item = {
        studentNo: student.studentNo || '',
        name: student.name || '',
        gender: student.gender === 1 ? '男' : '女',
        age: student.age || '',
        phone: student.phone || '',
        email: student.email || '',  // 确保email字段
        className: student.className || '',  // 确保className字段
        enrollTime: student.enrollTime || '',  // 确保enrollTime字段
        status: student.status === 1 ? '在读' : '离校',
        createTime: student.createTime || '',
        updateTime: student.updateTime || '',
        remark: student.remark || ''  // 确保remark字段
      }

      // 处理特殊格式
      if (item.enrollTime) {
        // 确保日期格式统一
        try {
          const date = new Date(item.enrollTime)
          item.enrollTime = date.toISOString().split('T')[0]
        } catch (e) {
          item.enrollTime = ''
        }
      }

      // 处理创建和更新时间格式
      if (item.createTime) {
        try {
          const date = new Date(item.createTime)
          item.createTime = date.toISOString().replace('T', ' ').split('.')[0]
        } catch (e) {
          item.createTime = ''
        }
      }

      if (item.updateTime) {
        try {
          const date = new Date(item.updateTime)
          item.updateTime = date.toISOString().replace('T', ' ').split('.')[0]
        } catch (e) {
          item.updateTime = ''
        }
      }

      return item
    })

    // 调用通用导出方法
    await exportExcel({
      title: '北大青鸟教务系统 - 学生信息表',
      headers,
      data,
      filename: '学生信息表.xlsx'
    })

    // 关闭加载提示
    loading.close()
    ElMessage.success(`成功导出 ${data.length} 条数据`)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 下载模板
const handleDownloadTemplate = () => {
  try {
    // 准备表头数据
    const headers = [
      { header: '学号', key: 'studentNo', width: 15 },
      { header: '姓名', key: 'name', width: 10 },
      { header: '性别', key: 'gender', width: 12 },
      { header: '年龄', key: 'age', width: 10 },
      { header: '手机号', key: 'phone', width: 20 },
      { header: '邮箱', key: 'email', width: 25 },
      { header: '班级', key: 'className', width: 15 },
      { header: '入学时间', key: 'enrollTime', width: 15 },
      { header: '状态', key: 'status', width: 12 },
      { header: '备注', key: 'remark', width: 20 }
    ]

    // 准备模板数据
    const data = [{
      studentNo: '示例：2024001',
      name: '示例：张三',
      gender: '示例：男/女',
      age: '示例：18',
      phone: '示例：13800138000',
      email: '示例：zhangsan@example.com',
      className: '示例：Java开发1班',
      enrollTime: '示例：2024-01-01',
      status: '示例：在读/离校',
      remark: '示例：任何补充说明'
    }]

    // 调用通用导出方法
    exportExcel({
      title: '北大青鸟教务系统 - 学生信息模板',
      headers,
      data,
      filename: '学生信息导入模板.xlsx'
    })

    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('模板下载失败:', error)
    ElMessage.error('模板下载失败')
  }
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

// 班级选项
const classOptions = ref([])

// 获取所有班级
const fetchAllClasses = async () => {
  try {
    const res = await getClassList({
      currentPage: 1,
      pageSize: 9999,  // 使用大数值获取所有数据
      name: ''  // 空字符串查询所有
    })
    
    if (res.code === 200 && res.data.records) {
      classOptions.value = res.data.records.map(item => ({
        value: item.classId,
        label: item.name
      }))
    }
  } catch (error) {
    console.error('获取班级列表失败:', error)
    ElMessage.error('获取班级列表失败')
  }
}

// 班级选择改变时更新班级名称
const handleClassChange = (classId) => {
  const selectedClass = classOptions.value.find(item => item.value === classId)
  if (selectedClass) {
    form.className = selectedClass.label
  }
}

// 编辑学生
const handleEdit = async (row) => {
  // 确保班级列表已加载
  if (classOptions.value.length === 0) {
    await fetchAllClasses()
  }
  
  dialogType.value = 'edit'
  Object.assign(form, {
    studentId: row.studentId,
    studentNo: row.studentNo,
    name: row.name,
    sex: row.sex,  // 使用正确的性别字段
    phone: row.phone,
    status: row.status,
    classId: row.classId,
    teacherId: row.teacherId,
    enrollmentDate: row.enrollmentDate,
    graduationDate: row.graduationDate,
    wechat: row.wechat,
    qq: row.qq,
    idCard: row.idCard,
    birthday: row.birthday,
    nation: row.nation,
    nativePlace: row.nativePlace,
    politicalStatus: row.politicalStatus,
    maritalStatus: row.maritalStatus,
    address: row.address,
    age: row.age,
    classe: row.classe,
    headteacher: row.headteacher
  })
  dialogVisible.value = true
}

// 新增学生
const handleAdd = async () => {
  // 确保班级列表已加载
  if (classOptions.value.length === 0) {
    await fetchAllClasses()
  }
  
  dialogType.value = 'add'
  // 重置表单
  Object.assign(form, {
    studentId: undefined,
    studentNo: '',
    name: '',
    sex: 1,
    phone: '',
    status: 1,
    classId: '',
    teacherId: '',
    enrollmentDate: '',
    graduationDate: '',
    wechat: '',
    qq: '',
    idCard: '',
    birthday: '',
    nation: '',
    nativePlace: '',
    politicalStatus: '',
    maritalStatus: 1,
    address: '',
    age: '',
    classe: '',
    headteacher: ''
  })
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const api = dialogType.value === 'add' ? addStudent : updateStudent
        const res = await api(form)
        
        if (res.code === 200) {
          ElMessage.success(dialogType.value === 'add' ? '新增成功' : '修改成功')
          dialogVisible.value = false
          fetchStudentList()
        }
      } catch (error) {
        console.error(dialogType.value === 'add' ? '新增失败:' : '修改失败:', error)
        ElMessage.error(dialogType.value === 'add' ? '新增失败' : '修改失败')
      }
    }
  })
}

// 详情对话框
const detailDialogVisible = ref(false)
const detailData = ref({})

// 查看详情
const handleDetail = (row) => {
  detailData.value = { ...row }
  detailDialogVisible.value = true
}

onMounted(() => {
  fetchStudentList()
  fetchAllClasses()
})
</script>

<style scoped>
.students-container {
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

:deep(.el-upload) {
  width: auto;
}

:deep(.el-upload-list) {
  display: none;
}

.el-descriptions {
  padding: 10px;
}

:deep(.el-descriptions__label) {
  width: 100px;
  justify-content: flex-end;
  padding: 8px 15px;
  background-color: #f5f7fa;
}

:deep(.el-descriptions__content) {
  padding: 8px 15px;
}

:deep(.el-tag) {
  width: 60px;
  text-align: center;
}
</style> 