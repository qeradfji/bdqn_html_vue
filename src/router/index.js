import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import Layout from '../layout/index.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/main',
    component: Layout,
    redirect: '/main/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue')
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('../views/Students.vue')
      },
      {
        path: 'discipline',
        name: 'Discipline',
        component: () => import('../views/Discipline.vue')
      },
      {
        path: 'interviews',
        name: 'Interviews',
        component: () => import('../views/Interviews.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 简化路由守卫
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', to.path)
  
  // 如果是访问登录页，直接放行
  if (to.path === '/login') {
    next()
    return
  }
  
  // 其他页面需要验证登录状态
  const teacherName = localStorage.getItem('teacherName')
  if (!teacherName) {
    ElMessage.warning('请先登录')
    next('/login')
  } else {
    next()
  }
})

export default router 