<template>
  <div class="students-container">
    <el-card class="box-card">
      <!-- 搜索区域 -->
      <div class="search-area">
        <el-form :inline="true" :model="searchForm" ref="searchFormRef">
          <el-form-item label="学生姓名">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入学生姓名"
              clearable
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="success" @click="handleExport">导出Excel</el-button>
            <el-upload
              class="upload-inline"
              :action="null"
              :auto-upload="false"
              :show-file-list="false"
              accept=".xlsx,.xls"
              :on-change="handleFileChange"
            >
              <el-button type="primary">导入Excel</el-button>
            </el-upload>
            <el-button type="info" @click="downloadTemplate">下载模板</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格区域 -->
      <el-table :data="studentList" border v-loading="loading" style="width: 100%">
        <el-table-column prop="studentNo" label="学号" width="100" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="sex" label="性别" width="80">
          <template #default="scope">
            {{ scope.row.sex === 1 ? '男' : scope.row.sex === 2 ? '女' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="classe" label="班级" width="120" />
        <el-table-column prop="phone" label="联系电话" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="enrollmentDate" label="入学日期" width="120" />
        <el-table-column prop="address" label="地址" min-width="150" show-overflow-tooltip />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="info" link @click="handleViewGuardians(scope.row)">查看监护人</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="searchForm.currentPage"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑学生信息"
      width="60%"
      :before-close="handleClose"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="student-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="学号" prop="studentNo">
              <el-input v-model="form.studentNo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="sex">
              <el-select v-model="form.sex" placeholder="请选择性别">
                <el-option label="男" :value="1" />
                <el-option label="女" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班级" prop="classe">
              <el-input v-model="form.classe" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态">
                <el-option label="在读" :value="1" />
                <el-option label="休学" :value="2" />
                <el-option label="退学" :value="3" />
                <el-option label="毕业" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入学日期" prop="enrollmentDate">
              <el-date-picker
                v-model="form.enrollmentDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业日期" prop="graduationDate">
              <el-date-picker
                v-model="form.graduationDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="微信号" prop="wechat">
              <el-input v-model="form.wechat" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="QQ号" prop="qq">
              <el-input v-model="form.qq" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model="form.nation" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="籍贯" prop="nativePlace">
              <el-input v-model="form.nativePlace" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="政治面貌" prop="politicalStatus">
              <el-input v-model="form.politicalStatus" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="婚姻状况" prop="maritalStatus">
              <el-select v-model="form.maritalStatus" placeholder="请选择婚姻状况">
                <el-option label="已婚" :value="1" />
                <el-option label="未婚" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="提示"
      width="30%"
      :before-close="handleDeleteClose"
    >
      <span>确定要删除该学生信息吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleDeleteClose">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改监护人信息对话框 -->
    <el-dialog
      v-model="guardianDialogVisible"
      title="监护人信息"
      width="70%"
    >
      <div class="guardian-header">
        <el-button type="primary" @click="handleAddGuardian">添加监护人</el-button>
      </div>
      
      <!-- 原有的监护人列表展示 -->
      <div class="guardian-info">
        <el-descriptions
          v-for="guardian in guardianList"
          :key="guardian.guardianId"
          :title="guardian.relationship"
          border
          class="guardian-item"
        >
          <template #extra>
            <el-button type="primary" link @click="handleEditGuardian(guardian)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDeleteGuardian(guardian)">
              删除
            </el-button>
          </template>
          
          <el-descriptions-item label="姓名" width="150px">
            {{ guardian.name }}
          </el-descriptions-item>
          <el-descriptions-item label="关系" width="150px">
            {{ guardian.relationship }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话" width="150px">
            {{ guardian.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="微信" width="150px">
            {{ guardian.wechat }}
          </el-descriptions-item>
          <el-descriptions-item label="职业">
            {{ guardian.occupation }}
          </el-descriptions-item>
          <el-descriptions-item label="工作单位">
            {{ guardian.workUnit }}
          </el-descriptions-item>
          <el-descriptions-item label="地址" :span="3">
            {{ guardian.address }}
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 无数据时显示 -->
        <el-empty
          v-if="!guardianList.length"
          description="暂无监护人信息"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="guardianDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加新增监护人对话框 -->
    <el-dialog
      v-model="guardianFormVisible"
      :title="guardianFormType === 'add' ? '新增监护人' : '编辑监护人'"
      width="50%"
      :before-close="handleGuardianFormClose"
      append-to-body
    >
      <el-form
        ref="guardianFormRef"
        :model="guardianForm"
        :rules="guardianRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="guardianForm.name" placeholder="请输入监护人姓名" />
        </el-form-item>
        
        <el-form-item label="关系" prop="relationship">
          <el-select v-model="guardianForm.relationship" placeholder="请选择关系" style="width: 100%">
            <el-option label="父亲" value="父亲" />
            <el-option label="母亲" value="母亲" />
            <el-option label="祖父" value="祖父" />
            <el-option label="祖母" value="祖母" />
            <el-option label="外祖父" value="外祖父" />
            <el-option label="外祖母" value="外祖母" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="guardianForm.phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="微信" prop="wechat">
          <el-input v-model="guardianForm.wechat" placeholder="请输入微信号" />
        </el-form-item>

        <el-form-item label="职业" prop="occupation">
          <el-input v-model="guardianForm.occupation" placeholder="请输入职业" />
        </el-form-item>

        <el-form-item label="工作单位" prop="workUnit">
          <el-input v-model="guardianForm.workUnit" placeholder="请输入工作单位" />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input
            v-model="guardianForm.address"
            type="textarea"
            :rows="3"
            placeholder="请输入地址"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleGuardianFormClose">取消</el-button>
          <el-button type="primary" @click="submitGuardianForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加删除确认对话框 -->
    <el-dialog
      v-model="deleteGuardianDialogVisible"
      title="提示"
      width="30%"
      append-to-body
    >
      <span>确定要删除该监护人信息吗？此操作不可恢复。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteGuardianDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDeleteGuardian">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllStudentList } from '@/api/student'
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'

// 搜索表单
const searchForm = ref({
  name: '',
  currentPage: 1,
  pageSize: 10
})

// 数据列表
const studentList = ref([])
const total = ref(0)
const loading = ref(false)

// 表单相关
const dialogVisible = ref(false)
const formRef = ref(null)
const form = ref({
  studentId: '',
  studentNo: '',
  name: '',
  sex: null,
  classe: '',
  phone: '',
  status: null,
  enrollmentDate: '',
  graduationDate: '',
  wechat: '',
  qq: '',
  idCard: '',
  birthday: '',
  nation: '',
  nativePlace: '',
  politicalStatus: '',
  maritalStatus: null,
  address: '',
  age: '',
  headteacher: ''
})

// 表单验证规则
const rules = {
  studentNo: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  classe: [{ required: true, message: '请输入班级', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  enrollmentDate: [{ required: true, message: '请选择入学日期', trigger: 'change' }]
}

// 获取学生列表
const getStudentList = async () => {
  loading.value = true
  try {
    const res = await getAllStudentList({
      name: searchForm.value.name,
      currentPage: searchForm.value.currentPage,
      pageSize: searchForm.value.pageSize
    })
    if (res.code === 200) {
      studentList.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取学生列表失败')
    console.error('获取学生列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchForm.value.currentPage = 1
  getStudentList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    name: '',
    currentPage: 1,
    pageSize: 10
  }
  getStudentList()
}

// 分页大小改变
const handleSizeChange = (val) => {
  searchForm.value.pageSize = val
  getStudentList()
}

// 页码改变
const handleCurrentChange = (val) => {
  searchForm.value.currentPage = val
  getStudentList()
}

// 状态处理
const getStatusType = (status) => {
  const statusMap = {
    1: 'success',
    2: 'warning',
    3: 'info',
    4: 'danger'
  }
  return statusMap[status] || ''
}

const getStatusText = (status) => {
  const statusMap = {
    1: '在读',
    2: '休学',
    3: '退学',
    4: '毕业'
  }
  return statusMap[status] || '未知'
}

// 查看学生信息
const handleView = (row) => {
  console.log('查看学生:', row)
  // 实现查看详情逻辑
}

// 编辑学生信息
const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await fetch('/api/sys-student/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          },
          body: JSON.stringify(form.value)
        })

        if (response.ok) {
          ElMessage.success('更新成功')
          dialogVisible.value = false
          getStudentList() // 刷新列表
        } else {
          ElMessage.error('更新失败')
        }
      } catch (error) {
        console.error('更新失败:', error)
        ElMessage.error('更新失败')
      }
    }
  })
}

// 导出Excel功能
const handleExport = async () => {
  try {
    // 创建工作簿
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('学生列表')

    // 设置表头
    worksheet.columns = [
      { header: '学号', key: 'studentNo', width: 15 },
      { header: '姓名', key: 'name', width: 15 },
      { header: '性别', key: 'sex', width: 10 },
      { header: '班级', key: 'classe', width: 15 },
      { header: '联系电话', key: 'phone', width: 15 },
      { header: '状态', key: 'status', width: 10 },
      { header: '入学日期', key: 'enrollmentDate', width: 15 },
      { header: '地址', key: 'address', width: 30 }
    ]

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // 获取所有数据（可以考虑分页获取所有数据）
    const res = await getAllStudentList({
      name: searchForm.value.name,
      currentPage: 1,
      pageSize: 1000 // 设置较大的数值以获取所有数据
    })

    if (res.code === 200) {
      // 处理数据
      const data = res.data.records.map(item => ({
        studentNo: item.studentNo,
        name: item.name,
        sex: item.sex === 1 ? '男' : item.sex === 2 ? '女' : '-',
        classe: item.classe,
        phone: item.phone,
        status: getStatusText(item.status),
        enrollmentDate: item.enrollmentDate,
        address: item.address
      }))

      // 添加数据行
      worksheet.addRows(data)

      // 设置单元格样式
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' }
          // 添加边框
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
        })
      })

      // 生成二进制数据
      const buffer = await workbook.xlsx.writeBuffer()

      // 创建Blob对象
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })

      // 创建下载链接
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `学生列表_${new Date().toLocaleDateString()}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      ElMessage.success('导出成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 下载Excel模板
const downloadTemplate = async () => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('学生信息模板')

    // 设置表头
    worksheet.columns = [
      { header: '学号*', key: 'studentNo', width: 15 },
      { header: '姓名*', key: 'name', width: 15 },
      { header: '性别(1男/2女)*', key: 'sex', width: 15 },
      { header: '班级*', key: 'classe', width: 15 },
      { header: '手机号*', key: 'phone', width: 15 },
      { header: '状态(1在读/2休学/3退学/4毕业)*', key: 'status', width: 25 },
      { header: '入学日期(YYYY-MM-DD)*', key: 'enrollmentDate', width: 25 },
      { header: '毕业日期(YYYY-MM-DD)', key: 'graduationDate', width: 25 },
      { header: '微信号', key: 'wechat', width: 15 },
      { header: 'QQ号', key: 'qq', width: 15 },
      { header: '身份证号', key: 'idCard', width: 20 },
      { header: '出生日期(YYYY-MM-DD)', key: 'birthday', width: 20 },
      { header: '民族', key: 'nation', width: 15 },
      { header: '籍贯', key: 'nativePlace', width: 15 },
      { header: '政治面貌', key: 'politicalStatus', width: 15 },
      { header: '婚姻状况(1已婚/2未婚)', key: 'maritalStatus', width: 20 },
      { header: '地址', key: 'address', width: 30 },
      { header: '年龄', key: 'age', width: 10 }
    ]

    // 添加示例数据
    const exampleData = {
      studentNo: 'S001',
      name: '张三',
      sex: 1,
      classe: '2024级1班',
      phone: '13800138000',
      status: 1,
      enrollmentDate: '2024-03-01',
      graduationDate: '2027-07-01',
      wechat: 'wx123456',
      qq: '123456789',
      idCard: '110101200001011234',
      birthday: '2000-01-01',
      nation: '汉族',
      nativePlace: '北京',
      politicalStatus: '共青团员',
      maritalStatus: 2,
      address: '北京市海淀区',
      age: '24'
    }

    worksheet.addRow(exampleData)

    // 设置样式
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6E6' }
    }

    // 生成并下载文件
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '学生信息导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('模板下载失败:', error)
    ElMessage.error('模板下载失败')
  }
}

// 处理文件上传
const handleFileChange = async (file) => {
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })

      // 转换数据格式
      const formattedData = jsonData.map(row => ({
        studentNo: row['学号*'] || '',
        name: row['姓名*'] || '',
        sex: parseInt(row['性别(1男/2女)*']) || 0,
        classe: row['班级*'] || '',
        phone: row['手机号*'] || '',
        status: parseInt(row['状态(1在读/2休学/3退学/4毕业)*']) || 1,
        enrollmentDate: row['入学日期(YYYY-MM-DD)*'] || '',
        graduationDate: row['毕业日期(YYYY-MM-DD)'] || '',
        wechat: row['微信号'] || '',
        qq: row['QQ号'] || '',
        idCard: row['身份证号'] || '',
        birthday: row['出生日期(YYYY-MM-DD)'] || '',
        nation: row['民族'] || '',
        nativePlace: row['籍贯'] || '',
        politicalStatus: row['政治面貌'] || '',
        maritalStatus: parseInt(row['婚姻状况(1已婚/2未婚)']) || 0,
        address: row['地址'] || '',
        age: row['年龄'] || '',
        headteacher: localStorage.getItem('userName') || '' // 从本地存储获取当前班主任姓名
      }))

      // 验证必填字段
      const invalidData = formattedData.some(item => 
        !item.studentNo || !item.name || !item.sex || 
        !item.classe || !item.phone || !item.status || 
        !item.enrollmentDate
      )

      if (invalidData) {
        ElMessage.error('Excel中存在必填字段为空的数据，请检查')
        return
      }

      // 发送请求
      try {
        const response = await fetch('/api/sys-student/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          },
          body: JSON.stringify(formattedData)
        })

        if (response.ok) {
          ElMessage.success('导入成功')
          getStudentList() // 刷新列表
        } else {
          ElMessage.error('导入失败')
        }
      } catch (error) {
        console.error('导入失败:', error)
        ElMessage.error('导入失败')
      }
    }
    reader.readAsArrayBuffer(file.raw)
  } catch (error) {
    console.error('文件读取失败:', error)
    ElMessage.error('文件读取失败')
  }
}

// 删除相关
const deleteDialogVisible = ref(false)
const currentDeleteId = ref(null)

// 删除按钮点击事件
const handleDelete = (row) => {
  currentDeleteId.value = row.studentId
  deleteDialogVisible.value = true
}

// 关闭删除对话框
const handleDeleteClose = () => {
  deleteDialogVisible.value = false
  currentDeleteId.value = null
}

// 确认删除
const confirmDelete = async () => {
  if (!currentDeleteId.value) return
  
  try {
    const response = await fetch(`/api/sys-student/delete/${currentDeleteId.value}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })

    if (response.ok) {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      deleteDialogVisible.value = false
      await getStudentList() // 刷新列表
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    ElMessage({
      type: 'error',
      message: '删除失败'
    })
  }
}

// 监护人相关
const guardianDialogVisible = ref(false)
const guardianList = ref([])

// 监护人表单相关
const guardianFormVisible = ref(false)
const guardianFormRef = ref(null)
const currentStudentId = ref(null)
const currentStudentName = ref('')

const guardianForm = ref({
  studentId: '',
  name: '',
  relationship: '',
  phone: '',
  wechat: '',
  occupation: '',
  workUnit: '',
  address: '',
  createBy: '',
  studentName: ''
})

// 监护人表单验证规则
const guardianRules = {
  name: [
    { required: true, message: '请输入监护人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  relationship: [
    { required: true, message: '请选择与学生关系', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 添加表单类型标识
const guardianFormType = ref('add') // 'add' 或 'edit'

// 修改打开新增监护人表单方法
const handleAddGuardian = () => {
  guardianFormType.value = 'add'
  guardianForm.value = {
    studentId: currentStudentId.value,
    name: '',
    relationship: '',
    phone: '',
    wechat: '',
    occupation: '',
    workUnit: '',
    address: '',
    createBy: localStorage.getItem('userId') || '',
    studentName: currentStudentName.value
  }
  guardianFormVisible.value = true
}

// 添加编辑监护人方法
const handleEditGuardian = (guardian) => {
  guardianFormType.value = 'edit'
  guardianForm.value = {
    ...guardian,
    studentId: currentStudentId.value,
    studentName: currentStudentName.value
  }
  guardianFormVisible.value = true
}

// 修改提交监护人表单方法
const submitGuardianForm = async () => {
  if (!guardianFormRef.value) return

  await guardianFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const url = guardianFormType.value === 'add' 
          ? '/api/sys-student-guardian/add'
          : '/api/sys-student-guardian/update'
        
        const response = await fetch(url, {
          method: guardianFormType.value === 'add' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
          },
          body: JSON.stringify(guardianForm.value)
        })

        if (response.ok) {
          const result = await response.json()
          if (result.code === 200) {
            ElMessage.success(guardianFormType.value === 'add' ? '添加成功' : '更新成功')
            guardianFormVisible.value = false
            // 刷新监护人列表
            handleViewGuardians({ studentId: currentStudentId.value })
          } else {
            throw new Error(result.message || (guardianFormType.value === 'add' ? '添加失败' : '更新失败'))
          }
        } else {
          throw new Error(guardianFormType.value === 'add' ? '添加失败' : '更新失败')
        }
      } catch (error) {
        console.error(guardianFormType.value === 'add' ? '添加监护人失败:' : '更新监护人失败:', error)
        ElMessage.error(guardianFormType.value === 'add' ? '添加监护人失败' : '更新监护人失败')
      }
    }
  })
}

// 修改关闭表单方法
const handleGuardianFormClose = () => {
  guardianFormVisible.value = false
  guardianFormRef.value?.resetFields()
  guardianFormType.value = 'add' // 重置表单类型
}

// 监听对话框关闭
watch(guardianFormVisible, (newVal) => {
  if (!newVal) {
    guardianFormRef.value?.resetFields()
    guardianFormType.value = 'add' // 重置表单类型
  }
})

// 修改查看监护人方法
const handleViewGuardians = async (row) => {
  currentStudentId.value = row.studentId
  currentStudentName.value = row.name
  try {
    const response = await fetch(`/api/sys-student-guardian/list-by-student-id?studentId=${row.studentId}`, {
      method: 'GET',
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })

    if (response.ok) {
      const result = await response.json()
      if (result.code === 200) {
        guardianList.value = result.data
        guardianDialogVisible.value = true
      } else {
        throw new Error(result.message || '获取监护人信息失败')
      }
    } else {
      throw new Error('获取监护人信息失败')
    }
  } catch (error) {
    console.error('获取监护人信息失败:', error)
    ElMessage({
      type: 'error',
      message: '获取监护人信息失败'
    })
  }
}

// 监听对话框关闭
watch(guardianDialogVisible, (newVal) => {
  if (!newVal) {
    guardianList.value = [] // 清空监护人列表
  }
})

// 删除相关
const deleteGuardianDialogVisible = ref(false)
const currentDeleteGuardian = ref(null)

// 处理删除按钮点击
const handleDeleteGuardian = (guardian) => {
  currentDeleteGuardian.value = guardian
  deleteGuardianDialogVisible.value = true
}

// 确认删除
const confirmDeleteGuardian = async () => {
  if (!currentDeleteGuardian.value) return

  try {
    const response = await fetch(`/api/sys-student-guardian/delete/${currentDeleteGuardian.value.guardianId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    })

    if (response.ok) {
      const result = await response.json()
      if (result.code === 200) {
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
        // 刷新监护人列表
        handleViewGuardians({ studentId: currentStudentId.value })
      } else {
        throw new Error(result.message || '删除失败')
      }
    } else {
      throw new Error('删除失败')
    }
  } catch (error) {
    console.error('删除监护人失败:', error)
    ElMessage({
      type: 'error',
      message: '删除监护人失败'
    })
  } finally {
    deleteGuardianDialogVisible.value = false
    currentDeleteGuardian.value = null
  }
}

// 监听删除对话框关闭
watch(deleteGuardianDialogVisible, (newVal) => {
  if (!newVal) {
    currentDeleteGuardian.value = null
  }
})

// 修改样式
const getActionButtonStyle = (type) => {
  return {
    marginLeft: type === 'edit' ? '0' : '8px',
    color: type === 'delete' ? '#F56C6C' : '#409EFF'
  }
}

onMounted(() => {
  getStudentList()
})
</script>

<style scoped>
.students-container {
  padding: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-tag {
  margin-right: 5px;
}

.upload-inline {
  display: inline-block;
  margin-right: 10px;
}

.search-area .el-form-item {
  margin-bottom: 0;
}

.student-form {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 20px;
}

.dialog-footer {
  padding: 20px 0;
}

.el-form-item {
  margin-bottom: 20px;
}

.guardian-info {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 20px;
}

.guardian-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.guardian-item:last-child {
  margin-bottom: 0;
}

/* 自定义描述列表样式 */
:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #409EFF;
}

:deep(.el-descriptions__label) {
  width: 120px;
  color: #606266;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

/* 空状态样式 */
:deep(.el-empty) {
  padding: 40px 0;
}

.guardian-header {
  margin-bottom: 20px;
  padding: 0 20px;
}

.guardian-form {
  padding: 20px;
}

/* 添加描述列表额外操作按钮样式 */
:deep(.el-descriptions__header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-descriptions__title) {
  margin-right: 16px;
}

/* 添加操作按钮样式 */
:deep(.el-descriptions__header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-descriptions__title) {
  margin-right: 16px;
}

.dialog-footer {
  text-align: right;
}

/* 删除按钮样式 */
:deep(.el-button--danger.is-link:hover) {
  color: #ff4d4f;
}

:deep(.el-button--danger.is-link:focus) {
  color: #ff4d4f;
}

/* 操作按钮间距 */
:deep(.el-descriptions__extra .el-button) {
  margin-left: 8px;
}

:deep(.el-descriptions__extra .el-button:first-child) {
  margin-left: 0;
}
</style> 