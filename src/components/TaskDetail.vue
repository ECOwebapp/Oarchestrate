<script setup>
import { taskStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps(['task'])
const emit  = defineEmits(['close', 'refresh'])
const auth  = useAuthStore()
const store = taskStore()

// ── State ──────────────────────────────────────────────────
const outputUrl       = ref(props.task?.outputLink || '')
const newOutputUrl    = ref('')
const revisionComment = ref('')
const submitting      = ref(false)
const submitError     = ref('')
const acting          = ref('')        // 'approve' | 'revise' | 'resubmit'
const tab             = ref('detail')  // 'detail' | 'comments'
const revisions       = ref([])
const loadingRevs     = ref(false)
const chatBottom      = ref(null)

// ── Load revision thread ────────────────────────────────────
const loadRevisions = async () => {
  loadingRevs.value = true
  revisions.value   = await store.fetchRevisions(props.task.id)
  loadingRevs.value = false
  await nextTick()
  chatBottom.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(loadRevisions)
watch(() => props.task?.id, () => {
  outputUrl.value       = props.task?.outputLink || ''
  newOutputUrl.value    = ''
  revisionComment.value = ''
  submitError.value     = ''
  tab.value             = 'detail'
  loadRevisions()
})

// Switch to comments tab and scroll to bottom
watch(tab, async (val) => {
  if (val === 'comments') {
    await nextTick()
    chatBottom.value?.scrollIntoView({ behavior: 'smooth' })
  }
})

const unreadCount = computed(() =>
  revisions.value.filter(r => r.to_user === auth.user?.id && !r.is_read).length
)

// ── Capabilities ────────────────────────────────────────────
const canApproveAsUnitHead = computed(() =>
  auth.isUnitHead && !props.task?.unitHead && !props.task?.director && !!props.task?.outputLink
)
const canApproveAsDirector = computed(() =>
  auth.isDirector && props.task?.unitHead && !props.task?.director && !!props.task?.outputLink
)
const canSubmitOutput = computed(() =>
  auth.isMember && !props.task?.outputLink && !props.task?.director
)
const canResubmit = computed(() =>
  auth.isMember && !!props.task?.revision && !props.task?.director
)

// Revision button only enabled when a comment is typed
const canRequestRevision = computed(() =>
  (canApproveAsUnitHead.value || canApproveAsDirector.value) && revisionComment.value.trim().length > 0
)

const isOverdue = computed(() =>
  props.task?.to && new Date(props.task.to) < new Date() && !props.task?.director
)

const statusLabel = computed(() => {
  if (props.task?.director) return { label: 'Approved by Director',    cls: 'bg-green-100 text-green-800',   icon: '✓' }
  if (props.task?.unitHead) return { label: 'Pending Director Review', cls: 'bg-amber-100 text-amber-800',   icon: '⏳' }
  if (props.task?.revision) return { label: 'Revision Requested',      cls: 'bg-orange-100 text-orange-700', icon: '↩' }
  return                           { label: 'Pending Unit Head',        cls: 'bg-gray-100  text-gray-600',   icon: '⏳' }
})

const badgeClass = (val) => ({
  ongoing:   'bg-green-800 text-white',
  approved:  'bg-blue-600 text-white',
  urgent:    'bg-red-800 text-white',
  regular:   'bg-amber-500 text-white',
  insertion: 'bg-red-800 text-white',
  revision:  'bg-purple-600 text-white',
}[val?.toLowerCase()] || 'bg-gray-200 text-gray-700')

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—'

// ── Actions ─────────────────────────────────────────────────
const approve = async () => {
  acting.value = 'approve'
  try {
    const role = auth.isDirector ? 'director' : 'unit_head'
    await store.approveTask(props.task.id, role)
    emit('refresh')
    emit('close')
  } finally { acting.value = '' }
}

const requestRevision = async () => {
  if (!revisionComment.value.trim()) return
  acting.value = 'revise'
  try {
    const role = auth.isDirector ? 'director' : 'unit_head'
    await store.requestRevision(props.task.id, revisionComment.value.trim(), role)
    revisionComment.value = ''
    await loadRevisions()
    emit('refresh')
    tab.value = 'comments'
  } finally { acting.value = '' }
}

const submitOutput = async () => {
  if (!outputUrl.value.trim()) return
  submitting.value  = true
  submitError.value = ''
  try {
    await store.submitOutput(props.task.id, outputUrl.value.trim())
    emit('refresh')
    emit('close')
  } catch (e) {
    submitError.value = e.message || 'Failed to submit. Please check your permissions.'
  } finally { submitting.value = false }
}

const resubmit = async () => {
  if (!newOutputUrl.value.trim()) return
  acting.value = 'resubmit'
  try {
    await store.resubmitTask(props.task.id, newOutputUrl.value.trim())
    newOutputUrl.value = ''
    await loadRevisions()
    emit('refresh')
    tab.value = 'comments'
  } finally { acting.value = '' }
}
</script>

<template>
  <div v-if="task"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
    @click.self="emit('close')">

    <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl
                max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">

      <!-- ── Close ── -->
      <button
        class="absolute top-3.5 right-4 w-8 h-8 flex items-center justify-center rounded-full
               text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10 text-xl leading-none"
        @click="emit('close')">×</button>

      <!-- ── Title bar ── -->
      <div class="px-6 sm:px-8 pt-7 pb-4 flex-shrink-0">
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="px-3 py-1 text-xs font-bold rounded-full" :class="badgeClass(task.type)">
            {{ task.type }}
          </span>
          <span v-if="task.urgent"
            class="px-3 py-1 text-xs font-bold rounded-full bg-red-800 text-white flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-red-300 animate-pulse" />
            Urgent
          </span>
          <span v-if="task.revision"
            class="px-3 py-1 text-xs font-bold rounded-full bg-purple-600 text-white">
            Revision
          </span>
          <span class="px-3 py-1 text-xs font-bold rounded-full" :class="statusLabel.cls">
            {{ statusLabel.icon }} {{ statusLabel.label }}
          </span>
          <span v-if="isOverdue"
            class="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
            ⚠ Overdue
          </span>
        </div>
        <h2 class="text-xl font-bold text-gray-900 leading-snug pr-8">{{ task.name }}</h2>
      </div>

      <!-- ── Tabs ── -->
      <div class="flex border-b border-gray-100 px-6 sm:px-8 flex-shrink-0 gap-1">
        <button
          v-for="t in ['detail', 'comments']" :key="t"
          @click="tab = t"
          class="relative pb-3 px-1 mr-4 text-sm font-semibold capitalize transition-colors"
          :class="tab === t ? 'text-green-900' : 'text-gray-400 hover:text-gray-600'">
          {{ t === 'comments' ? 'Comments' : 'Details' }}
          <span v-if="t === 'comments' && unreadCount"
            class="ml-1.5 px-1.5 text-[10px] font-bold rounded-full bg-red-500 text-white align-top py-0.5">
            {{ unreadCount }}
          </span>
          <span v-if="tab === t"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-900 rounded-full" />
        </button>
      </div>

      <!-- ══════════════════════════════════════════════════
           BODY
      ═══════════════════════════════════════════════════ -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden">

        <!-- ── DETAILS TAB ── -->
        <div v-if="tab === 'detail'" class="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-5">

          <!-- Description -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
            <div class="border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed bg-gray-50">
              {{ task.description || '—' }}
            </div>
          </div>

          <!-- Meta grid -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Assigned by</p>
              <div class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                <div class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center
                            text-xs font-bold text-green-800 flex-shrink-0">
                  {{ (task.assignerName || '?').charAt(0).toUpperCase() }}
                </div>
                <span class="text-xs text-gray-700 truncate">{{ task.assignerName || '—' }}</span>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Assigned to</p>
              <div class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                <div class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center
                            text-xs font-bold text-green-800 flex-shrink-0">
                  {{ (task.assigneeName || '?').charAt(0).toUpperCase() }}
                </div>
                <span class="text-xs text-gray-700 truncate">{{ task.assigneeName || '—' }}</span>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date Given</p>
              <p class="text-sm text-gray-700 font-medium">{{ fmt(task.from) }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</p>
              <p class="text-sm font-semibold" :class="isOverdue ? 'text-red-600' : 'text-gray-700'">
                {{ fmt(task.to) }}
              </p>
            </div>
          </div>

          <!-- ── OUTPUT SECTION ── -->
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Output</p>

            <!-- Has output link -->
            <div v-if="task.outputLink"
              class="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-green-50">
              <svg class="w-5 h-5 text-green-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M14.828 14.828a4 4 0 015.656 0l4-4a4 4 0 01-5.656-5.656l-1.1 1.1"/>
              </svg>
              <a :href="task.outputLink" target="_blank"
                class="text-sm text-green-800 font-semibold hover:underline truncate flex-1">
                View submitted output ↗
              </a>
            </div>

            <!-- Member: first-time submit -->
            <div v-else-if="canSubmitOutput" class="space-y-2">
              <div class="flex gap-2">
                <input v-model="outputUrl" type="url"
                  placeholder="Paste your Google Drive / output URL…"
                  class="flex-1 border-2 rounded-xl h-11 px-3 text-sm transition-colors focus:outline-none"
                  :class="submitError
                    ? 'border-red-400 bg-red-50 focus:border-red-500'
                    : 'border-gray-300 focus:border-green-800'" />
                <button @click="submitOutput"
                  :disabled="submitting || !outputUrl.trim()"
                  class="h-11 px-5 rounded-xl bg-green-950 text-white text-sm font-bold
                         hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95
                         flex items-center gap-2 flex-shrink-0">
                  <svg v-if="submitting" class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
                  </svg>
                  {{ submitting ? 'Submitting…' : 'Submit' }}
                </button>
              </div>
              <p v-if="submitError" class="text-xs text-red-600 font-medium flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"/>
                </svg>
                {{ submitError }}
              </p>
            </div>

            <!-- Member: resubmit after revision -->
            <div v-else-if="canResubmit" class="space-y-3">
              <!-- Revision comment banner -->
              <div v-if="task.revisionComment"
                class="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <svg class="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-orange-700 mb-0.5">What needs to be revised:</p>
                  <p class="text-xs text-orange-800 leading-relaxed">{{ task.revisionComment }}</p>
                </div>
              </div>
              <!-- Resubmit input -->
              <div class="flex gap-2">
                <input v-model="newOutputUrl" type="url"
                  placeholder="Paste your revised output URL…"
                  class="flex-1 border-2 border-orange-200 rounded-xl h-11 px-3 text-sm
                         focus:outline-none focus:border-orange-500 transition-colors bg-orange-50" />
                <button @click="resubmit"
                  :disabled="acting === 'resubmit' || !newOutputUrl.trim()"
                  class="h-11 px-5 rounded-xl bg-orange-600 text-white text-sm font-bold
                         hover:bg-orange-500 disabled:opacity-40 transition-all active:scale-95
                         flex items-center gap-2 flex-shrink-0">
                  <svg v-if="acting === 'resubmit'" class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
                  </svg>
                  {{ acting === 'resubmit' ? 'Resubmitting…' : 'Resubmit' }}
                </button>
              </div>
            </div>

            <!-- No output yet (viewer, not member) -->
            <div v-else
              class="border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-400 text-center">
              No output submitted yet
            </div>
          </div>

          <!-- ── SUBTASKS ── -->
          <div v-if="task.subtasks?.length">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Sub-tasks <span class="normal-case font-normal">({{ task.subtasks.length }})</span>
            </p>
            <div class="space-y-2">
              <div v-for="(sub, i) in task.subtasks" :key="i"
                class="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5 bg-white">
                <span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center
                             text-white text-[10px] font-bold"
                  :class="sub.director ? 'bg-green-700' : 'bg-gray-300'">
                  {{ i + 1 }}
                </span>
                <p class="flex-1 text-sm text-gray-700 leading-snug min-w-0">{{ sub.name }}</p>
                <a v-if="sub.outputLink" :href="sub.outputLink" target="_blank"
                  class="text-xs text-green-800 font-semibold hover:underline flex-shrink-0 ml-2">
                  ↗ View
                </a>
                <span v-if="sub.director" class="text-xs text-green-700 font-bold flex-shrink-0">✓</span>
              </div>
            </div>
          </div>

          <!-- ── REVISION NOTES (unit head / director) ── -->
          <div v-if="canApproveAsUnitHead || canApproveAsDirector">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Revision Notes
              <span class="ml-1.5 text-gray-400 font-normal normal-case"
                :class="revisionComment.trim() ? 'text-green-700' : ''">
                {{ revisionComment.trim() ? '— ready to send' : '— required to request revision' }}
              </span>
            </p>
            <textarea v-model="revisionComment" rows="3" maxlength="500"
              placeholder="Describe what needs to be revised before you can approve…"
              class="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none
                     focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
              :class="revisionComment.trim() ? 'border-amber-300 bg-amber-50' : ''" />
            <p class="text-right text-[10px] text-gray-400 mt-1">{{ revisionComment.length }}/500</p>
          </div>

        </div>

        <!-- ── COMMENTS TAB ── -->
        <div v-else class="flex-1 flex flex-col min-h-0">

          <!-- Chat thread -->
          <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-4">

            <!-- Loading -->
            <div v-if="loadingRevs" class="flex justify-center py-12">
              <svg class="animate-spin w-5 h-5 text-green-700" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#d1fae5" stroke-width="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>

            <!-- Empty state -->
            <div v-else-if="!revisions.length"
              class="flex flex-col items-center justify-center py-14 text-center text-gray-400">
              <svg class="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              <p class="text-sm font-semibold">No comments yet</p>
              <p class="text-xs mt-1 max-w-[200px] leading-relaxed">
                Revision notes and approval messages will appear here
              </p>
            </div>

            <!-- Chat bubbles -->
            <template v-else>
              <div v-for="rev in revisions" :key="rev.id"
                class="flex gap-3"
                :class="rev.from_user === auth.user?.id ? 'flex-row-reverse' : ''">

                <!-- Avatar -->
                <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                            text-xs font-bold text-white self-end mb-1"
                  :class="rev.role === 'director' ? 'bg-green-900' : 'bg-amber-600'">
                  {{ (rev.fromName || '?')[0].toUpperCase() }}
                </div>

                <div class="max-w-[72%] min-w-0 space-y-1"
                  :class="rev.from_user === auth.user?.id ? 'items-end flex flex-col' : ''">
                  <div class="flex items-center gap-2 flex-wrap"
                    :class="rev.from_user === auth.user?.id ? 'flex-row-reverse' : ''">
                    <span class="text-xs font-bold text-gray-700 truncate">{{ rev.fromName }}</span>
                    <span class="text-[10px] text-gray-400">
                      {{ new Date(rev.created_at).toLocaleDateString('en-PH', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      }) }}
                    </span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      :class="rev.role === 'director'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-700'">
                      {{ rev.role === 'director' ? 'Director' : 'Unit Head' }}
                    </span>
                  </div>
                  <div class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words"
                    :class="rev.from_user === auth.user?.id
                      ? 'bg-green-900 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'">
                    {{ rev.comment }}
                  </div>
                </div>
              </div>
              <!-- Scroll anchor -->
              <div ref="chatBottom" />
            </template>

          </div>

          <!-- Member resubmit bar (sticky at bottom of comments) -->
          <div v-if="canResubmit"
            class="flex-shrink-0 px-6 sm:px-8 py-3 border-t border-gray-100 bg-orange-50 space-y-1.5">
            <p class="text-xs font-bold text-orange-700 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Revision requested — submit your updated output:
            </p>
            <div class="flex gap-2">
              <input v-model="newOutputUrl" type="url" placeholder="Paste revised output URL…"
                class="flex-1 border-2 border-orange-200 rounded-xl h-10 px-3 text-sm
                       focus:outline-none focus:border-orange-500 transition-colors bg-white" />
              <button @click="resubmit"
                :disabled="acting === 'resubmit' || !newOutputUrl.trim()"
                class="h-10 px-4 rounded-xl bg-orange-600 text-white text-sm font-bold
                       hover:bg-orange-500 disabled:opacity-40 transition-all active:scale-95">
                {{ acting === 'resubmit' ? 'Resubmitting…' : 'Resubmit' }}
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- ══════════════════════════════════════════════════
           FOOTER ACTIONS
      ═══════════════════════════════════════════════════ -->
      <div class="flex gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 flex-shrink-0 bg-white">

        <!-- Unit head -->
        <template v-if="canApproveAsUnitHead">
          <button @click="requestRevision"
            :disabled="acting !== '' || !canRequestRevision"
            :title="!revisionComment.trim() ? 'Write revision notes above first' : ''"
            class="flex-1 h-11 rounded-xl border-2 border-amber-400 text-amber-600 font-bold text-sm
                   hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
            {{ acting === 'revise' ? 'Sending…' : 'Request Revision' }}
          </button>
          <button @click="approve" :disabled="acting !== ''"
            class="flex-1 h-11 rounded-xl bg-green-950 text-white font-bold text-sm
                   hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95
                   flex items-center justify-center gap-2">
            <svg v-if="acting === 'approve'" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
            {{ acting === 'approve' ? 'Approving…' : 'Approve & Send to Director' }}
          </button>
        </template>

        <!-- Director -->
        <template v-else-if="canApproveAsDirector">
          <button @click="requestRevision"
            :disabled="acting !== '' || !canRequestRevision"
            :title="!revisionComment.trim() ? 'Write revision notes above first' : ''"
            class="flex-1 h-11 rounded-xl border-2 border-amber-400 text-amber-600 font-bold text-sm
                   hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95">
            {{ acting === 'revise' ? 'Sending…' : 'Send for Revision' }}
          </button>
          <button @click="approve" :disabled="acting !== ''"
            class="flex-1 h-11 rounded-xl bg-green-950 text-white font-bold text-sm
                   hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95
                   flex items-center justify-center gap-2">
            <svg v-if="acting === 'approve'" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
            {{ acting === 'approve' ? 'Approving…' : 'Final Approve' }}
          </button>
        </template>

        <!-- Fully approved -->
        <template v-else-if="task.director">
          <div class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-green-50 border border-green-200">
            <svg class="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="text-sm font-bold text-green-700">Fully Approved</span>
          </div>
        </template>

        <!-- Close (member or pending states) -->
        <template v-else>
          <button @click="emit('close')"
            class="flex-1 h-11 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm
                   hover:border-green-800 hover:text-green-800 transition-colors active:scale-95">
            Close
          </button>
        </template>

      </div>
    </div>
  </div>
</template>