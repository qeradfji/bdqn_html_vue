import request from '../config'

// 获取学生列表（超级管理员）
export function getStudentList(params) {
  return request({
    url: '/sys-student/list-by-headteacher',
    method: 'get',
    params: {
      currentPage: params.pageNum || 1,
      pageSize: params.pageSize || 10
    }
  })
}

// 批量导入学生
export function importStudents(data) {
  return request({
    url: '/sys-student/import',
    method: 'post',
    data: data.map(student => ({
      ...student,
      status: 1,
      deleted: 0
    }))
  })
}

// 添加学生
export function addStudent(data) {
  return request({
    url: '/sys-student/add',
    method: 'post',
    data: {
      ...data,
      status: 1,
      deleted: 0
    }
  })
}

// 更新学生信息
export function updateStudent(data) {
  return request({
    url: '/sys-student/update',
    method: 'put',
    data
  })
}

// 删除学生
export function deleteStudent(id) {
  return request({
    url: `/sys-student/delete/${id}`,
    method: 'delete'
  })
}

// 导出学生列表
export function exportStudentList(params) {
  return request({
    url: '/sys-student/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
} 