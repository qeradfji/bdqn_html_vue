import { createRouter, createWebHistory } from 'vue-router'

const routes = [
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
      }
    ]
  },
  // 普通教师路由
  {
    path: '/main',
    component: () => import('@/layout/index.vue'),
    redirect: '/main/dashboard',
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 