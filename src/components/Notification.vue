<script setup>
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const auth  = useAuthStore()
const open  = ref(false)
const notifs = ref([])
const PAGE  = 8          // items per "page"
const shown = ref(PAGE)
const bell  = ref(null)  // button ref for animation

// ── Types ──
// type: 'registration' | 'task_submitted' | 'poke'

const unread = computed(() => notifs.value.filter(n => !n.read).length)
const visible = computed(() => notifs.value.slice(0, shown.value))
const hasMore = computed(() => shown.value < notifs.value.length)

// ── Fetch ──
const fetchNotifs = async () => {
  const uid = auth.user?.id
  if (!uid) return

  const results = []

  // 1. New registrations (pending accounts) — director sees all
  if (auth.isDirector) {
    const { data: regs } = await supabase
      .from('account_status')
      .select('user_id, requested_at, status, notif_read_by_director')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
      .limit(20)

    const userIds = (regs||[]).map(r => r.user_id)
    let nameMap = {}
    if (userIds.length) {
      const { data: profs } = await supabase
        .from('user_profile')
        .select('id, fname, lname')
        .in('id', userIds)
      nameMap = Object.fromEntries((profs||[]).map(p => [p.id, `${p.fname||''} ${p.lname||''}`.trim()]))
    }

    ;(regs||[]).forEach(r => {
      results.push({
        id:    `reg-${r.user_id}`,
        type:  'registration',
        title: nameMap[r.user_id] || 'New User',
        body:  'Registered and is awaiting your approval.',
        time:  r.requested_at,
        read:  !!r.notif_read_by_director,
        meta:  null,
      })
    })
  }

  // 2. New tasks submitted (task_approval.unit_head just became true → ready for director)
  //    OR task assigned to current user
  {
    const { data: taskRows } = await supabase
      .from('task')
      .select(`
        id, assignee, assigner,
        task_profile ( title, urgent, task_type_ref:task_type(task_type) ),
        task_approval ( unit_head, director ),
        task_duration ( created ),
        task_notif    ( read_by_assignee, read_by_director )
      `)
      .or(`assignee.eq.${uid},assigner.eq.${uid}`)
      .is('parent_id', null)
      .order('task_duration.created', { ascending: false })
      .limit(30)

    const uids2 = [...new Set((taskRows||[]).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))]
    let nm2 = {}
    if (uids2.length) {
      const { data: p2 } = await supabase
        .from('user_profile').select('id, fname, lname').in('id', uids2)
      nm2 = Object.fromEntries((p2||[]).map(p => [p.id, `${p.fname||''} ${p.lname||''}`.trim()]))
    }

    ;(taskRows||[]).forEach(t => {
      const isDirectorView = auth.isDirector && t.task_approval?.unit_head && !t.task_approval?.director
      const isAssigneeView = t.assignee === uid

      if (isDirectorView || isAssigneeView) {
        const urgentFlag = !!t.task_profile?.urgent
        const taskType   = t.task_profile?.task_type_ref?.task_type?.toLowerCase() || 'regular'
        const isRead     = auth.isDirector
          ? !!t.task_notif?.read_by_director
          : !!t.task_notif?.read_by_assignee

        results.push({
          id:    `task-${t.id}`,
          type:  'task_submitted',
          title: t.task_profile?.title || 'Untitled Task',
          body:  `Submitted by ${nm2[t.assigner] || 'someone'} · ${taskType}${urgentFlag ? ' · URGENT' : ''}`,
          time:  t.task_duration?.created,
          read:  isRead,
          meta:  { urgent: urgentFlag, taskType },
        })
      }
    })
  }

  // 3. Pokes — follow-up messages targeting this user
  {
    const { data: pokes } = await supabase
      .from('task_poke')
      .select(`
        id, task_id, from_user, to_user, message, created_at, is_read,
        task:task_id ( task_profile(title) )
      `)
      .eq('to_user', uid)
      .order('created_at', { ascending: false })
      .limit(20)

    const pokerIds = [...new Set((pokes||[]).map(p => p.from_user).filter(Boolean))]
    let pokerMap = {}
    if (pokerIds.length) {
      const { data: pp } = await supabase
        .from('user_profile').select('id, fname, lname').in('id', pokerIds)
      pokerMap = Object.fromEntries((pp||[]).map(p => [p.id, `${p.fname||''} ${p.lname||''}`.trim()]))
    }

    ;(pokes||[]).forEach(p => {
      results.push({
        id:    `poke-${p.id}`,
        type:  'poke',
        title: pokerMap[p.from_user] || 'A team member',
        body:  p.message || `Followed up on "${p.task?.task_profile?.title || 'a task'}"`,
        time:  p.created_at,
        read:  !!p.is_read,
        meta:  { taskId: p.task_id },
      })
    })
  }

  // Sort all by time desc
  results.sort((a, b) => new Date(b.time) - new Date(a.time))
  notifs.value = results
}

// ── Mark all read ──
const markAllRead = async () => {
  notifs.value.forEach(n => { n.read = true })

  // Persist reads — fire-and-forget
  const uid = auth.user?.id
  if (!uid) return

  // registrations
  if (auth.isDirector) {
    await supabase.from('account_status')
      .update({ notif_read_by_director: true })
      .eq('status', 'pending')
  }
  // task notifs
  const taskIds = notifs.value
    .filter(n => n.type === 'task_submitted')
    .map(n => parseInt(n.id.replace('task-', '')))
  if (taskIds.length) {
    const col = auth.isDirector ? 'read_by_director' : 'read_by_assignee'
    await supabase.from('task_notif').update({ [col]: true }).in('task_id', taskIds)
  }
  // pokes
  const pokeIds = notifs.value
    .filter(n => n.type === 'poke')
    .map(n => parseInt(n.id.replace('poke-', '')))
  if (pokeIds.length) {
    await supabase.from('task_poke').update({ is_read: true }).in('id', pokeIds)
  }
}

// ── Toggle panel ──
const toggle = async () => {
  open.value = !open.value
  if (open.value) {
    shown.value = PAGE
    await nextTick()
    if (unread.value > 0) await markAllRead()
  }
}

// ── Bell shake on new notif ──
const shakeBell = () => {
  bell.value?.classList.remove('bell-shake')
  void bell.value?.offsetWidth
  bell.value?.classList.add('bell-shake')
}

// ── Realtime subscription ──
let channel = null
const setupRealtime = () => {
  channel = supabase
    .channel('notif-feed')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'account_status' }, () => {
      fetchNotifs(); shakeBell()
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task' }, () => {
      fetchNotifs(); shakeBell()
    })
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_poke' }, () => {
      fetchNotifs(); shakeBell()
    })
    .subscribe()
}

// ── Helpers ──
const timeAgo = (d) => {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  if (s < 604800) return `${Math.floor(s/86400)}d ago`
  return new Date(d).toLocaleDateString('en-PH', { month:'short', day:'numeric' })
}

const typeConfig = {
  registration:   { color: 'bg-blue-500',   light: 'bg-blue-50 border-blue-100',   label: 'New User',      icon: 'user'  },
  task_submitted: { color: 'bg-green-600',  light: 'bg-green-50 border-green-100', label: 'Task',          icon: 'task'  },
  poke:           { color: 'bg-amber-500',  light: 'bg-amber-50 border-amber-100', label: 'Follow-up',     icon: 'poke'  },
}
const urgentOverride = { color: 'bg-red-600', light: 'bg-red-50 border-red-200', label: 'Urgent Task' }

const cfg = (n) => {
  if (n.type === 'task_submitted' && n.meta?.urgent) return urgentOverride
  return typeConfig[n.type] || typeConfig.task_submitted
}

// ── Close on outside click ──
const onOutside = (e) => {
  const el = document.getElementById('notif-widget')
  if (el && !el.contains(e.target)) open.value = false
}

onMounted(async () => {
  await fetchNotifs()
  setupRealtime()
  document.addEventListener('mousedown', onOutside)
})
onUnmounted(() => {
  channel?.unsubscribe()
  document.removeEventListener('mousedown', onOutside)
})
</script>

<template>
  <div id="notif-widget" class="fixed bottom-16 right-6 z-50 flex flex-col items-end">

    <!-- ── Panel ── -->
    <Transition name="panel">
      <div v-if="open"
        class="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100
               flex flex-col overflow-hidden panel-wrap">

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-gray-900">Notifications</span>
            <span v-if="unread > 0"
              class="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white tabular-nums">
              {{ unread }}
            </span>
          </div>
          <button @click="toggle"
            class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100
                   text-gray-400 hover:text-gray-600 transition-colors text-base leading-none">
            ×
          </button>
        </div>

        <!-- List -->
        <div class="overflow-y-auto notif-scroll flex-1" style="max-height: 420px">

          <!-- Empty -->
          <div v-if="notifs.length === 0"
            class="flex flex-col items-center justify-center py-12 text-center px-6">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" class="w-6 h-6 fill-gray-300">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-400">All caught up!</p>
            <p class="text-xs text-gray-300 mt-1">No notifications right now.</p>
          </div>

          <!-- Items -->
          <div v-else class="py-2">
            <TransitionGroup name="notif-list" tag="div">
              <div
                v-for="(n, i) in visible" :key="n.id"
                class="notif-item mx-2 mb-1.5 rounded-xl border px-3 py-2.5 cursor-default
                       transition-colors duration-150"
                :class="[cfg(n).light, !n.read ? 'shadow-sm' : 'opacity-70']"
                :style="`animation-delay: ${i * 30}ms`">

                <div class="flex items-start gap-2.5">
                  <!-- Dot + icon -->
                  <div class="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                    <span class="w-2 h-2 rounded-full flex-shrink-0 transition-all"
                      :class="!n.read ? cfg(n).color : 'bg-gray-200'"/>
                  </div>

                  <div class="flex-1 min-w-0">
                    <!-- Label badge -->
                    <div class="flex items-center justify-between gap-2 mb-0.5">
                      <span class="text-xs font-bold px-1.5 py-0.5 rounded-md"
                        :class="n.type === 'task_submitted' && n.meta?.urgent
                          ? 'bg-red-100 text-red-700'
                          : n.type === 'registration'
                            ? 'bg-blue-100 text-blue-700'
                            : n.type === 'poke'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'">
                        {{ cfg(n).label }}
                      </span>
                      <span class="text-xs text-gray-400 flex-shrink-0">{{ timeAgo(n.time) }}</span>
                    </div>

                    <p class="text-xs font-semibold text-gray-800 truncate">{{ n.title }}</p>
                    <p class="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{{ n.body }}</p>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <!-- Show more -->
            <div v-if="hasMore" class="px-3 pt-1 pb-2">
              <button @click="shown += PAGE"
                class="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-800
                       border border-dashed border-gray-200 rounded-xl hover:border-gray-300
                       hover:bg-gray-50 transition-all duration-150">
                Show {{ Math.min(PAGE, notifs.length - shown) }} more
                · {{ notifs.length - shown }} remaining
              </button>
            </div>
          </div>
        </div>

      </div>
    </Transition>

    <!-- ── Bell button ── -->
    <button ref="bell" @click="toggle"
      class="bell-btn relative w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center
             transition-all duration-200 active:scale-95"
      :class="open ? 'bg-green-900 shadow-green-900/30' : 'bg-green-800 hover:bg-green-900 shadow-green-800/30'">

      <!-- Bell SVG -->
      <svg viewBox="0 0 24 24" class="w-5 h-5 fill-white">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>

      <!-- Badge -->
      <Transition name="badge">
        <span v-if="unread > 0"
          class="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full
                 bg-red-500 text-white text-xs font-bold flex items-center justify-center
                 tabular-nums shadow-sm border-2 border-white">
          {{ unread > 99 ? '99+' : unread }}
        </span>
      </Transition>

      <!-- Pulse ring when unread -->
      <span v-if="unread > 0 && !open"
        class="absolute inset-0 rounded-2xl bg-green-500 opacity-30 animate-ping pointer-events-none"/>
    </button>

  </div>
</template>

<style scoped>
/* ── Panel slide-up ── */
.panel-enter-active {
  animation: panelIn 0.3s cubic-bezier(.16,1,.3,1) both;
}
.panel-leave-active {
  animation: panelOut 0.18s ease both;
}
@keyframes panelIn {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
@keyframes panelOut {
  from { opacity: 1; transform: translateY(0)    scale(1);    }
  to   { opacity: 0; transform: translateY(8px)  scale(0.97); }
}

/* ── Notif list stagger ── */
.notif-list-enter-active {
  animation: notifIn 0.28s cubic-bezier(.16,1,.3,1) both;
}
.notif-list-leave-active {
  animation: notifIn 0.15s ease reverse both;
}
@keyframes notifIn {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0);    }
}

/* ── Badge pop ── */
.badge-enter-active { animation: badgePop 0.3s cubic-bezier(.34,1.56,.64,1) both; }
.badge-leave-active { animation: badgePop 0.15s ease reverse both; }
@keyframes badgePop {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1);   }
}

/* ── Bell shake ── */
@keyframes bellShake {
  0%,100% { transform: rotate(0);    }
  15%     { transform: rotate(18deg);}
  30%     { transform: rotate(-14deg);}
  45%     { transform: rotate(10deg); }
  60%     { transform: rotate(-6deg); }
  75%     { transform: rotate(3deg);  }
}
.bell-shake { animation: bellShake 0.55s ease both; }

/* ── Scrollbar ── */
.notif-scroll::-webkit-scrollbar { width: 4px; }
.notif-scroll::-webkit-scrollbar-track { background: transparent; }
.notif-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
.notif-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db; }

/* ── Notif item animate-in ── */
.notif-item { animation: notifIn 0.28s cubic-bezier(.16,1,.3,1) both; }

/* line clamp */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>