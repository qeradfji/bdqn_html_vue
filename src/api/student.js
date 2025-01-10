import request from './config'

// 获取学生列表
export function getStudentList(params) {
  const teacherId = localStorage.getItem('teacherId')
  return request({
    url: '/sys-student/list',
    method: 'get',
    params: {
      ...params,
      teacherId: teacherId
    }
  })
}

// 添加学生
export function addStudent(data) {
  const teacherName = localStorage.getItem('teacherName')
  return request({
    url: '/sys-student/add',
    method: 'post',
    data: {
      ...data,
      headteacher: teacherName
    }
  })
}

// 更新学生信息
export function updateStudent(data) {
  const teacherName = localStorage.getItem('teacherName')
  return request({
    url: '/sys-student/update',
    method: 'put',
    data: {
      ...data,
      headteacher: teacherName
    }
  })
}

// 删除学生
export function deleteStudent(studentId) {
  return request({
    url: `/sys-student/delete/${studentId}`,
    method: 'delete'
  })
}

// 根据班主任查询学生列表
export function getStudentListByHeadteacher(params) {
  return request({
    url: '/sys-student/list-by-headteacher',
    method: 'get',
    params
  })
} 