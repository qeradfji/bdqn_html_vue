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

// 新增班级
export const addClass = (data) => {
  return request({
    url: '/sys-class',
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
export const deleteClass = (id) => {
  return request({
    url: `/sys-class/${id}`,
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