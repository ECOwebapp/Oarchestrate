import Analytics from '@/views/Analytics.vue'
import Dashboard from '@/views/Dashboard.vue'
import Design from '@/views/Design.vue'
import HeroLanding from '@/views/HeroLanding.vue'
import Login from '@/views/Login.vue'
import Organization from '@/views/Organization.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'
import Projects from '@/views/Task.vue'
import Main from '@/views/Main.vue'

import { useAuthStore } from '@/stores/useAuthStore'
import { taskStore } from '@/stores/tasks'
import { useMemberStore } from '@/stores/member'
import { usePosStore } from '@/stores/positions'
import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'

const routes = [
  // ── Guest-only ──
  {
    path: '/hero',
    name: 'Hero',
    component: HeroLanding,
    meta: { guestOnly: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true },
  },

  // ── Protected ──
  {
    path: '/',
    component: Main,
    redirect: { name: 'Dashboard' },
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresTasks: true, requiresAuth: true },
      },
      // {
      //   path: 'projects',
      //   name: 'Projects',
      //   component: Projects,
      //   meta: { requireMembers: true, requiresTasks: true, requiresAuth: true },
      // },
      {
        path: 'design',
        name: 'Design',
        component: Design,
        meta: { requireMembers: true, requiresTasks: true, requiresAuth: true },
      },
      {
        path: 'organization',
        name: 'Organization',
        component: Organization,
        meta: { requireMembers: true, requiresAuth: true },
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: Analytics,
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true },
      },
    ]
  },

  // ── Fallback ──
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'Hero' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
})

export const isPageLoading = ref(false)

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const tasks = taskStore()
  const members = useMemberStore()
  
  isPageLoading.value = true

  // 1. Run initialization first (Security Priority)
  if (!auth.initialized) await auth.init()
  const loggedIn = auth.isLoggedIn

  // 2. Security Gates (Instant Returns)
  if (to.meta.guestOnly && loggedIn) return { name: 'Dashboard' }
  if (to.meta.requiresAuth && !loggedIn) return { name: 'Hero' }

  // 3. PERFORMANCE BOOST: Parallel Data Fetching
  // Instead of awaiting one by one, start them all at once!
  const loaders = []
  if (to.meta.requiresTasks && tasks.tasks.length === 0) loaders.push(tasks.fetchTasks())
  if (to.meta.requireMembers && members.members.length === 0) loaders.push(members.fetchMembers())
  
  // Wait for all data requirements to finish together
  await Promise.all(loaders)

  // 4. Final Verification
  if (to.meta.requiresAuth && auth.accountStatus !== 2) {
    await auth.logout(router)
    return { name: 'Login' }
  }

  // If we get here, navigation is allowed and data is READY
  isPageLoading.value = false
})

router.afterEach(() => {
  // Add a tiny delay so the spinner doesn't "flicker" for fast loads
  setTimeout(() => {
    isPageLoading.value = false
  }, 300)
})

router.afterEach(() => {
  // Add a tiny delay so the spinner doesn't "flicker" for fast loads
  setTimeout(() => {
    isPageLoading.value = false
  }, 300)
})

export default router