import { supabase } from '@/lib/supabaseClient'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──
  const user          = ref(null)
  const profile       = ref(null)
  const positionLabel = ref('')
  const roleId        = ref(null)
  const unitId        = ref(null)
  const accountStatus = ref(null)
  const loading       = ref(false)
  const initialized   = ref(false)

  // ── Derived ──
  const isLoggedIn = computed(() => !!user.value)

  const fullName = computed(() => {
    if (!profile.value) return ''
    const mi = profile.value.middle_initial
      ? ` ${profile.value.middle_initial}.`
      : ''
    return `${profile.value.fname || ''}${mi} ${profile.value.lname || ''}`.trim()
  })

  const avatarUrl = computed(() => '/images/profile.jpg')

  const isDirector = computed(() => roleId.value === 1)
  const isUnitHead = computed(() => roleId.value === 2)
  const isMember   = computed(() => roleId.value === 3)
  const isAdmin    = computed(() => roleId.value === 4)

  // ── Fetch user data ──
  async function fetchUserData(authUser) {
    if (!authUser) return
    loading.value = true

    const [profRes, posRes, roleRes, unitRes, statusRes] = await Promise.all([
      supabase
        .from('user_profile')
        .select('fname, lname, middle_initial')
        .eq('user_id', authUser.id)          // ✅ PK is user_id
        .maybeSingle(),

      supabase
        .from('position')
        // ✅ FK is pos_id → position_name.id, use alias syntax
        .select('position_name:pos_id(pos_name)')
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

    if (profRes.error)   console.error('[auth] user_profile:',   profRes.error.message)
    if (posRes.error)    console.error('[auth] position:',        posRes.error.message)
    if (roleRes.error)   console.error('[auth] member_type:',     roleRes.error.message)
    if (unitRes.error)   console.error('[auth] unit:',            unitRes.error.message)
    if (statusRes.error) console.error('[auth] account_status:',  statusRes.error.message)

    // Debug log so you can confirm values in the console
    console.log('[auth] roleId →', roleRes.data?.role_id, '| isDirector →', roleRes.data?.role_id === 1)

    profile.value       = profRes.data   ?? null
    positionLabel.value = posRes.data?.position_name?.pos_name ?? ''
    roleId.value        = roleRes.data?.role_id  ?? null
    unitId.value        = unitRes.data?.unit_id  ?? null
    accountStatus.value = statusRes.data?.status ?? 'pending'

    loading.value     = false
    initialized.value = true
  }

  // ── Init (call once at startup) ──
  async function init() {
    loading.value = true
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchUserData(session.user)
    } else {
      loading.value     = false
      initialized.value = true
    }
  }

  // ── Auth state listener (call AFTER app.mount()) ──
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
    user, profile, positionLabel, roleId, unitId, accountStatus, loading, initialized,
    isLoggedIn, fullName, avatarUrl, isDirector, isUnitHead, isMember, isAdmin,
    init, listenToAuthChanges, fetchUserData, logout, $reset,
  }
})