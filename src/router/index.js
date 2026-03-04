import Analytics from '@/views/Analytics.vue'
import Dashboard from '@/views/Dashboard.vue'
import Design from '@/views/Design.vue'
import HeroLanding from '@/views/HeroLanding.vue'
import Login from '@/views/Login.vue'
import Organization from '@/views/Organization.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'
import Tasks from '@/views/Tasks.vue'

import { useAuthStore } from '@/stores/useAuthStore'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/hero',
  },

  // ── Guest-only ──
  {
    path: '/hero',
    name: 'Hero',
    component: HeroLanding,
    meta: { guestOnly: true, hideNavbar: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true, hideNavbar: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true, hideNavbar: true },
  },

  // ── Protected ──
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    meta: { requiresAuth: true },
  },
  {
    path: '/design',
    name: 'Design',
    component: Design,
    meta: { requiresAuth: true },
  },
  {
    path: '/organization',
    name: 'Organization',
    component: Organization,
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },

  // ── Fallback ──
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Login' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Wait for init() to finish if app just loaded
  if (!auth.initialized) await auth.init()

  const loggedIn = auth.isLoggedIn

  // 1. Logged-in users can't visit guest-only pages
  if (to.meta.guestOnly && loggedIn) {
    return { name: 'Dashboard' }
  }

  // 2. Protected pages require an active session
  if (to.meta.requiresAuth) {
    if (!loggedIn) return { name: 'Login' }

    // 3. Re-verify account_status on every protected navigation.
    //    Catches users who were denied after already logging in.
    const status = auth.accountStatus
    if (status && status !== 'approved') {
      await auth.logout(router)
      return false  // navigation already handled by logout()
    }
  }
})

export default router