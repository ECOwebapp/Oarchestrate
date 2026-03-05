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
  if (n.type === 'registration')                    return 'bg-blue-100 text-blue-700'
  if (n.type === 'task_submitted' && n.meta?.urgent) return 'bg-red-100 text-red-700'
  if (n.type === 'task_submitted')                  return 'bg-green-100 text-green-700'
  if (n.type === 'poke')                            return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}
const dotClass = (n) => {
  if (!n.read) {
    if (n.type === 'registration')                    return 'bg-blue-500'
    if (n.type === 'task_submitted' && n.meta?.urgent) return 'bg-red-500'
    if (n.type === 'task_submitted')                  return 'bg-green-600'
    if (n.type === 'poke')                            return 'bg-amber-500'
  }
  return 'bg-gray-200'
}
const itemBg = (n) => {
  if (n.type === 'registration')                    return 'bg-blue-50 border-blue-100'
  if (n.type === 'task_submitted' && n.meta?.urgent) return 'bg-red-50 border-red-100'
  if (n.type === 'task_submitted')                  return 'bg-green-50 border-green-100'
  if (n.type === 'poke')                            return 'bg-amber-50 border-amber-100'
  return 'bg-gray-50 border-gray-100'
}
const labelText = (n) => {
  if (n.type === 'registration')                    return 'New User'
  if (n.type === 'task_submitted' && n.meta?.urgent) return 'Urgent Task'
  if (n.type === 'task_submitted')                  return 'Task'
  if (n.type === 'poke')                            return 'Follow-up'
  return 'Notification'
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
        <div class="overflow-y-auto notif-scroll" style="max-height:460px">

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
                v-for="(n, i) in notifStore.visible" :key="n.id"
                class="notif-item mx-2 mb-2 rounded-xl border overflow-hidden transition-opacity duration-200"
                :class="[itemBg(n), !n.read ? 'shadow-sm' : 'opacity-60']"
                :style="`animation-delay:${i*25}ms`">

                <!-- ── REGISTRATION ITEM ── -->
                <template v-if="n.type === 'registration'">
                  <div class="px-3 pt-3 pb-2">
                    <div class="flex items-start gap-2.5">
                      <span class="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" :class="dotClass(n)"/>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-2 mb-1">
                          <span class="text-xs font-bold px-1.5 py-0.5 rounded-md" :class="badgeClass(n)">
                            New User
                          </span>
                          <span class="text-xs text-gray-400 flex-shrink-0">{{ timeAgo(n.time) }}</span>
                        </div>
                        <p class="text-xs font-bold text-gray-800">{{ n.title }}</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ n.position }}</p>
                        <p class="text-xs text-gray-400 mt-0.5 leading-snug">{{ n.body }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Approve / Deny actions -->
                  <div class="flex gap-2 px-3 pb-3">
                    <button
                      @click="notifStore.denyUser(n.userId)"
                      :disabled="isActing(n)"
                      class="flex-1 py-1.5 rounded-lg border-2 border-red-300 text-red-600
                             text-xs font-bold hover:bg-red-50 transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1">
                      <svg v-if="n.status === 'denying'" class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.3" stroke-width="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                      </svg>
                      {{ n.status === 'denying' ? 'Denying…' : '✕ Deny' }}
                    </button>
                    <button
                      @click="notifStore.approveUser(n.userId)"
                      :disabled="isActing(n)"
                      class="flex-1 py-1.5 rounded-lg bg-green-800 text-white
                             text-xs font-bold hover:bg-green-700 transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1">
                      <svg v-if="n.status === 'approving'" class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
                      </svg>
                      {{ n.status === 'approving' ? 'Approving…' : '✓ Approve' }}
                    </button>
                  </div>
                </template>

                <!-- ── ALL OTHER ITEMS ── -->
                <template v-else>
                  <div class="px-3 py-2.5 flex items-start gap-2.5">
                    <span class="w-2 h-2 rounded-full flex-shrink-0 mt-1" :class="dotClass(n)"/>
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

      <!-- Pulse ring -->
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