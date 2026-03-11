<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import { useNotifStore } from '@/stores/useNotifStore'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

const notifStore = useNotifStore()
const auth       = useAuthStore()

const open = ref(false)
const bell = ref(null)

// ── Toggle panel ──
const toggle = async () => {
  open.value = !open.value
  if (open.value) {
    notifStore.resetShown()
    await nextTick()
    // Only mark non-registration items as read when opening
    if (notifStore.unread > 0) await notifStore.markAllRead()
  }
}

// ── Bell shake ──
const shakeBell = () => {
  bell.value?.classList.remove('bell-shake')
  void bell.value?.offsetWidth
  bell.value?.classList.add('bell-shake')
}

// ── Outside click ──
const onOutside = (e) => {
  const el = document.getElementById('notif-widget')
  if (el && !el.contains(e.target)) open.value = false
}

// ── Helpers ──
const timeAgo = (d) => {
  if (!d) return ''
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60)     return `${s}s ago`
  if (s < 3600)   return `${Math.floor(s/60)}m ago`
  if (s < 86400)  return `${Math.floor(s/3600)}h ago`
  if (s < 604800) return `${Math.floor(s/86400)}d ago`
  return new Date(d).toLocaleDateString('en-PH', { month:'short', day:'numeric' })
}

const badgeClass = (n) => {
  if (n.type === 'registration')                     return 'bg-blue-100 text-blue-700'
  if (n.type === 'task_submitted' && n.meta?.urgent) return 'bg-red-100 text-red-700'
  if (n.type === 'task_submitted')                   return 'bg-green-100 text-green-700'
  if (n.type === 'poke')                             return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}
const dotClass = (n) => {
  if (!n.read) {
    if (n.type === 'registration')                     return 'bg-blue-500'
    if (n.type === 'task_submitted' && n.meta?.urgent) return 'bg-red-500'
    if (n.type === 'task_submitted')                   return 'bg-green-600'
    if (n.type === 'poke')                             return 'bg-amber-500'
  }
  return 'bg-gray-200'
}
const itemBg = (n) => {
  if (n.type === 'registration')                     return 'bg-blue-50 border-blue-100'
  if (n.type === 'task_submitted' && n.meta?.urgent) return 'bg-red-50 border-red-100'
  if (n.type === 'task_submitted')                   return 'bg-green-50 border-green-100'
  if (n.type === 'poke')                             return 'bg-amber-50 border-amber-100'
  return 'bg-gray-50 border-gray-100'
}
const labelText = (n) => {
  if (n.type === 'registration')                     return 'New Registration'
  if (n.type === 'task_submitted' && n.meta?.urgent) return 'Urgent Task'
  if (n.type === 'task_submitted')                   return 'Task'
  if (n.type === 'poke')                             return 'Follow-up'
  return 'Notification'
}

// Initials avatar for registrant
const initials = (name) => {
  if (!name || name === 'New User') return '?'
  const parts = name.trim().split(' ')
  return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')
}

const isActing = (n) => n.status === 'approving' || n.status === 'denying'

onMounted(async () => {
  await notifStore.fetchNotifs()
  notifStore.setupRealtime(shakeBell)
  document.addEventListener('mousedown', onOutside)
})
onUnmounted(() => {
  notifStore.teardownRealtime()
  document.removeEventListener('mousedown', onOutside)
})
</script>

<template>
  <div id="notif-widget" class="fixed bottom-16 right-6 z-50 flex flex-col items-end">

    <!-- ── Panel ── -->
    <Transition name="panel">
      <div v-if="open"
        class="mb-3 w-84 bg-white rounded-2xl shadow-2xl border border-gray-100
               flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-gray-900">Notifications</span>
            <span v-if="notifStore.unread > 0"
              class="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white tabular-nums">
              {{ notifStore.unread }}
            </span>
          </div>
          <button @click="toggle"
            class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100
                   text-gray-400 hover:text-gray-600 transition-colors text-base">×</button>
        </div>

        <!-- List -->
        <div class="overflow-y-auto notif-scroll" style="max-height:480px">

          <!-- Empty -->
          <div v-if="notifStore.notifs.length === 0"
            class="flex flex-col items-center justify-center py-14 text-center px-6">
            <div class="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" class="w-6 h-6 fill-gray-300">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold text-gray-400">All caught up!</p>
            <p class="text-xs text-gray-300 mt-1">No notifications right now.</p>
          </div>

          <div v-else class="py-2">
            <TransitionGroup name="notif-list" tag="div">
              <div
                v-for="(n, i) in notifStore.visible" :key="n.userId"
                class="notif-item mx-2 mb-2 rounded-xl border overflow-hidden"
                :class="[itemBg(n), !n.read ? 'shadow-sm' : 'opacity-70']"
                :style="`animation-delay:${i*25}ms`">

                <!-- ══ REGISTRATION ITEM ══ -->
                <template v-if="n.type === 'registration'">
                  <div class="px-3 pt-3 pb-2">
                    <div class="flex items-start gap-3">

                      <!-- Avatar with unread dot -->
                      <div class="relative flex-shrink-0">
                        <div class="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center
                                    text-white text-xs font-bold uppercase tracking-wide">
                          {{ initials(n.title) }}
                        </div>
                        <span v-if="!n.read"
                          class="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500
                                 border-2 border-white" />
                      </div>

                      <div class="flex-1 min-w-0">
                        <!-- Badge + time -->
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
                            New Registration
                          </span>
                          <span class="text-[10px] text-gray-400 flex-shrink-0">{{ timeAgo(n.time) }}</span>
                        </div>

                        <!-- Name -->
                        <p class="text-sm font-bold text-gray-900 leading-tight">{{ n.title }}</p>

                        <!-- Position + Unit -->
                        <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span v-if="n.position" class="text-xs text-gray-600 font-medium">{{ n.position }}</span>
                          <span v-if="n.position && n.unit" class="text-gray-300 text-xs">·</span>
                          <span v-if="n.unit"
                            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-wide">
                            {{ n.unit }}
                          </span>
                        </div>

                        <!-- Body message -->
                        <p class="text-xs text-gray-500 mt-1 leading-snug">
                          Awaiting your approval to access the system.
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Action buttons -->
                  <div class="flex gap-2 px-3 pb-3 pt-1">
                    <button
                      @click="notifStore.denyUser(n.userId)"
                      :disabled="isActing(n)"
                      class="flex-1 py-2 rounded-xl border-2 border-red-200 text-red-600
                             text-xs font-bold hover:bg-red-50 hover:border-red-300 transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5
                             active:scale-95">
                      <svg v-if="n.status === 'denying'" class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.3" stroke-width="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" class="w-3 h-3 fill-current">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                      </svg>
                      {{ n.status === 'denying' ? 'Denying…' : 'Deny' }}
                    </button>
                    <button
                      @click="notifStore.approveUser(n.userId)"
                      :disabled="isActing(n)"
                      class="flex-1 py-2 rounded-xl bg-green-800 text-white
                             text-xs font-bold hover:bg-green-700 transition-all
                             disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5
                             active:scale-95">
                      <svg v-if="n.status === 'approving'" class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
                      </svg>
                      <svg v-else viewBox="0 0 24 24" class="w-3 h-3 fill-current">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      {{ n.status === 'approving' ? 'Approving…' : 'Approve' }}
                    </button>
                  </div>
                </template>

                <!-- ══ ALL OTHER ITEMS ══ -->
                <template v-else>
                  <div class="px-3 py-2.5 flex items-start gap-2.5">
                    <span class="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" :class="dotClass(n)"/>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2 mb-0.5">
                        <span class="text-xs font-bold px-1.5 py-0.5 rounded-md" :class="badgeClass(n)">
                          {{ labelText(n) }}
                        </span>
                        <span class="text-xs text-gray-400 flex-shrink-0">{{ timeAgo(n.time) }}</span>
                      </div>
                      <p class="text-xs font-semibold text-gray-800 truncate">{{ n.title }}</p>
                      <p class="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{{ n.body }}</p>
                    </div>
                  </div>
                </template>

              </div>
            </TransitionGroup>

            <!-- Show more -->
            <div v-if="notifStore.hasMore" class="px-3 pt-1 pb-2">
              <button @click="notifStore.showMore()"
                class="w-full py-2 text-xs font-semibold text-gray-500 hover:text-gray-700
                       border border-dashed border-gray-200 rounded-xl hover:border-gray-300
                       hover:bg-gray-50 transition-all">
                Show {{ Math.min(8, notifStore.notifs.length - notifStore.shown) }} more
                · {{ notifStore.notifs.length - notifStore.shown }} remaining
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Bell button ── -->
    <button ref="bell" @click="toggle"
      class="relative w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center
             active:scale-95 transition-all duration-200"
      :class="open
        ? 'bg-green-900 shadow-green-900/30'
        : 'bg-green-800 hover:bg-green-900 shadow-green-800/30'">

      <svg viewBox="0 0 24 24" class="w-5 h-5 fill-white">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>

      <!-- Unread badge -->
      <Transition name="badge">
        <span v-if="notifStore.unread > 0"
          class="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full
                 bg-red-500 text-white text-xs font-bold flex items-center justify-center
                 tabular-nums shadow-sm border-2 border-white">
          {{ notifStore.unread > 99 ? '99+' : notifStore.unread }}
        </span>
      </Transition>

      <!-- Pulse ring when unread -->
      <span v-if="notifStore.unread > 0 && !open"
        class="absolute inset-0 rounded-2xl bg-green-400 opacity-30 animate-ping pointer-events-none"/>
    </button>

  </div>
</template>

<style scoped>
.panel-enter-active { animation: panelIn  0.3s  cubic-bezier(.16,1,.3,1) both }
.panel-leave-active { animation: panelOut 0.18s ease both }
@keyframes panelIn  { from { opacity:0; transform:translateY(12px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }
@keyframes panelOut { from { opacity:1; transform:translateY(0) scale(1) } to { opacity:0; transform:translateY(8px) scale(0.97) } }

.notif-list-enter-active { animation: notifIn  0.28s cubic-bezier(.16,1,.3,1) both }
.notif-list-leave-active { animation: notifOut 0.18s ease both }
@keyframes notifIn  { from { opacity:0; transform:translateX(8px) }  to { opacity:1; transform:translateX(0) } }
@keyframes notifOut { from { opacity:1; transform:translateX(0) }     to { opacity:0; transform:translateX(8px) } }

.badge-enter-active { animation: badgePop 0.3s cubic-bezier(.34,1.56,.64,1) both }
.badge-leave-active { animation: badgePop 0.15s ease reverse both }
@keyframes badgePop { from { opacity:0; transform:scale(0.5) } to { opacity:1; transform:scale(1) } }

@keyframes bellShake {
  0%,100% { transform:rotate(0) }
  15%  { transform:rotate(18deg)  }
  30%  { transform:rotate(-14deg) }
  45%  { transform:rotate(10deg)  }
  60%  { transform:rotate(-6deg)  }
  75%  { transform:rotate(3deg)   }
}
.bell-shake { animation: bellShake 0.55s ease both }

.notif-item { animation: notifIn 0.28s cubic-bezier(.16,1,.3,1) both }

.notif-scroll::-webkit-scrollbar       { width: 4px }
.notif-scroll::-webkit-scrollbar-track { background: transparent }
.notif-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px }
.notif-scroll::-webkit-scrollbar-thumb:hover { background: #d1d5db }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>