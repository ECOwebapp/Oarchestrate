import { createRouter, createWebHistory } from 'vue-router'
import Tasks from '@/views/Tasks.vue'
import Dashboard from '@/views/Dashboard.vue'
import Design from '@/views/Design.vue'
import Organization from '@/views/Organization.vue'
import Analytics from '@/views/Analytics.vue'
import Profile from '@/views/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      component: Dashboard,
    },
    {
      path: '/tasks',
      component: Tasks,
    },
    {
      path: '/design',
      component: Design,
    },
    {
      path: '/organisation',
      component: Organization,
    },
    {
      path: '/analytics',
      component: Analytics,
    },
    {
      path: '/profile',
      component: Profile,
    },
  ],
})

export default router
