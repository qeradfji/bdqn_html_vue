import request from './config'

// 登录接口
export function login(data) {
  return request({
    url: '/sys-user/login',
    method: 'post',
    data
  })
} 