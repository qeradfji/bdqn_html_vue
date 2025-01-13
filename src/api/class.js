import request from '@/utils/request'

// 获取班级信息
export const getClassById = (id) => {
  return request({
    url: `/sys-class/${id}`,
    method: 'get'
  })
}

// 分页查询班级列表
export const getClassList = (params) => {
  return request({
    url: '/sys-class/page-by-name',
    method: 'get',
    params: {
      current: params.currentPage,
      size: params.pageSize,
      name: params.name
    }
  })
}

// 添加班级
export const createClass = (data) => {
  return request({
    url: '/sys-class/add',
    method: 'post',
    data
  })
}

// 更新班级
export const updateClass = (data) => {
  return request({
    url: '/sys-class/update',
    method: 'put',
    data
  })
}

// 删除班级
export const deleteClass = (classId) => {
  return request({
    url: `/sys-class/delete/${classId}`,
    method: 'delete'
  })
}

// 获取班级详情
export const getClassDetail = (id) => {
  return request({
    url: `/sys-class/detail/${id}`,
    method: 'get'
  })
} 