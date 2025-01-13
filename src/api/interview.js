import request from './config'

// 获取访谈列表
export function getInterviewList(params) {
  const userId = localStorage.getItem('userId')
  return request({
    url: '/sys-interview/list-by-student-name-and-teacher-id',
    method: 'get',
    params: {
      teacherId: userId,
      studentName: params.name || '',
      current: params.pageNum || 1,
      size: params.pageSize || 10
    }
  })
}

// 添加访谈记录
export const addInterview = (data) => {
  // 获取当前登录用户ID
  const teacherInfo = JSON.parse(localStorage.getItem('teacherInfo') || '{}')
  const userId = teacherInfo.id

  return request({
    url: '/sys-interview/add',
    method: 'post',
    data: {
      studentId: data.studentId,                // 学生ID
      classId: data.classId,                   // 班级ID
      teacherId: data.teacherId,               // 使用传入的教师ID，而不是当前用户ID
      interviewDate: data.interviewDate,       // 访谈日期
      interviewType: data.interviewType,       // 访谈类型(1:学员,2:监护人)
      content: data.content,                   // 访谈内容
      feedback: data.feedback,                 // 反馈建议
      status: data.status || 1,                // 状态(1:正常,2:需要关注)
      createBy: userId,                        // 创建人使用当前用户ID
      updateBy: userId                         // 更新人使用当前用户ID
    }
  })
}

// 更新访谈记录
export function updateInterview(data) {
  return request({
    url: '/sys-interview/update',
    method: 'put',
    data: {
      ...data,
      updateTime: new Date().toISOString()
    }
  })
}

// 删除访谈记录
export function deleteInterview(id) {
  return request({
    url: `/sys-interview/delete/${id}`,
    method: 'delete'
  })
}

// 获取学生列表（用于下拉选择）
export const getStudentOptions = () => {
  // 使用 layout/index.vue 中存储的 teacherName
  const teacherName = localStorage.getItem('teacherName')
  
  return request({
    url: '/sys-student/list-by-headteacher',  // 使用相同的 URL
    method: 'get',
    params: {
      currentPage: 1,
      pageSize: 9999,  // 获取所有数据
      name: '',
      classe: '',
      headteacher: teacherName,  // 使用相同的教师姓名
      includeHeadteacher: true
    }
  })
}

// 获取班级列表（用于下拉选择）
export const getClassOptions = () => {
  return request({
    url: '/sys-class/page-by-name',
    method: 'get',
    params: {
      current: 1,
      size: 9999,  // 获取所有数据
      name: ''     // 空字符串获取所有班级
    }
  })
}

// 获取教师列表（用于下拉选择）
export const getTeacherOptions = () => {
  return request({
    url: '/sys-user/page-by-real-name',
    method: 'get',
    params: {
      current: 1,
      size: 9999,  // 获取所有数据
      realName: ''  // 空字符串获取所有教师
    }
  })
} 