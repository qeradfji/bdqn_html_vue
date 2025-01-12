<template>
  <div class="students-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="filterForm" ref="filterFormRef">
        <!-- 现有的搜索表单内容 -->
        
        <!-- 添加导出按钮 -->
        <el-form-item>
          <el-button type="success" @click="handleExport">
            <el-icon><Download /></el-icon>导出Excel
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 其他现有内容 -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import request from '@/utils/request'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()

// Excel导出
const handleExport = async () => {
  try {
    const res = await getStudentList({
      currentPage: 1,
      pageSize: 999999
    })

    if (res.code === 200 && res.data.records) {
      // 创建工作簿和工作表
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('学生信息')

      // 设置列
      worksheet.columns = [
        { header: '学号', key: 'studentNo', width: 15 },
        { header: '姓名', key: 'name', width: 12 },
        { header: '手机号', key: 'phone', width: 15 },
        { header: '班级', key: 'classe', width: 15 },
        { header: '状态', key: 'status', width: 10 }
      ]

      // 插入标题行
      worksheet.insertRow(1, ['北大青鸟教务系统 - 学生信息表'])
      worksheet.mergeCells('A1:E1')

      // 设置标题样式
      const titleRow = worksheet.getRow(1)
      titleRow.height = 40
      const titleCell = titleRow.getCell(1)
      titleCell.font = {
        name: '宋体',
        size: 16,
        bold: true,
        color: { argb: 'FFFFFFFF' }
      }
      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4B90FF' }
      }
      titleCell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }

      // 设置表头样式
      const headerRow = worksheet.getRow(2)
      headerRow.height = 30
      headerRow.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }
      }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF66B1FF' }
      }
      headerRow.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }

      // 添加数据
      const rows = res.data.records.map(item => ({
        studentNo: item.studentNo,
        name: item.name,
        phone: item.phone,
        classe: item.classe,
        status: item.status === 1 ? '在读' : '离校'
      }))
      worksheet.addRows(rows)

      // 设置数据行样式
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 2) { // 跳过标题行和表头行
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

      // 生成时间戳
      const timestamp = new Date().toLocaleString().replace(/[/:]/g, '').replace(/\s/g, '_')
      const fileName = `北大青鸟教务系统_学生信息表_${timestamp}.xlsx`

      // 导出文件
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

// ... 其他代码保持不变 ...
</script>

<style scoped>
/* 现有样式保持不变 */
</style> 