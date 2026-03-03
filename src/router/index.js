import Analytics from '@/views/Analytics.vue'
import Dashboard from '@/views/Dashboard.vue'
import Design from '@/views/Design.vue'
import HeroLanding from '@/views/HeroLanding.vue'
import Login from '@/views/Login.vue'
import Organization from '@/views/Organization.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'
import Tasks from '@/views/Tasks.vue'

import { supabase } from '@/lib/supabaseClient'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/hero',
  },

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

  {
    path: '/logout',
    name: 'Logout',
    redirect: () => {
      supabase.auth.signOut()
      return { name: 'Login' }
    },
  },

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
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session?.user

  // 1. Logged-in users can't visit guest-only pages
  if (to.meta.guestOnly && isLoggedIn) {
    return { name: 'Dashboard' }
  }

  // 2. Protected pages require an active session
  if (to.meta.requiresAuth) {
    if (!isLoggedIn) {
      return { name: 'Login' }
    }

    // 3. Even with a valid session, re-verify account_status
    //    Handles the case where a user is denied after already logging in
    const { data: statusData } = await supabase
      .from('account_status')
      .select('status')
      .eq('user_id', session.user.id)
      .single()

    const status = statusData?.status ?? 'pending'

    if (status !== 'approved') {
      await supabase.auth.signOut()
      return { name: 'Login' }
    }
  }
})

export default router