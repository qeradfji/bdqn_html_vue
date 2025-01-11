import request from '@/utils/request'

// 分页查询教师列表
export const getTeacherList = (params) => {
  return request({
    url: '/sys-user/page-by-real-name',
    method: 'get',
    params: {
      current: params.currentPage,
      size: params.pageSize,
      realName: params.name
    }
  })
}

// 新增教师
export const addTeacher = (data) => {
  return request({
    url: '/sys-user/add',
    method: 'post',
    data
  })
}

// 更新教师
export const updateTeacher = (data) => {
  return request({
    url: '/sys-user',
    method: 'put',
    data
  })
}

// 删除教师
export const deleteTeacher = (id) => {
  return request({
    url: `/sys-user/delete/${id}`,
    method: 'delete'
  })
}

// 根据ID获取教师信息
export const getTeacherById = (userId) => {
  return request({
    url: `/sys-user/get-by-id/${userId}`,
    method: 'get'
  })
}

// 查询所有教师（使用大页码实现）
export const getAllTeachers = () => {
  return request({
    url: '/sys-user/page-by-real-name',
    method: 'get',
    params: {
      current: 1,
      size: 9999,  // 使用较大的数值来获取所有数据
      realName: ''  // 空字符串查询所有
    }
  })
} 