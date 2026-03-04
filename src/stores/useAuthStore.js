import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──
  const user        = ref(null)   // Supabase auth user
  const profile     = ref(null)   // user_profile row
  const positionLabel = ref('')   // position_name.pos_name
  const roleId        = ref(null)   // member_type.role_id
  const unitId        = ref(null)   // unit.unit_id
  const accountStatus = ref(null)   // account_status.status
  const loading       = ref(false)
  const initialized   = ref(false)  // true after first fetch

  // ── Derived ──
  const isLoggedIn = computed(() => !!user.value)

  const fullName = computed(() => {
    if (!profile.value) return ''
    const mi = profile.value.middle_initial
      ? ` ${profile.value.middle_initial}.`
      : ''
    return `${profile.value.fname}${mi} ${profile.value.lname}`
  })

  const avatarUrl = computed(() => '/images/profile.jpg')

  const isDirector  = computed(() => roleId.value === 1)
  const isUnitHead  = computed(() => roleId.value === 2)
  const isMember    = computed(() => roleId.value === 3)
  const isAdmin     = computed(() => roleId.value === 4)

  // ── Actions ──

  /** Fetch profile, position, role, unit for the given user */
  async function fetchUserData(authUser) {
    if (!authUser) return
    loading.value = true

    const [profRes, posRes, roleRes, unitRes, statusRes] = await Promise.all([
      supabase
        .from('user_profile')
        .select('fname, lname, middle_initial')
        .eq('user_id', authUser.id)
        .maybeSingle(),
      supabase
        .from('position')
        .select('position_name(pos_name)')
        .eq('user_id', authUser.id)
        .maybeSingle(),
      supabase
        .from('member_type')
        .select('role_id')
        .eq('user_id', authUser.id)
        .maybeSingle(),
      supabase
        .from('unit')
        .select('unit_id')
        .eq('user_id', authUser.id)
        .maybeSingle(),
      supabase
        .from('account_status')
        .select('status')
        .eq('user_id', authUser.id)
        .maybeSingle(),
    ])

    // Log any errors so column/RLS issues are easy to spot
    if (profRes.error)   console.error('[auth] user_profile:', profRes.error.message)
    if (posRes.error)    console.error('[auth] position:',     posRes.error.message)
    if (roleRes.error)   console.error('[auth] member_type:',  roleRes.error.message)
    if (unitRes.error)   console.error('[auth] unit:',         unitRes.error.message)
    if (statusRes.error) console.error('[auth] account_status:', statusRes.error.message)

    profile.value       = profRes.data  ?? null
    positionLabel.value = posRes.data?.position_name?.pos_name ?? ''
    roleId.value        = roleRes.data?.role_id  ?? null
    unitId.value        = unitRes.data?.unit_id  ?? null
    accountStatus.value = statusRes.data?.status ?? 'pending'
    loading.value       = false
    initialized.value   = true
  }

  /** Call once at app startup — restores session and listens for changes */
  async function init() {
    loading.value = true

    // Restore existing session
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchUserData(session.user)
    } else {
      loading.value     = false
      initialized.value = true
    }

    // NOTE: onAuthStateChange is registered in listenToAuthChanges(),
    // called from main.js AFTER app.mount() to avoid mid-mount re-renders.
  }

  /** Register the auth state listener — call this AFTER app.mount() */
  function listenToAuthChanges() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        user.value = session.user
        await fetchUserData(session.user)
      }
      if (event === 'SIGNED_OUT') {
        $reset()
      }
    })
  }

  async function logout(router) {
    await supabase.auth.signOut()
    $reset()
    router.push('/login')
  }

  function $reset() {
    user.value          = null
    profile.value       = null
    positionLabel.value = ''
    roleId.value        = null
    unitId.value        = null
    accountStatus.value = null
    initialized.value   = false
  }

  return {
    // state
    user, profile, positionLabel, roleId, unitId, accountStatus, loading, initialized,
    // computed
    isLoggedIn, fullName, avatarUrl, isDirector, isUnitHead, isMember, isAdmin,
    // actions
    init, listenToAuthChanges, fetchUserData, logout, $reset,
  }
})