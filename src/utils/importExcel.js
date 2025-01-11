import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// 解析Excel文件
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const results = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        // 跳过表头，处理数据
        const students = results.slice(1).map(row => ({
          studentNo: row[0],
          name: row[1],
          classe: row[2],
          phone: row[3],
          enrollmentDate: row[4],
          age: row[5],
          idCard: row[6],
          nation: row[7],
          nativePlace: row[8],
          politicalStatus: row[9],
          address: row[10],
          wechat: row[11],
          qq: row[12]
        }))
        
        resolve(students)
      } catch (error) {
        reject(new Error('Excel解析失败'))
      }
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsArrayBuffer(file)
  })
}

// 生成示例Excel
export function generateExampleExcel() {
  // 创建工作簿
  const wb = XLSX.utils.book_new()
  
  // 表头
  const headers = [
    '学号',
    '姓名',
    '班级',
    '手机号',
    '入学时间',
    '年龄',
    '身份证号',
    '民族',
    '籍贯',
    '政治面貌',
    '家庭住址',
    '微信号',
    'QQ号'
  ]
  
  // 示例数据
  const exampleData = [
    [
      '20240001', 
      '张三', 
      'Web2401班', 
      '13800138001', 
      '2024-01-01',
      '18', 
      '110101200001011234', 
      '汉族', 
      '北京', 
      '群众', 
      '北京市海淀区', 
      'wx123', 
      '123456'
    ],
    [
      '20240002', 
      '李四', 
      'Web2401班', 
      '13800138002', 
      '2024-01-02',
      '19', 
      '110101200001021234', 
      '汉族', 
      '上海', 
      '群众', 
      '上海市浦东新区', 
      'wx456', 
      '234567'
    ]
  ]
  
  // 合并数据
  const wsData = [headers, ...exampleData]
  
  // 创建工作表
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  
  // 设置列宽
  const colWidths = [
    { wch: 12 }, // 学号
    { wch: 10 }, // 姓名
    { wch: 15 }, // 班级
    { wch: 15 }, // 手机号
    { wch: 15 }, // 入学时间
    { wch: 8 },  // 年龄
    { wch: 20 }, // 身份证号
    { wch: 10 }, // 民族
    { wch: 15 }, // 籍贯
    { wch: 12 }, // 政治面貌
    { wch: 30 }, // 家庭住址
    { wch: 15 }, // 微信号
    { wch: 15 }  // QQ号
  ]
  
  ws['!cols'] = colWidths
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '学生信息导入模板')
  
  // 生成Excel文件并下载
  XLSX.writeFile(wb, '学生信息导入模板.xlsx')
} 