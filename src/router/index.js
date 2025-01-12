import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

export const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  // 管理员路由
  {
    path: '/admin',
    component: () => import('@/layout/admin/index.vue'),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue')
      },
      {
        path: 'students',
        name: 'AdminStudents',
        component: () => import('@/views/admin/Students.vue')
      },
      {
        path: 'teachers',
        name: 'AdminTeachers',
        component: () => import('@/views/admin/Teachers.vue')
      },
      {
        path: 'classes',
        name: 'AdminClasses',
        component: () => import('../views/admin/Classes.vue')
      },
      {
        path: 'disciplinary',
        name: 'AdminDisciplinary',
        component: () => import('@/views/admin/Disciplinary.vue')
      },
      {
        path: 'interview',
        name: 'AdminInterview',
        component: () => import('@/views/admin/Interview.vue')
      },
      {
        path: 'department',
        name: 'AdminDepartment',
        component: () => import('@/views/admin/Department.vue')
      },
      // 添加家长管理路由
      {
        path: 'guardian',
        name: 'AdminGuardian',
        component: () => import('@/views/admin/Guardian.vue')
      }
    ]
  },
  // 普通教师路由
  {
    path: '/main',
    name: 'Main',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('@/views/Students.vue')
      },
      {
        path: 'discipline',
        name: 'Discipline',
        component: () => import('@/views/Discipline.vue')
      },
      {
        path: 'interviews',
        name: 'Interviews',
        component: () => import('@/views/Interviews.vue')
      }
    ]
  },
  // 教师管理路由
  {
    path: '/discipline',
    component: Layout,
    name: 'TeacherManage',
    meta: {
      title: '教师管理',
      icon: 'User'
    },
    children: [
      {
        path: 'students',
        name: 'DisciplineStudents',
        component: () => import('@/views/Students.vue'),
        meta: {
          title: '学生管理',
          icon: 'User'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 添加导航守卫用于调试
router.beforeEach((to, from, next) => {
  console.log('Navigation to:', to.path)
  next()
})

export default router 