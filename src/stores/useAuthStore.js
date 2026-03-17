import { supabase } from '@/lib/supabaseClient'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──
  const user = ref(null)
  const userID = ref(null)
  const profile = ref(null)
  const positions = ref([])
  const accountStatus = ref(null)
  const loading = ref(false)
  const initialized = ref(false)
  const avatarUrl = ref(null) // ── NEW ──

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
    const f = (profile.value.fname || '').trim()
    const l = (profile.value.lname || '').trim()
    return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || '?'
  })

  // Deterministic pastel-green hue based on initials so each user gets
  // a slightly different shade while staying in the green family
  const avatarColor = computed(() => {
    const str = fullName.value || '?'
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    // Hue locked to green range (100–160°), vary saturation/lightness slightly
    const hue = 100 + (Math.abs(hash) % 60)
    const sat = 38 + (Math.abs(hash >> 4) % 20)
    const lit = 28 + (Math.abs(hash >> 8) % 14)
    return `hsl(${hue}, ${sat}%, ${lit}%)`
  })

  const isDirector = computed(() => {
    return positions?.value.some(p => p.pos_id === 1) ?? false
  })
  const isUnitHead = computed(() => {
    return positions?.value.some(p => p.pos_id === 4) ?? false
  })
  const isAdmin = computed(() => {
    return positions?.value.some(p => p.pos_id === 11) ?? false
  })
  const isMember = computed(() => {
    const excludedIds = [1, 4, 11];
    const hasPositions = positions.value?.length > 0;

    // .every() ensures that NOT ONE of their roles is in the excluded list
    const hasNoSpecialRoles = positions.value?.every(p =>
      !excludedIds.includes(Number(p.pos_id))
    );

    return hasPositions && hasNoSpecialRoles;
  })
  // Office unit members bypass unit head — go straight to director
  const isOffice = computed(() => {
    return positions?.value.some(p => p.unit_id === 3) ?? false
  })

  // ── Fetch user data ──
  // force=true bypasses the early-return guard (used after profile save)
  async function fetchUserData(authUser, force = false) {
    if (!force && initialized.value && user.value) return
    if (!authUser) return
    loading.value = true
    userID.value = authUser.id

    const [profRes, posRes, statusRes, avatarRes] = await Promise.all([
      supabase
        .from('members')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle(),

      supabase
        .from('position_of_members')
        .select('pos_id, unit_id, pos_name, unit_name')
        .eq('user_id', authUser.id),

      supabase
        .from('account_status')
        .select('status_id')
        .eq('user_id', authUser.id)
        .maybeSingle(),

      // ── NEW: fetch avatar_url from user_profile ──
      supabase
        .from('user_profile')
        .select('avatar_url')
        .eq('user_id', authUser.id)
        .maybeSingle(),
    ])

    if (profRes.error) console.error('[auth] members:', profRes.error.message)
    if (posRes.error) console.error('[auth] position:', posRes.error.message)
    if (statusRes.error) console.error('[auth] account_status:', statusRes.error.message)
    if (avatarRes.error) console.error('[auth] avatar:', avatarRes.error.message)

    profile.value = profRes.data ?? null
    positions.value = posRes.data || []
    accountStatus.value = statusRes.data?.status_id ?? 1

    // ── NEW: set avatarUrl with cache-buster ──
    const raw = avatarRes.data?.avatar_url
    avatarUrl.value = raw
      ? `${raw.split('?')[0]}?t=${Date.now()}`
      : null

    console.log('isDirector ->', isDirector.value)
    console.log('isUnitHead ->', isUnitHead.value)
    console.log('isUnitMember ->', isMember.value)
    console.log('isOffice ->', isOffice.value)
    console.log(positions.value)

    loading.value = false
    initialized.value = true
  }

  async function init() {
    loading.value = true
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      user.value = session.user
      await fetchUserData(session.user)
    } else {
      loading.value = false
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

  async function editProfile(payload) {
    try {
      const { data, error, status } = await supabase
        .from('user_profile')
        .update(payload)
        .eq('user_id', userID.value)
        .select()

         if(error) throw error

         await fetchUserData(user.value)

         return status
    } catch(e) {
      console.log('Error updating profile: ', e)
    }
  }

  async function logout(router) {
    await supabase.auth.signOut()
    $reset()
    router.push('/login')
  }

  function $reset() {
    user.value = null
    userID.value = null
    positions.value = []
    profile.value = null
    accountStatus.value = null
    avatarUrl.value = null // ── NEW ──
    initialized.value = false
  }

  return {
    user, userID, profile, positions, accountStatus, loading, initialized,
    isLoggedIn, fullName, initials, avatarColor, avatarUrl, // ← avatarUrl added
    isDirector, isUnitHead, isMember, isAdmin, isOffice,
    init, listenToAuthChanges, fetchUserData, logout, $reset, editProfile
  }
})