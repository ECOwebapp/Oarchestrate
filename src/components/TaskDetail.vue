<script setup>
import { uploadOutputFile } from '@/lib/uploadOutput'
import { taskStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMemberStore } from '@/stores/member'
import { usePosStore } from '@/stores/positions'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps(['task'])
const emit  = defineEmits(['close', 'refresh', 'assignSubtask'])
const auth        = useAuthStore()
const store       = taskStore()
const memberStore = useMemberStore()
const posStore    = usePosStore()

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

// ── Subtask assignment state (Unit Head only) ─────────────
const openDropdownId = ref(null)   // subtask id whose member dropdown is open

// ── Upload state ──────────────────────────────────────────
const uploadFile      = ref(null)
const resubmitFile    = ref(null)
const uploadProgress  = ref(0)
const dragOverSubmit  = ref(false)
const dragOverResub   = ref(false)
const fileInputRef    = ref(null)
const resubInputRef   = ref(null)

const formatBytes = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024)    return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

const onDropSubmit = (e) => {
  dragOverSubmit.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) { uploadFile.value = f; submitError.value = '' }
}
const onDropResub = (e) => {
  dragOverResub.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) { resubmitFile.value = f; submitError.value = '' }
}
const onFilePickSubmit = (e) => {
  const f = e.target?.files?.[0]
  if (f) { uploadFile.value = f; submitError.value = '' }
}
const onFilePickResub = (e) => {
  const f = e.target?.files?.[0]
  if (f) { resubmitFile.value = f; submitError.value = '' }
}

// ── Load revision thread ────────────────────────────────────
const loadRevisions = async () => {
  loadingRevs.value = true
  revisions.value   = await store.fetchRevisions(props.task.id)
  loadingRevs.value = false
  await nextTick()
  chatBottom.value?.scrollIntoView({ behavior: 'smooth' })
}

watch(() => props.task?.id, () => {
  outputUrl.value       = props.task?.outputLink || ''
  newOutputUrl.value    = ''
  revisionComment.value = ''
  submitError.value     = ''
  tab.value             = 'detail'
  openDropdownId.value = null
  loadRevisions()
})

watch(tab, async (val) => {
  if (val === 'comments') {
    await nextTick()
    chatBottom.value?.scrollIntoView({ behavior: 'smooth' })
  }
})

const unreadCount = computed(() =>
  revisions.value.filter(r => r.to_user === auth.user?.id && !r.is_read).length
)

// ── Subtask helpers (Unit Head) ─────────────────────────────
// A subtask is "unassigned" when its assignee is the Unit Head themselves
// (Director assigned it to the UH as a placeholder) or assignee is null.
const isSubtaskUnassigned = (sub) => {
  if (!sub.assignee) return true
  // If the subtask assignee is the unit head viewing this, it's still unassigned
  return sub.assignee === auth.userID
}

// ── Unit members for subtask dropdown ────────────────────────
// Built from posStore.memberPos (position_of_members view) + memberStore.members.
// Finds the UH's unit_id from auth.positions, then returns all members in that unit
// excluding the UH themselves. No RPC call needed.
const unitMembersForAssign = computed(() => {
  if (!auth.isUnitHead) return []

  // Get the UH's unit_id — pos_id 4 = Unit Head (integer in DB)
  const uhPos  = auth.positions.find(p => p.pos_id === 4)
  const unitId = uhPos?.unit_id ?? null
  if (!unitId) return []

  // All position rows for this unit, excluding the UH themselves
  const unitRows = (posStore.memberPos || []).filter(p =>
    p.unit_id === unitId &&
    String(p.user_id) !== String(auth.userID)
  )

  // Map to member details, then deduplicate by user_id.
  // A member can have multiple position rows — we keep only their first entry.
  const seen = new Set()
  return unitRows
    .map(p => {
      const m = (memberStore.members || []).find(mb => String(mb.id) === String(p.user_id))
      if (!m) return null
      const posName = (posStore.position || []).find(pos => pos.id === p.pos_id)?.name || ''
      return {
        id:             m.id,
        fname:          m.fname          || '',
        lname:          m.lname          || '',
        middle_initial: m.middle_initial || '',
        pos_name:       posName,
      }
    })
    .filter(Boolean)
    .filter(u => u.fname || u.lname)
    .filter(u => {
      const key = String(u.id)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
})

// Toggle the member-picker dropdown for a subtask row
const toggleDropdown = (sub) => {
  openDropdownId.value = openDropdownId.value === sub.id ? null : sub.id
}

// Member selected from dropdown -> emit up to Tasks.vue to open AddTask modal
const pickMemberAndAssign = (sub, member) => {
  openDropdownId.value = null
  emit('assignSubtask', {
    subtask:            sub,
    assignedMemberId:   member.id,
    assignedMemberName: [member.fname, member.middle_initial ? member.middle_initial + '.' : '', member.lname].filter(Boolean).join(' '),
    parentTask:         props.task,
  })
}

// Close dropdown on outside click
const handleOutsideClick = (e) => {
  if (!e.target.closest('[data-dropdown]')) openDropdownId.value = null
}

onMounted(async () => {
  loadRevisions()
  if (auth.isUnitHead) {
    // Fetch member names and position rows for the unit member dropdown
    await Promise.all([
      memberStore.fetchMembers(),
      posStore.fetchMemberPos(),
      posStore.fetchPos(),
    ])
  }
  document.addEventListener('click', handleOutsideClick)
})
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

// ── Capabilities ────────────────────────────────────────────
const canApproveAsUnitHead = computed(() => {
  if (!auth.isUnitHead)             return false
  if (props.task?.isOwnTask)        return false
  if (props.task?.unitHead)         return false
  if (props.task?.director)         return false
  if (!props.task?.outputLink)      return false
  if (props.task?.assigneeIsOffice) return false
  return true
})

const canApproveAsDirector = computed(() =>
  auth.isDirector && !props.task?.director && !!props.task?.outputLink
)
const canSubmitOutput = computed(() =>
  (auth.isMember || (auth.isUnitHead && props.task?.isOwnTask)) &&
  !props.task?.outputLink && !props.task?.director
)
const canResubmit = computed(() =>
  (auth.isMember || (auth.isUnitHead && props.task?.isOwnTask)) &&
  !!props.task?.revision && !props.task?.director
)
const canRequestRevision = computed(() =>
  (canApproveAsUnitHead.value || canApproveAsDirector.value) && revisionComment.value.trim().length > 0
)
const isOverdue = computed(() =>
  props.task?.to && new Date(props.task.to) < new Date() && !props.task?.director
)

// Unit Head can assign subtasks on tasks assigned TO them by the Director.
// String-coerce both sides — Supabase UUID vs auth store ID can differ in type.
const canAssignSubtasks = computed(() =>
  auth.isUnitHead &&
  String(props.task?.assignee) === String(auth.userID) &&
  !props.task?.director &&
  !!props.task?.subtasks?.length
)

const statusLabel = computed(() => {
  if (props.task?.director)  return { label: 'Approved by Director',    cls: 'bg-green-100 text-green-800',   icon: '✓' }
  if (props.task?.unitHead)  return { label: 'Pending Director Review', cls: 'bg-amber-100 text-amber-800',   icon: '⏳' }
  if (props.task?.revision)  return { label: 'Revision Requested',      cls: 'bg-orange-100 text-orange-700', icon: '↩' }
  if (props.task?.assigneeIsOffice && props.task?.outputLink)
                             return { label: 'Pending Director Review', cls: 'bg-amber-100 text-amber-800',   icon: '⏳' }
  return                            { label: 'Pending Approval',        cls: 'bg-gray-100 text-gray-600',     icon: '⏳' }
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
  if (!uploadFile.value) return
  submitting.value = true
  submitError.value = ''
  uploadProgress.value = 0
  try {
    const result = await uploadOutputFile({
      file: uploadFile.value,
      onProgress: (p) => { uploadProgress.value = p }
    })
    await store.submitOutput(props.task.id, result.fileUrl)
    emit('refresh')
    emit('close')
  } catch (err) {
    submitError.value = err.message || 'Upload failed. Please try again.'
  } finally {
    submitting.value = false
    uploadProgress.value = 0
  }
}

const resubmit = async () => {
  if (!resubmitFile.value) return
  acting.value = 'resubmit'
  submitError.value = ''
  uploadProgress.value = 0
  try {
    const result = await uploadOutputFile({
      file: resubmitFile.value,
      onProgress: (p) => { uploadProgress.value = p }
    })
    await store.resubmitTask(props.task.id, result.fileUrl)
    resubmitFile.value = null
    uploadProgress.value = 0
    await loadRevisions()
    emit('refresh')
    tab.value = 'comments'
  } catch (err) {
    submitError.value = err.message || 'Upload failed. Please try again.'
  } finally {
    acting.value = ''
    uploadProgress.value = 0
  }
}
</script>

<template>
  <div v-if="task"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
    @click.self="emit('close')">

    <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl
                max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden">

      <!-- Close -->
      <button
        class="absolute top-3.5 right-4 w-8 h-8 flex items-center justify-center rounded-full
               text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10 text-xl leading-none"
        @click="emit('close')">×</button>

      <!-- Title bar -->
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

      <!-- Tabs -->
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

      <!-- BODY -->
      <div class="flex-1 min-h-0 flex flex-col overflow-hidden">

        <!-- DETAILS TAB -->
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

          <!-- OUTPUT SECTION -->
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
            <div v-else-if="canSubmitOutput" class="space-y-2.5">
              <input ref="fileInputRef" type="file" class="hidden" @change="onFilePickSubmit" />
              <div v-if="!uploadFile"
                @dragover.prevent="dragOverSubmit = true"
                @dragleave.prevent="dragOverSubmit = false"
                @drop.prevent="onDropSubmit"
                @click="fileInputRef?.click()"
                class="border-2 border-dashed rounded-2xl px-5 py-7 flex flex-col items-center
                       justify-center gap-2 cursor-pointer transition-all select-none"
                :class="dragOverSubmit ? 'border-green-700 bg-green-50'
                  : submitError ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-gray-50 hover:border-green-700 hover:bg-green-50'">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                  :class="dragOverSubmit ? 'bg-green-100' : 'bg-white border border-gray-200'">
                  <svg class="w-5 h-5" :class="dragOverSubmit ? 'text-green-700' : 'text-gray-400'"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <p class="text-sm font-semibold text-gray-700">
                  {{ dragOverSubmit ? 'Drop to attach' : 'Drop file here or click to browse' }}
                </p>
                <p class="text-xs text-gray-400">Any file type · stored securely</p>
              </div>
              <div v-else class="flex items-center gap-3 border-2 border-green-200 bg-green-50 rounded-2xl px-4 py-3">
                <div class="w-9 h-9 rounded-xl bg-white border border-green-200 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{{ uploadFile.name }}</p>
                  <p class="text-xs text-gray-400">{{ formatBytes(uploadFile.size) }}</p>
                </div>
                <button @click="uploadFile = null; fileInputRef && (fileInputRef.value = '')"
                  class="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0">×</button>
              </div>
              <div v-if="submitting" class="space-y-1">
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-green-700 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }" />
                </div>
                <p class="text-xs text-gray-500 text-right">
                  {{ uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Saving…' }}
                </p>
              </div>
              <p v-if="submitError" class="text-xs text-red-600 font-medium flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"/>
                </svg>
                {{ submitError }}
              </p>
              <button @click="submitOutput" :disabled="submitting || !uploadFile"
                class="w-full h-11 rounded-xl bg-green-950 text-white text-sm font-bold
                       hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95
                       flex items-center justify-center gap-2">
                <svg v-if="submitting" class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
                {{ submitting ? (uploadProgress < 100 ? `Uploading ${uploadProgress}%…` : 'Saving…') : 'Upload & Submit' }}
              </button>
            </div>

            <!-- Member: resubmit after revision -->
            <div v-else-if="canResubmit" class="space-y-2.5">
              <input ref="resubInputRef" type="file" class="hidden" @change="onFilePickResub" />
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
              <div v-if="!resubmitFile"
                @dragover.prevent="dragOverResub = true"
                @dragleave.prevent="dragOverResub = false"
                @drop.prevent="onDropResub"
                @click="resubInputRef?.click()"
                class="border-2 border-dashed rounded-2xl px-5 py-7 flex flex-col items-center
                       justify-center gap-2 cursor-pointer transition-all select-none"
                :class="dragOverResub ? 'border-orange-500 bg-orange-50'
                  : 'border-orange-200 bg-orange-50/50 hover:border-orange-400 hover:bg-orange-50'">
                <div class="w-10 h-10 rounded-xl bg-white border border-orange-200 flex items-center justify-center">
                  <svg class="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <p class="text-sm font-semibold text-orange-700">
                  {{ dragOverResub ? 'Drop to attach' : 'Drop revised file here or click to browse' }}
                </p>
                <p class="text-xs text-orange-400">Replaces your previous submission</p>
              </div>
              <div v-else class="flex items-center gap-3 border-2 border-orange-200 bg-orange-50 rounded-2xl px-4 py-3">
                <div class="w-9 h-9 rounded-xl bg-white border border-orange-200 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800 truncate">{{ resubmitFile.name }}</p>
                  <p class="text-xs text-gray-400">{{ formatBytes(resubmitFile.size) }}</p>
                </div>
                <button @click="resubmitFile = null; resubInputRef && (resubInputRef.value = '')"
                  class="text-gray-300 hover:text-red-400 transition-colors text-xl leading-none flex-shrink-0">×</button>
              </div>
              <div v-if="acting === 'resubmit'" class="space-y-1">
                <div class="h-2 bg-orange-100 rounded-full overflow-hidden">
                  <div class="h-full bg-orange-500 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }" />
                </div>
                <p class="text-xs text-orange-500 text-right">
                  {{ uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : 'Saving…' }}
                </p>
              </div>
              <p v-if="submitError" class="text-xs text-red-600 font-medium flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"/>
                </svg>
                {{ submitError }}
              </p>
              <button @click="resubmit" :disabled="acting === 'resubmit' || !resubmitFile"
                class="w-full h-11 rounded-xl bg-orange-600 text-white text-sm font-bold
                       hover:bg-orange-500 disabled:opacity-40 transition-all active:scale-95
                       flex items-center justify-center gap-2">
                <svg v-if="acting === 'resubmit'" class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
                </svg>
                {{ acting === 'resubmit'
                  ? (uploadProgress < 100 ? `Uploading ${uploadProgress}%…` : 'Saving…')
                  : 'Upload & Resubmit' }}
              </button>
            </div>

            <!-- No output yet (viewer, not member) -->
            <div v-else
              class="border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-400 text-center">
              No output submitted yet
            </div>
          </div>

          <!-- ── SUBTASKS ── -->
          <div v-if="task.subtasks?.length">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sub-tasks
                <span class="normal-case font-normal">({{ task.subtasks.length }})</span>
              </p>
              <!-- Unit Head hint -->
              <span v-if="canAssignSubtasks"
                class="text-[10px] text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                Click Assign to delegate
              </span>
            </div>
            <div class="space-y-2">
              <div v-for="(sub, i) in task.subtasks" :key="sub.id ?? i"
                class="flex items-center gap-3 border rounded-xl px-4 py-2.5 bg-white transition-colors"
                :class="sub.director ? 'border-green-200 bg-green-50/40'
                  : isSubtaskUnassigned(sub) && canAssignSubtasks ? 'border-amber-200 bg-amber-50/40'
                  : 'border-gray-200'">

                <!-- Step number -->
                <span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center
                             text-white text-[10px] font-bold"
                  :class="sub.director ? 'bg-green-700'
                    : sub.outputLink ? 'bg-amber-500'
                    : isSubtaskUnassigned(sub) ? 'bg-gray-300'
                    : 'bg-green-900'">
                  {{ i + 1 }}
                </span>

                <!-- Subtask info -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-700 leading-snug truncate">{{ sub.name }}</p>
                  <!-- Assignee pill -->
                  <div class="flex items-center gap-1.5 mt-0.5">
                    <span v-if="sub.assigneeName && !isSubtaskUnassigned(sub)"
                      class="text-[10px] text-gray-500 flex items-center gap-1">
                      <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                      </svg>
                      {{ sub.assigneeName }}
                    </span>
                    <span v-else-if="isSubtaskUnassigned(sub)"
                      class="text-[10px] text-amber-600 font-semibold">
                      Unassigned
                    </span>
                    <!-- Status micro-badge -->
                    <span v-if="sub.director"
                      class="text-[10px] text-green-700 font-bold">✓ Approved</span>
                    <span v-else-if="sub.unitHead"
                      class="text-[10px] text-amber-600 font-semibold">Pending Director</span>
                    <span v-else-if="sub.outputLink"
                      class="text-[10px] text-blue-600 font-semibold">Output submitted</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-2 flex-shrink-0">
                  <!-- View output -->
                  <a v-if="sub.outputLink" :href="sub.outputLink" target="_blank"
                    class="text-xs text-green-800 font-semibold hover:underline flex-shrink-0">
                    ↗ View
                  </a>

                  <!-- Approved check -->
                  <span v-if="sub.director" class="text-xs text-green-700 font-bold flex-shrink-0">✓</span>

                  <!-- Assign / Reassign dropdown (Unit Head only) -->
                  <div
                    v-if="canAssignSubtasks && !sub.director"
                    class="relative"
                    data-dropdown>

                    <!-- Trigger button -->
                    <button
                      @click.stop="toggleDropdown(sub)"
                      class="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg
                             transition-all active:scale-95"
                      :class="isSubtaskUnassigned(sub)
                        ? 'bg-green-950 text-white hover:bg-green-800'
                        : 'border-2 border-gray-300 text-gray-500 hover:border-green-800 hover:text-green-800'">
                      {{ isSubtaskUnassigned(sub) ? 'Assign' : 'Reassign' }}
                      <svg class="w-3 h-3 transition-transform duration-150"
                        :class="openDropdownId === sub.id ? 'rotate-180' : ''"
                        viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </button>

                    <!-- Member dropdown list -->
                    <Transition
                      enter-active-class="transition duration-100 ease-out"
                      enter-from-class="opacity-0 scale-95 -translate-y-1"
                      enter-to-class="opacity-100 scale-100 translate-y-0"
                      leave-active-class="transition duration-75 ease-in"
                      leave-from-class="opacity-100 scale-100 translate-y-0"
                      leave-to-class="opacity-0 scale-95 -translate-y-1">
                      <div
                        v-if="openDropdownId === sub.id"
                        class="absolute right-0 top-full mt-1 z-30 min-w-[160px] max-w-[220px]
                               bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">

                        <!-- Header -->
                        <div class="px-3 py-2 border-b border-gray-100 bg-gray-50">
                          <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            Assign to
                          </p>
                        </div>

                        <!-- Empty state -->
                        <div v-if="!unitMembersForAssign.length"
                          class="px-3 py-3 text-xs text-gray-400 text-center">
                          No members found
                        </div>

                        <!-- Member list -->
                        <button
                          v-for="member in unitMembersForAssign"
                          :key="member.id"
                          @click.stop="pickMemberAndAssign(sub, member)"
                          class="w-full flex items-center gap-2.5 px-3 py-2.5 text-left
                                 hover:bg-green-50 transition-colors group">
                          <!-- Avatar initial -->
                          <div class="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                                      text-[11px] font-bold text-white bg-green-900 uppercase">
                            {{ (member.fname || '?')[0] }}{{ (member.lname || '')[0] }}
                          </div>
                          <!-- Full name only -->
                          <p class="flex-1 min-w-0 text-xs font-semibold text-gray-800 truncate group-hover:text-green-900">
                            {{ member.fname }}{{ member.middle_initial ? ' ' + member.middle_initial + '.' : '' }} {{ member.lname }}
                          </p>
                          <!-- Currently assigned checkmark -->
                          <svg v-if="sub.assignee === member.id"
                            class="w-3.5 h-3.5 text-green-700 flex-shrink-0"
                            viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        </button>

                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- REVISION NOTES (unit head / director) -->
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

        <!-- COMMENTS TAB -->
        <div v-else class="flex-1 flex flex-col min-h-0">
          <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-4">
            <div v-if="loadingRevs" class="flex justify-center py-12">
              <svg class="animate-spin w-5 h-5 text-green-700" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#d1fae5" stroke-width="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
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
            <template v-else>
              <div v-for="rev in revisions" :key="rev.id"
                class="flex gap-3"
                :class="rev.from_user === auth.user?.id ? 'flex-row-reverse' : ''">
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
                      :class="rev.role === 'director' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-700'">
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
              <div ref="chatBottom" />
            </template>
          </div>

          <!-- Member resubmit bar (sticky at bottom of comments) -->
          <div v-if="canResubmit"
            class="flex-shrink-0 px-6 sm:px-8 py-3 border-t border-gray-100 bg-orange-50 space-y-2">
            <p class="text-xs font-bold text-orange-700 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Revision requested — upload your revised file:
            </p>
            <div class="flex items-center gap-2">
              <input ref="resubInputRef" type="file" class="hidden" @change="onFilePickResub" />
              <button @click="resubInputRef?.click()"
                class="flex items-center gap-2 h-9 px-3 rounded-xl border-2 border-orange-200
                       bg-white text-orange-700 text-xs font-bold hover:border-orange-400 transition-colors flex-shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                Choose file
              </button>
              <span class="flex-1 text-xs text-gray-500 truncate">
                {{ resubmitFile ? resubmitFile.name : 'No file chosen' }}
              </span>
              <button v-if="resubmitFile" @click="resubmitFile = null"
                class="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0 transition-colors">×</button>
            </div>
            <div v-if="acting === 'resubmit'" class="h-1.5 bg-orange-100 rounded-full overflow-hidden">
              <div class="h-full bg-orange-500 rounded-full transition-all duration-300"
                :style="{ width: uploadProgress + '%' }" />
            </div>
            <button @click="resubmit" :disabled="acting === 'resubmit' || !resubmitFile"
              class="w-full h-9 rounded-xl bg-orange-600 text-white text-xs font-bold
                     hover:bg-orange-500 disabled:opacity-40 transition-all active:scale-95
                     flex items-center justify-center gap-1.5">
              <svg v-if="acting === 'resubmit'" class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
              </svg>
              {{ acting === 'resubmit'
                ? (uploadProgress < 100 ? `Uploading ${uploadProgress}%…` : 'Saving…')
                : 'Upload & Resubmit' }}
            </button>
          </div>
        </div>
      </div>

      <!-- FOOTER ACTIONS -->
      <div class="flex gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
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
        <template v-else-if="task.director">
          <div class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-green-50 border border-green-200">
            <svg class="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="text-sm font-bold text-green-700">Fully Approved</span>
          </div>
        </template>
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

<style scoped>
.modal-enter-active { animation: modalIn  0.25s cubic-bezier(.16,1,.3,1) both }
.modal-leave-active { animation: modalOut 0.15s ease both }
@keyframes modalIn  { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }
@keyframes modalOut { from { opacity:1 } to { opacity:0; transform:scale(0.97) } }
</style>