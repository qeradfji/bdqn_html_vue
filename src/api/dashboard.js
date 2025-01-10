import request from './config'

// 获取教师的统计数据
export function getTeacherStats(teacherName) {
  return request({
    url: '/sys-student/stats',
    method: 'get',
    params: {
      headteacher: teacherName
    }
  })
}

// 获取违纪类型统计
export function getDisciplineTypeStats(teacherName) {
  return request({
    url: '/sys-student-disciplinary/type-stats',
    method: 'get',
    params: {
      headteacher: teacherName
    }
  })
}

// 获取教师的学生总数
export function getStudentCount() {
  const teacherName = localStorage.getItem('teacherName')
  return request({
    url: '/sys-student/count-by-headteacher',
    method: 'get',
    params: {
      headteacher: teacherName
    }
  })
}

// 获取违纪总数
export function getDisciplineCount() {
  const teacherName = localStorage.getItem('teacherName')
  return request({
    url: '/sys-student-disciplinary/type-count-by-processor',
    method: 'get',
    params: {
      processor: teacherName
    }
  })
} 