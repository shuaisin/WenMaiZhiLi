import { createRouter, createWebHistory } from 'vue-router'
import Auth from '../views/Auth.vue'
import LiteratureTimeline from '../views/LiteratureTimeline.vue'

const routes = [
  {
    path: '/',
    redirect: '/auth'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: Auth
  },
  {
    path: '/timeline',
    name: 'LiteratureTimeline',
    component: LiteratureTimeline,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  
  if (to.meta.requiresAuth && !token) {
    next('/auth')
  } else {
    next()
  }
})

export default router
