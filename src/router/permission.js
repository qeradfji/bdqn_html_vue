import router from './index'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

router.beforeEach((to, from, next) => {
  NProgress.start()
  console.log('当前路由:', to.path)
  console.log('登录状态:', localStorage.getItem('role'))

  // 白名单
  const whiteList = ['/login']
  
  // 获取登录状态
  const isLoggedIn = localStorage.getItem('role')

  if (whiteList.includes(to.path)) {
    // 访问登录页
    if (isLoggedIn) {
      const role = localStorage.getItem('role')
      next(role === 'admin' ? '/admin/dashboard' : '/dashboard')
    } else {
      next()
    }
  } else {
    // 访问其他页面
    if (!isLoggedIn) {
      next('/login')
      ElMessage.warning('请先登录')
    } else {
      const role = localStorage.getItem('role')
      if (to.path.startsWith('/admin') && role !== 'admin') {
        next('/dashboard')
        ElMessage.error('无权访问')
      } else {
        next()
      }
    }
  }
  
  NProgress.done()
})

router.afterEach(() => {
  NProgress.done()
})

export default router 