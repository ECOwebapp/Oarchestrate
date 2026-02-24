import Analytics from '@/views/Analytics.vue'
import Dashboard from '@/views/Dashboard.vue'
import Design from '@/views/Design.vue'
import HeroLanding from '@/views/HeroLanding.vue'
import Organization from '@/views/Organization.vue'
import Profile from '@/views/Profile.vue'
import Tasks from '@/views/Tasks.vue'
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
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/tasks',
      name: 'Tasks',
      component: Tasks,
    },
    {
      path: '/design',
      name: 'Design',
      component: Design,
    },
    {
      path: '/organization',
      name: 'Organization',
      component: Organization,
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: Analytics,
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
    },
    {
      path: '/logout',
      redirect: '/login',
    },
  ],
})

export default router
