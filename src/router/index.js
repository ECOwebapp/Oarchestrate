import Analytics from '@/views/Analytics.vue'
import Dashboard from '@/views/Dashboard.vue'
import Design from '@/views/Design.vue'
import HeroLanding from '@/views/HeroLanding.vue'
import Organization from '@/views/Organization.vue'
import Profile from '@/views/Profile.vue'
import Tasks from '@/views/Tasks.vue'
import Login from '@/views/Login.vue'

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/hero',
    },
    {
      path: '/hero',
      component: HeroLanding,
    },
    {
      path: '/login',
      component: Login,
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
