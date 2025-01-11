import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.PROD ? 'http://localhost:8080' : '/api',
  timeout: 5000
})

service.interceptors.request.use(
  config => {
    console.log('请求URL:', config.url)
    console.log('请求参数:', config.params || config.data)
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => response.data,
  error => {
    console.error('接口错误:', error)
    ElMessage.error(error.response?.data?.message || '请求失败')
    return Promise.reject(error)
  }
)

export default service 