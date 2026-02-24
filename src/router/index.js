import { createRouter, createWebHistory } from 'vue-router'
import Tasks from '@/views/Tasks.vue'
import Dashboard from '@/views/Dashboard.vue'
import Design from '@/views/Design.vue'
import Organization from '@/views/Organization.vue'
import Analytics from '@/views/Analytics.vue'
import Profile from '@/views/Profile.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: { hideNavbar: true }, // Mark this route
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
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
