import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export async function exportStudentExcel(students) {
  // 创建工作簿
  const workbook = new ExcelJS.Workbook()
  
  // 创建工作表
  const worksheet = workbook.addWorksheet('学生信息表')

  // 定义列
  worksheet.columns = [
    { header: '学号', key: 'studentNo', width: 15 },
    { header: '姓名', key: 'name', width: 12 },
    { header: '班级', key: 'classe', width: 15 },
    { header: '状态', key: 'status', width: 10 },
    { header: '手机号', key: 'phone', width: 15 },
    { header: '入学时间', key: 'enrollmentDate', width: 15 },
    { header: '年龄', key: 'age', width: 8 },
    { header: '班主任', key: 'headteacher', width: 15 },
    { header: 'QQ号码', key: 'qq', width: 20 },
    { header: '微信号', key: 'wechat', width: 20 },
    { header: '身份证号', key: 'idCard', width: 20 },
    { header: '民族', key: 'nation', width: 15 },
    { header: '籍贯', key: 'nativePlace', width: 15 },
    { header: '政治面貌', key: 'politicalStatus', width: 15 },
    { header: '家庭住址', key: 'address', width: 30 }
  ]

  // 添加标题行
  worksheet.spliceRows(1, 0, Array(15).fill('北大青鸟教务系统 - 学生信息表'))
  
  // 合并标题单元格
  worksheet.mergeCells('A1:O1')
  
  // 设置标题样式
  const titleRow = worksheet.getRow(1)
  titleRow.height = 50
  titleRow.font = {
    name: '微软雅黑',
    size: 24,
    bold: true
  }
  titleRow.alignment = {
    vertical: 'middle',
    horizontal: 'center'
  }
  titleRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD7E6F3' }
  }

  // 设置表头样式（第3行）
  const headerRow = worksheet.getRow(3)
  headerRow.height = 30
  headerRow.font = {
    name: '微软雅黑',
    size: 14,
    bold: true,
    color: { argb: 'FFFFFFFF' }
  }
  headerRow.alignment = {
    vertical: 'middle',
    horizontal: 'center'
  }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  }

  // 转换状态码为文字
  const getStatusText = (status) => {
    const statusMap = {
      1: '在读',
      2: '休学',
      3: '退学',
      4: '毕业'
    }
    return statusMap[status] || '未知'
  }

  // 添加数据
  const data = students.map(student => ({
    studentNo: student.studentNo,
    name: student.name,
    classe: student.classe,
    status: getStatusText(student.status),
    phone: student.phone,
    enrollmentDate: student.enrollmentDate,
    age: student.age,
    headteacher: student.headteacher,
    qq: student.qq,
    wechat: student.wechat,
    idCard: student.idCard,
    nation: student.nation,
    nativePlace: student.nativePlace,
    politicalStatus: student.politicalStatus,
    address: student.address
  }))

  worksheet.addRows(data)

  // 设置所有数据单元格的样式
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 3) { // 跳过标题和表头
      row.height = 25
      row.font = {
        name: '微软雅黑',
        size: 12
      }
      row.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }
      
      // 隔行变色
      if (rowNumber % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F6FC' }
        }
      }
    }

    // 为每个单元格添加边框
    row.eachCell((cell) => {
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

  // 生成带时间戳的文件名
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/[\/\s:]/g, '')

  // 下载文件
  saveAs(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `北大青鸟学生信息表_${timestamp}.xlsx`
  )
} 