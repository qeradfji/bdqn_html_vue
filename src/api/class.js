import request from './config'

// 根据ID获取班级信息
export function getClassById(classId) {
  return request({
    url: `/sys-class/get-by-id/${classId}`,
    method: 'get'
  })
} 