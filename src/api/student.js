import request from './config'

// 获取学生列表
export function getStudentList(params) {
  return request({
    url: '/sys-student/list',
    method: 'get',
    params
  })
}

// 添加学生
export function addStudent(data) {
  return request({
    url: '/sys-student/add',
    method: 'post',
    data
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

// 根据班主任ID获取学生列表
export function getStudentListByHeadteacher() {
  const teacherName = localStorage.getItem('teacherName')
  return request({
    url: '/sys-student/list-by-headteacher',
    method: 'get',
    params: {
      headteacher: teacherName,
      current: 1,
      size: 999999
    }
  })
}

// 批量导入学生
export function importStudents(data) {
  return request({
    url: '/sys-student/import',
    method: 'post',
    data
  })
} 