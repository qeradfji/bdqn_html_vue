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
export function addInterview(data) {
  const teacherId = localStorage.getItem('userId')
  return request({
    url: '/sys-interview/add',
    method: 'post',
    data: {
      ...data,
      teacherId,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      status: data.status || 1,
      deleted: 0
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