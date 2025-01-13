import request from './config'

// 分页查询违纪记录
export function getDisciplineList(params) {
  console.log('API请求参数:', params)
  return request({
    url: '/sys-student-disciplinary/page',
    method: 'get',
    params
  }).then(res => {
    console.log('API响应数据:', res)
    return res
  })
}

// 添加违纪记录
export function addDiscipline(data) {
  return request({
    url: '/sys-student-disciplinary/add',
    method: 'post',
    data: {
      name: data.name,                                    // 学生姓名
      timeOfInfraction: data.timeOfInfraction,           // 违纪时间
      descriptionOfTheIndiscipline: data.descriptionOfTheIndiscipline,  // 违纪描述
      processing: data.processing,                       // 处理方式
      processingStatus: data.processingStatus || 1,      // 处理状态
      classe: data.classe,                              // 班级
      headteacher: data.headteacher,                    // 班主任
      processors: data.processors,                      // 处理人
      remarks: data.remarks,                           // 备注
      processingTime: data.processingTime,             // 处理时间
      type: data.type                                  // 违纪类型
    }
  })
}

// 修改违纪记录
export function updateDiscipline(data) {
  return request({
    url: '/sys-student-disciplinary/update',
    method: 'put',
    data
  })
}

// 删除违纪记录
export function deleteDiscipline(id) {
  return request({
    url: `/sys-student-disciplinary/delete/${id}`,
    method: 'delete'
  })
}

// 使用示例：
/*
const disciplineForm = {
  name: "张三",
  timeOfInfraction: "2023-10-01",
  descriptionOfTheIndiscipline: "在教室里大声喧哗，影响其他同学学习。",
  processing: "警告并要求写检讨书",
  processingStatus: 1,
  classe: "高三一班",
  headteacher: "李老师",
  processors: "王主任",
  remarks: "该学生平时表现良好，此次为初次违规。",
  processingTime: "2023-10-02",
  type: "课堂纪律"
}

try {
  const res = await addDiscipline(disciplineForm)
  if (res.code === 200) {
    ElMessage.success('添加成功')
  }
} catch (error) {
  ElMessage.error('添加失败')
}
*/ 