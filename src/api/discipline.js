import request from './config'

// 分页查询违纪记录
export function getDisciplineList(params) {
  console.log('API请求参数:', params) // 打印请求参数
  return request({
    url: '/sys-student-disciplinary/page',
    method: 'get',
    params
  }).then(res => {
    console.log('API响应数据:', res) // 打印响应数据
    return res
  })
}

// 添加违纪记录
export function addDiscipline(data) {
  return request({
    url: '/sys-student-disciplinary/add',
    method: 'post',
    data
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