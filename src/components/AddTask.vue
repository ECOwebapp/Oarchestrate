<script setup>
import { useMemberStore } from '@/stores/member'
import { usePosStore } from '@/stores/positions'
import { taskStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, onMounted, ref, watch } from 'vue'
import Icons from './Icons.vue'

const emit  = defineEmits(['close'])
const props = defineProps({
  design:  { type: Boolean, default: false },
  preFill: { type: Object,  default: null  },
})

const memberStore = useMemberStore()
const posStore    = usePosStore()
const store       = taskStore()
const auth        = useAuthStore()

const loading   = ref(false)
const subTasks  = ref([{ text: '' }])
const outputUrl = ref('')
const errorMsg  = ref('')

const newTask = ref({
  name:        '',
  description: '',
  endDate:     null,
  assignee:    null,
  type:        '',
  urgent:      false,
  design:      false,
  outputLink:  '',
})

onMounted(async () => {
  await Promise.all([
    memberStore.fetchMembers(),
    posStore.fetchMemberPos(),
    posStore.fetchPos(),
  ])
  // Apply preFill AFTER members are loaded so the <select> can match the value
  if (props.preFill) applyPreFill(props.preFill)
})

const applyPreFill = (fill) => {
  if (!fill) return
  newTask.value = {
    name:        fill.name        || '',
    description: fill.description || '',
    endDate:     fill.endDate     || null,
    assignee:    fill.assignee    || null,
    type:        fill.type        || 1,
    urgent:      fill.urgent      || false,
    design:      fill.design      || false,
    outputLink:  fill.outputLink  || '',
  }
}

// Watch in case preFill arrives after mount
watch(() => props.preFill, (fill) => {
  if (!fill) return
  if (memberStore.members.length > 0) applyPreFill(fill)
})

// ── Assignable members ────────────────────────────────────────────────────────
const assignableMembers = computed(() => {
  const allMembers   = memberStore.members || []
  const allPositions = posStore.memberPos  || []
  const POS_UNIT_HEAD = 4
  const POS_DIRECTOR  = 1
  const POS_ADMIN     = 11

  // ── Director ──────────────────────────────────────────────────────────────
  if (auth.isDirector) {
    if (Number(newTask.value.type) === 1) {
      const uhIds = new Set(
        allPositions.filter(p => Number(p.pos_id) === POS_UNIT_HEAD).map(p => p.user_id)
      )
      return allMembers
        .filter(m => uhIds.has(m.id))
        .map(m => ({ ...m, pos_name: _resolvePosName(m.id, allPositions) }))
    }
    const excludedIds = new Set(
      allPositions
        .filter(p => [POS_DIRECTOR, POS_ADMIN].includes(Number(p.pos_id)))
        .map(p => p.user_id)
    )
    return allMembers
      .filter(m => !excludedIds.has(m.id))
      .map(m => ({ ...m, pos_name: _resolvePosName(m.id, allPositions) }))
  }

  // ── Unit Head ─────────────────────────────────────────────────────────────
  if (auth.isUnitHead) {
    const uhPos  = auth.positions.find(p => p.pos_id === 4)
    const unitId = uhPos?.unit_id ?? null

    // Self entry — always first
    const selfMember = allMembers.find(m => String(m.id) === String(auth.userID))
    const uhPosName  = posStore.position.find(p => p.id === 4)?.name || 'Unit Head'
    const selfEntry  = selfMember
      ? { ...selfMember, pos_name: uhPosName, isSelf: true }
      : null

    // Unit peers (excluding self), deduped
    const seen = new Set([String(auth.userID)])
    const peers = (allPositions || [])
      .filter(p => p.unit_id === unitId && !seen.has(String(p.user_id)))
      .filter(p => { seen.add(String(p.user_id)); return true })
      .map(p => {
        const m = allMembers.find(mb => String(mb.id) === String(p.user_id))
        if (!m) return null
        return {
          ...m,
          pos_name: posStore.position.find(pos => pos.id === p.pos_id)?.name || '',
          isSelf:   false,
        }
      })
      .filter(Boolean)

    return selfEntry ? [selfEntry, ...peers] : peers
  }

  // ── Member → only themselves ──────────────────────────────────────────────
  return allMembers
    .filter(m => String(m.id) === String(auth.userID))
    .map(m => ({ ...m, pos_name: '' }))
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const _resolvePosName = (userId, allPositions) => {
  const posRow = allPositions.find(p => p.user_id === userId)
  return posStore.position.find(p => p.id === posRow?.pos_id)?.name || ''
}

const typeOptions = computed(() => {
  if (auth.isMember) return [{ id: 2, label: 'Insertion Task' }]
  return [
    { id: 1, label: 'Regular Task'   },
    { id: 2, label: 'Insertion Task' },
  ]
})

const showOutput = computed(() => auth.isMember && newTask.value.type === 2)

const memberLabel = (u) => {
  const name = [u.fname, u.middle_initial ? u.middle_initial + '.' : '', u.lname]
    .filter(Boolean).join(' ')
  return u.pos_name ? `${name} — ${u.pos_name}` : name
}

const selectedAssigneeUnit = computed(() => {
  if (!newTask.value.assignee) return null
  const pos = posStore.memberPos.find(p => p.user_id === newTask.value.assignee)
  if (!pos?.unit_id) return null
  return auth.positions.find(ap => ap.unit_id === pos.unit_id)?.unit_name || 'Unit ' + pos.unit_id
})

// ── Submit ────────────────────────────────────────────────────────────────────
const submitForm = async () => {
  errorMsg.value = ''
  loading.value  = true
  try {
    if (!newTask.value.name.trim())        throw new Error('Title is required.')
    if (!newTask.value.description.trim()) throw new Error('Description is required.')
    if (!newTask.value.type)               throw new Error('Task type is required.')
    if (!newTask.value.endDate)            throw new Error('Deadline is required.')
    if (!auth.isMember && !newTask.value.assignee)
      throw new Error('Please select an assignee.')

    const validSubs  = subTasks.value.filter(s => s.text.trim()).map(s => ({ description: s.text }))
    const assigneeId = auth.isMember ? auth.userID : newTask.value.assignee

    await store.addTasks({
      mainTask: {
        name:        newTask.value.name,
        description: newTask.value.description,
        type:        newTask.value.type,
        endDate:     newTask.value.endDate,
        urgent:      newTask.value.urgent,
        design:      props.design,
        assignee:    assigneeId,
        outputLink:  showOutput.value ? outputUrl.value : '',
      },
      subTasks: validSubs,
    })

    emit('close')
  } catch (e) {
    console.error('[AddTask] submit error:', e)
    errorMsg.value = e.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

const addSubTask    = () => subTasks.value.push({ text: '' })
const removeSubTask = (i) => subTasks.value.splice(i, 1)
</script>

<template>
  <div class="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

    <!-- Header -->
    <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100">
      <h2 class="text-xl font-bold text-gray-900">
        <template v-if="auth.isDirector">Assign a Task</template>
        <template v-else-if="auth.isUnitHead">Assign to Unit</template>
        <template v-else>Submit Insertion Task</template>
      </h2>
      <button @click="emit('close')"
        class="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
    </div>

    <!-- Body -->
    <div class="overflow-y-auto flex-1 px-7 py-5 space-y-4">

      <!-- Pre-fill info banner -->
      <div v-if="preFill"
        class="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <svg class="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-xs text-green-800">
          Pre-filled from the Director's original sub-task — you can edit any field before assigning.
        </p>
      </div>

      <!-- Title -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          Title <span class="text-red-500">*</span>
        </label>
        <input
          v-model="newTask.name"
          type="text"
          maxlength="100"
          placeholder="Task title…"
          class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                 focus:outline-none focus:border-green-800 transition-colors" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          Description <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="newTask.description"
          rows="4"
          maxlength="500"
          placeholder="Describe the task…"
          class="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm resize-none
                 focus:outline-none focus:border-green-800 transition-colors" />
        <p class="text-xs text-gray-400 mt-0.5">{{ newTask.description.length }}/500</p>
      </div>

      <!-- Type + Deadline -->
      <div class="flex gap-3">
        <div class="flex-1">
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            Type <span class="text-red-500">*</span>
          </label>
          <select
            v-model="newTask.type"
            class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                   focus:outline-none focus:border-green-800 bg-white">
            <option value="" disabled hidden>Select type</option>
            <option v-for="t in typeOptions" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            Deadline <span class="text-red-500">*</span>
          </label>
          <input
            v-model="newTask.endDate"
            type="date"
            class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                   focus:outline-none focus:border-green-800 transition-colors" />
        </div>
      </div>

      <!-- Assignee -->
      <div v-if="!auth.isMember">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          Assign To <span class="text-red-500">*</span>
        </label>

        <div v-if="memberStore.members.length === 0"
          class="w-full border-2 border-gray-200 rounded-xl h-11 px-3 flex items-center
                 text-sm text-gray-400 bg-gray-50 animate-pulse">
          Loading members…
        </div>

        <template v-else>
          <select
            v-model="newTask.assignee"
            class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                   focus:outline-none focus:border-green-800 bg-white">
            <option value="" disabled hidden>Select member</option>
            <option
              v-for="m in assignableMembers"
              :key="m.id"
              :value="m.id">
              {{ memberLabel(m) }}{{ m.isSelf ? ' (You)' : '' }}
            </option>
          </select>

          <!-- Selected assignee's unit preview -->
          <p v-if="selectedAssigneeUnit"
            class="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ selectedAssigneeUnit }}
          </p>
        </template>
      </div>

      <!-- Output link (members only) -->
      <div v-if="showOutput">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          Output Link
          <span class="text-gray-400 font-normal">(Google Drive / URL)</span>
        </label>
        <input
          v-model="outputUrl"
          type="url"
          placeholder="https://drive.google.com/…"
          class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                 focus:outline-none focus:border-green-800 transition-colors" />
      </div>

      <!-- Sub-tasks (Director only, not when pre-filling a subtask) -->
      <div v-if="auth.isDirector && !preFill">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-gray-700">Sub-tasks</label>
          <button type="button" @click="addSubTask"
            class="flex items-center gap-1 text-xs font-bold text-green-800 hover:text-green-600">
            <Icons :icon="'add'" class="w-3 h-3" /> Add
          </button>
        </div>
        <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
          <div v-for="(item, i) in subTasks" :key="i" class="flex items-start gap-2">
            <span class="text-xs text-gray-400 mt-2.5 flex-shrink-0 w-4">{{ i + 1 }}</span>
            <textarea
              v-model="item.text"
              rows="1"
              maxlength="200"
              :placeholder="`Sub-task ${i + 1}…`"
              class="flex-1 border-2 border-gray-200 rounded-lg px-2 py-1.5 text-sm resize-none
                     focus:outline-none focus:border-green-800 transition-colors" />
            <button type="button" @click="removeSubTask(i)"
              class="text-gray-300 hover:text-red-400 mt-1.5 flex-shrink-0 text-lg leading-none">×</button>
          </div>
        </div>
      </div>

      <!-- Urgent -->
      <div class="flex items-center gap-3">
        <input v-model="newTask.urgent" type="checkbox" id="urgent" class="w-4 h-4 accent-red-700" />
        <label for="urgent" class="text-sm font-semibold text-red-700">Mark as Urgent</label>
      </div>

      <!-- Approval flow note -->
      <div v-if="!auth.isDirector"
        class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <svg class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <p class="text-xs text-amber-700">
          <span v-if="auth.isUnitHead">
            This task will be sent to the Director for final approval.
          </span>
          <span v-else>
            This insertion task requires approval from your Unit Head and the Director.
          </span>
        </p>
      </div>

      <!-- Error -->
      <p v-if="errorMsg"
        class="text-xs text-red-600 font-medium bg-red-50 border border-red-200
               rounded-xl px-4 py-2.5 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"/>
        </svg>
        {{ errorMsg }}
      </p>

    </div>

    <!-- Footer -->
    <div class="flex gap-3 px-7 py-4 border-t border-gray-100">
      <button type="button" @click="emit('close')"
        class="flex-1 h-11 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm
               hover:border-green-800 hover:text-green-800 transition-colors">
        Cancel
      </button>
      <button @click="submitForm" :disabled="loading"
        class="flex-1 h-11 rounded-xl bg-green-950 text-white font-semibold text-sm
               hover:bg-green-800 active:scale-95 transition-all
               disabled:opacity-50 disabled:cursor-not-allowed
               flex items-center justify-center gap-2">
        <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
        {{ loading ? 'Saving…' : 'Submit' }}
      </button>
    </div>

  </div>
</template>