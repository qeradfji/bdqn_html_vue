import ExcelJS from 'exceljs'

/**
 * 导出Excel文件
 * @param {Object} options 导出选项
 * @param {string} options.title 表格标题
 * @param {Array} options.headers 表头配置
 * @param {Array} options.data 数据
 * @param {string} options.filename 文件名
 */
export const exportExcel = async ({ title, headers, data, filename }) => {
  // 添加时间戳到文件名
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_')
  const filenameWithTimestamp = filename.replace('.xlsx', '') + '_' + timestamp + '.xlsx'

  // 创建工作簿
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  // 设置列
  worksheet.columns = headers.map(h => ({
    header: h.header,
    key: h.key,
    width: h.width
  }))

  // 添加标题行
  worksheet.insertRow(1, [title])
  worksheet.mergeCells(1, 1, 1, headers.length)

  // 设置标题样式
  const titleRow = worksheet.getRow(1)
  titleRow.height = 30
  titleRow.font = {
    name: '宋体',
    size: 16,
    bold: true
  }
  titleRow.alignment = {
    vertical: 'middle',
    horizontal: 'center'
  }

  // 设置表头样式
  const headerRow = worksheet.getRow(2)
  headerRow.height = 25
  headerRow.font = {
    name: '宋体',
    size: 12,
    bold: true
  }
  headerRow.alignment = {
    vertical: 'middle',
    horizontal: 'center'
  }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }

  // 添加数据
  worksheet.addRows(data)

  // 设置数据行样式
  for (let i = 3; i <= worksheet.rowCount; i++) {
    const row = worksheet.getRow(i)
    row.height = 20
    row.font = {
      name: '宋体',
      size: 11
    }
    row.alignment = {
      vertical: 'middle',
      horizontal: 'center'
    }
  }

  // 设置所有单元格边框
  for (let i = 1; i <= worksheet.rowCount; i++) {
    for (let j = 1; j <= worksheet.columnCount; j++) {
      const cell = worksheet.getCell(i, j)
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    }
  }

  // 生成文件并下载
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filenameWithTimestamp
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
} 