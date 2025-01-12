import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api',  // 改回使用代理
  timeout: 15000,   // 增加超时时间
  withCredentials: true,  // 允许携带 cookie
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`  // 添加 Bearer 前缀
    }

    // 打印请求信息
    console.log('Request:', {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers,
      baseURL: config.baseURL
    })

    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 打印完整响应
    console.log('Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    })

    const res = response.data
    if (res.code === 200 || (res.records !== undefined && res.total !== undefined)) {
      return res
    }
    
    // 处理特定错误码
    if (res.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/login')
      return Promise.reject(new Error('登录已过期'))
    }
    
    console.error('API Error:', res)
    ElMessage.error(res.message || `请求失败 (${res.code})`)
    return Promise.reject(new Error(res.message || `请求失败 (${res.code})`))
  },
  error => {
    // 打印更详细的错误信息
    console.error('Network Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers
      }
    })

    if (error.response) {
      switch (error.response.status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('token')
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || `请求失败(${error.response.status})`)
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default service 