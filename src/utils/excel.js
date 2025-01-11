import * as XLSX from 'xlsx'
import * as XLSXStyle from 'xlsx-style'

/**
 * 导出Excel文件
 * @param {Object} options 导出选项
 * @param {string} options.title 表格标题
 * @param {Array} options.headers 表头配置
 * @param {Array} options.data 数据
 * @param {string} options.filename 文件名
 */
export const exportExcel = ({ title, headers, data, filename }) => {
  // 添加时间戳到文件名
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_')
  const filenameWithTimestamp = filename.replace('.xlsx', '') + '_' + timestamp + '.xlsx'

  // 创建工作簿
  const workbook = XLSX.utils.book_new()

  // 转换数据为二维数组格式
  const excelData = [
    [title], // 标题行
    headers.map(h => h.header), // 表头行
    ...data.map(item => headers.map(h => item[h.key])) // 数据行
  ]

  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(excelData)

  // 合并标题单元格
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
  ]

  // 设置列宽
  worksheet['!cols'] = headers.map(h => ({ wch: h.width }))

  // 设置样式
  const titleStyle = {
    font: { 
      name: '宋体', 
      sz: 16, 
      bold: true,
      color: { rgb: "000000" }
    },
    alignment: { 
      horizontal: 'center', 
      vertical: 'center' 
    },
    fill: {
      fgColor: { rgb: "FFFFFF" }
    }
  }

  const headerStyle = {
    font: { 
      name: '宋体', 
      sz: 12, 
      bold: true,
      color: { rgb: "000000" }
    },
    alignment: { 
      horizontal: 'center', 
      vertical: 'center' 
    },
    fill: {
      fgColor: { rgb: "E0E0E0" }
    },
    border: {
      top: { style: 'thin', color: { rgb: "000000" } },
      bottom: { style: 'thin', color: { rgb: "000000" } },
      left: { style: 'thin', color: { rgb: "000000" } },
      right: { style: 'thin', color: { rgb: "000000" } }
    }
  }

  const dataStyle = {
    font: { 
      name: '宋体', 
      sz: 11,
      color: { rgb: "000000" }
    },
    alignment: { 
      horizontal: 'center', 
      vertical: 'center' 
    },
    border: {
      top: { style: 'thin', color: { rgb: "000000" } },
      bottom: { style: 'thin', color: { rgb: "000000" } },
      left: { style: 'thin', color: { rgb: "000000" } },
      right: { style: 'thin', color: { rgb: "000000" } }
    }
  }

  // 应用样式到每个单元格
  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i]
    for (let j = 0; j < row.length; j++) {
      const cellRef = XLSX.utils.encode_cell({ r: i, c: j })
      if (!worksheet[cellRef]) {
        worksheet[cellRef] = { v: '' }
      }
      
      if (i === 0) {
        worksheet[cellRef].s = titleStyle
      } else if (i === 1) {
        worksheet[cellRef].s = headerStyle
      } else {
        worksheet[cellRef].s = dataStyle
      }
    }
  }

  // 设置行高
  worksheet['!rows'] = [
    { hpt: 30 }, // 标题行高
    { hpt: 25 }, // 表头行高
    ...Array(data.length).fill({ hpt: 20 }) // 数据行高
  ]

  // 将工作表添加到工作簿
  workbook.Sheets['Sheet1'] = worksheet
  workbook.SheetNames.push('Sheet1')

  // 使用 xlsx-style 导出
  const wbout = XLSXStyle.write(workbook, {
    bookType: 'xlsx',
    bookSST: false,
    type: 'binary'
  })

  // 转换为 Blob 并下载
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filenameWithTimestamp
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 字符串转 ArrayBuffer
function s2ab(s) {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xFF
  }
  return buf
} 