import request from '@/utils/request'

// 获取学生列表
export const getStudentList = (params) => {
  // 使用 layout/index.vue 中存储的 teacherName
  const teacherName = localStorage.getItem('teacherName')
  
  return request({
    url: '/sys-student/list-by-headteacher',
    method: 'get',
    params: {
      currentPage: params.currentPage,
      pageSize: params.pageSize,
      name: params.name,
      classe: params.classe,
      headteacher: teacherName,  // 使用 layout 中存储的教师姓名
      includeHeadteacher: true
    }
  })
}

// 添加学生
export const addStudent = (data) => {
  return request({
    url: '/sys-student/add',
    method: 'post',
    data
  })
}

// 更新学生
export const updateStudent = (data) => {
  return request({
    url: '/sys-student/update',
    method: 'put',
    data
  })
}

// 删除学生
export const deleteStudent = (id) => {
  return request({
    url: `/sys-student/delete/${id}`,
    method: 'delete'
  })
}

// 根据班主任查询学生列表
export const getStudentListByHeadteacher = (params = {}) => {
  // 使用 layout/index.vue 中存储的 teacherName
  const teacherName = localStorage.getItem('teacherName')
  
  return request({
    url: '/sys-student/list-by-headteacher',
    method: 'get',
    params: {
      currentPage: params.currentPage || 1,
      pageSize: params.pageSize || 9999,
      name: params.name || '',
      classe: params.classe || '',
      headteacher: teacherName,
      includeHeadteacher: true
    }
  })
}

// 获取所有学生人数
export const getAllStudentCount = () => {
  return request({
    url: '/sys-student/count-all',
    method: 'get'
  })
}

// 导出学生数据
export const exportStudents = () => {
  return request({
    url: '/student/export',
    method: 'get',
    responseType: 'blob'  // 重要：设置响应类型为 blob
  })
}

// 导入学生数据
export const importStudents = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/student/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
} 