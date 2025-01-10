import request from './config'

// 获取访谈记录列表（分页）
export function getInterviewList(params) {
  const teacherId = localStorage.getItem('userId')
  return request({
    url: '/sys-interview/list-by-student-name-and-teacher-id',
    method: 'get',
    params: {
      studentName: params.name || undefined,
      teacherId: Number(teacherId),
      current: params.pageNum,
      size: params.pageSize
    }
  })
}

// 获取未访谈的学生列表
export function getStudentsWithoutInterview(params) {
  const userId = localStorage.getItem('userId')
  
  return request({
    url: '/sys-interview/students-without-interview',
    method: 'get',
    params: {
      studentName: params.name || '',
      classId: params.classId || '',
      userId: userId
    }
  })
}

// 添加访谈记录
export function addInterview(data) {
  const userId = localStorage.getItem('userId')
  return request({
    url: '/sys-interview/add',
    method: 'post',
    data: {
      ...data,
      teacherId: Number(userId)
    }
  })
}

// 更新访谈记录
export function updateInterview(data) {
  const userId = localStorage.getItem('userId')
  console.log('更新访谈的教师ID:', userId)

  if (!userId) {
    console.error('未找到教师ID')
    return Promise.reject('未找到教师ID')
  }

  return request({
    url: '/sys-interview/update',
    method: 'put',
    data: {
      ...data,
      teacherId: Number(userId)
    }
  })
}

// 删除访谈记录
export function deleteInterview(interviewId) {
  return request({
    url: `/sys-interview/delete/${interviewId}`,
    method: 'delete'
  })
}

// 获取违规类型统计
export function getDisciplineTypeStats() {
  const teacherName = localStorage.getItem('teacherName')
  if (!teacherName) {
    throw new Error('未找到教师信息')
  }

  return request({
    url: '/sys-student-disciplinary/type-stats',
    method: 'get',
    params: {
      processor: teacherName
    }
  })
} 