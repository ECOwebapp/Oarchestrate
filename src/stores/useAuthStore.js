import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiFetch, session } from '@/lib/api'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {

  // ── State ──
  const userID = ref(null)
  const profile = ref(null)
  const positions = ref([])
  const accountStatus = ref(null)
  const loading = ref(false)
  const initialized = ref(false)
  const avatarUrl = ref(null) // ── NEW ──


  // ── Derived ──
  const isLoggedIn = computed(() => !!userID.value)

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
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)

    // Hue locked to green range (100–160°), vary saturation/lightness slightly
    const hue = 100 + (Math.abs(hash) % 60)
    const sat = 38 + (Math.abs(hash >> 4) % 20)
    const lit = 28 + (Math.abs(hash >> 8) % 14)
    return `hsl(${hue}, ${sat}%, ${lit}%)`
  })

  const isDirector = computed(() => { return positions?.value.some(p => p.pos_id === 1) ?? false })
  const isUnitHead = computed(() => { return positions?.value.some(p => p.pos_id === 4) ?? false })
  const isAdmin = computed(() => { return positions?.value.some(p => p.pos_id === 11) ?? false })

  const isMember = computed(() => {
    const excludedIds = [1, 4, 11];
    const hasPositions = positions.value?.length > 0;

    // .every() ensures that NOT ONE of their roles is in the excluded list
    const hasNoSpecialRoles = positions.value?.every(p => !excludedIds.includes(Number(p.pos_id)));
    return hasPositions && hasNoSpecialRoles;
  })

  // Office unit members bypass unit head — go straight to director
  const isOffice = computed(() => { return positions?.value.some(p => p.unit_id === 3) ?? false })
  const isSeniorDraftsman = computed(() => { return positions?.value.some(p => p.pos_id === 6) })

  const login = async (form) => {
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          idNumber: form.idNumber, // Matches your req.body destructuring
          password: form.password
        }),
      })

      const result = await response.json();

      if (response.ok) {
        const { userData, session } = result
        userID.value = session.user.id;
        localStorage.setItem('eco_session', JSON.stringify(session));
        $fill(userData)
        initialized.value = true

      } else if (response.status === 401) {
        return { error: result.error }
      }
      else {
        return {
          status_id: result?.status_id,
          notes: result?.notes
        }
      }

    } catch (e) {
      console.log('Failed to login: ', e)
    }
  }

  // ── Fetch user data ──
  // force=true bypasses the early-return guard (used after profile save)
  const fetchUserData = async () => {
    if (initialized.value && userID.value) {
      console.log("Already initialized. Skipping.");
      return;
    }

    if (!session && !userID.value) {
      console.log("No session found. Aborting fetch.");
      return;
    }
    else if (!session && userID.value) await logout()

    loading.value = true
    console.log('Fetching ->', loading.value)

    try {
      const response = await apiFetch('/auth/me', { method: 'GET' })

      if (response && response.ok) {
        const { userData, user_id } = await response.json();
        userID.value = user_id
        $fill(userData)
        initialized.value = true
      } else await logout();

    } catch (e) {
      console.log('Failed to fetch user data: ', e)
    } finally {
      loading.value = false
      console.log('Fetching ->', loading.value)
    }
  }

  const editProfile = async (payload, type, status = null) => {
    if (!type) {
      console.log('Please provide instance type')
      return 'Please provide instance type'
    }

    try {
      let newPayload = {
        payload: payload, // Matches your req.body destructuring
        userId: userID.value
      }
      if(status) newPayload.status = status

      const response = await apiFetch(`/profile/${type}`, {
        method: 'POST',
        body: JSON.stringify(newPayload),
      })

      const result = await response.json()
      if (response.ok) $fill(result?.userData)
      else throw new Error(result.error)

      return response.status || 200
    } catch (e) {
      console.log('Error updating profile: ', e)
    }
  }

// Requires testing when internet connection returns
// >> Hexer <<
  const passManagement = async(payload, status) => {
    if(!status) return new Error('Please provide instance type')

      try {
        const response = await apiFetch(`/auth/pass`, {
          method: 'POST',
          body: JSON.stringify({
            payload: payload,
            status: status
          }),
        })

        return await response.json()
      } catch (e) {
        console.log('Process failed: ', e)
        return new Error('Process failed: ', e)
      }
  }

  // const listenToAuthChanges = async () => {
  //   const res = await apiFetch('/auth/state')

  //   if (res.status === 200) await fetchUserData()
  //   else if (res.status === 401) await logout()
  // }

  const logout = async () => {

    if (userID.value) {
      try {
        const response = await apiFetch('/auth/logout', { method: 'POST' })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Logout failed');

      } catch (e) {
        console.log('Error logout: ', e)
      }
    }

    localStorage.removeItem('eco_session');
    $reset()
    initialized.value = false
    router.replace({ name: 'Login' })
  }

  function $fill(userData) {
    // Destructure the object into your existing refs
    profile.value = userData?.profile || null;
    positions.value = userData?.positions || [];
    accountStatus.value = userData?.accountStatus || null;

    // Handle the cache-buster logic here on the frontend
    avatarUrl.value = userData?.profile.avatar_url
      ? `${userData?.profile.avatar_url.split('?')[0]}?t=${Date.now()}`
      : null;
  }

  function $reset() {
    userID.value = null
    positions.value = []
    profile.value = null
    accountStatus.value = null
    avatarUrl.value = null // ── NEW ──
    initialized.value = false
  }

  return {
    userID, profile, positions, accountStatus, loading, initialized,
    isLoggedIn, fullName, initials, avatarColor, avatarUrl, // ← avatarUrl added
    isDirector, isUnitHead, isMember, isAdmin, isOffice, isSeniorDraftsman,
    login, fetchUserData, logout, $reset, editProfile, passManagement
  }
})