import { supabase } from '@/lib/supabaseClient'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──
  const user          = ref(null)
  const userID        = ref(null)
  const profile       = ref(null)
  const positionId    = ref(null)
  const positionLabel = ref('')
  const unitId        = ref(null)
  const unitName      = ref('')
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

  // Initials from first + last name (e.g. "Juan D. Dela Cruz" → "JD")
  const initials = computed(() => {
    if (!profile.value) return '?'
    const f = (profile.value.fname  || '').trim()
    const l = (profile.value.lname  || '').trim()
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || '?'
  })

  // Deterministic pastel-green hue based on initials so each user gets
  // a slightly different shade while staying in the green family
  const avatarColor = computed(() => {
    const str   = fullName.value || '?'
    let hash    = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    // Hue locked to green range (100–160°), vary saturation/lightness slightly
    const hue  = 100 + (Math.abs(hash) % 60)
    const sat  = 38  + (Math.abs(hash >> 4) % 20)
    const lit  = 28  + (Math.abs(hash >> 8) % 14)
    return `hsl(${hue}, ${sat}%, ${lit}%)`
  })

  const isDirector = computed(() => positionId.value === 1)
  const isUnitHead = computed(() => positionId.value === 4)
  const isMember   = computed(() => { 
    const excludedIds = [1, 4, 11];

    return !excludedIds.includes(Number(positionId.value));
  })
  const isAdmin    = computed(() => positionId.value === 11)
  // Office unit members bypass unit head — go straight to director
  const isOffice   = computed(() => unitId.value === 3)

  // ── Fetch user data ──
  async function fetchUserData(authUser) {
    if (!authUser) return
    loading.value = true
    userID.value  = authUser.id

    const [profRes, posRes, statusRes] = await Promise.all([
      supabase
        .from('user_profile')
        .select('fname, lname, middle_initial')
        .eq('user_id', authUser.id)
        .maybeSingle(),

      supabase
        .from('position')
        .select('position_name:pos_id(id, pos_name), unit:unit_id(id, name)')
        .eq('user_id', authUser.id)
        .maybeSingle(),

      supabase
        .from('account_status')
        .select('status_id')
        .eq('user_id', authUser.id)
        .maybeSingle(),
    ])

    if (profRes.error)   console.error('[auth] user_profile:',  profRes.error.message)
    if (posRes.error)    console.error('[auth] position:',       posRes.error.message)
    if (statusRes.error) console.error('[auth] account_status:', statusRes.error.message)

    console.log('[auth] roleId →', posRes.data?.position_name?.id, '| isDirector →', posRes.data?.position_name?.id === 1)

    profile.value       = profRes.data  ?? null
    positionId.value          = posRes.data?.position_name?.id ?? null
    positionLabel.value = posRes.data?.position_name?.pos_name ?? ''
    unitId.value        = posRes.data?.unit.id ?? null
    unitName.value      = posRes.data?.unit?.name ?? ''
    accountStatus.value = statusRes.data?.status_id ?? 1

    loading.value     = false
    initialized.value = true
  }

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
    userID.value        = null
    profile.value       = null
    positionLabel.value = ''
    unitId.value        = null
    unitName.value      = ''
    accountStatus.value = null
    initialized.value   = false
  }

  return {
    user, userID, profile, positionLabel, unitId, unitName, accountStatus, loading, initialized,
    isLoggedIn, fullName, initials, avatarColor,
    isDirector, isUnitHead, isMember, isAdmin, isOffice,
    init, listenToAuthChanges, fetchUserData, logout, $reset,
  }
})