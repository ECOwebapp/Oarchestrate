<script setup>
import { taskStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, ref } from 'vue'

const props = defineProps(['task'])
const emit  = defineEmits(['close'])
const auth  = useAuthStore()
const store = taskStore()

const outputUrl   = ref(props.task?.outputLink || '')
const submitting  = ref(false)
const acting      = ref('')  // 'approve' | 'revise'

// ── Capabilities ──
const canApproveAsUnitHead = computed(() =>
  auth.isUnitHead && !props.task?.unitHead && props.task?.assignee !== auth.userID
)
const canApproveAsDirector = computed(() =>
  auth.isDirector && props.task?.unitHead && !props.task?.director
)
const canRevise = computed(() =>
  (auth.isUnitHead || auth.isDirector) && props.task?.unitHead && !props.task?.director
)
const canSubmitOutput = computed(() =>
  auth.isMember && !props.task?.outputLink
)

const statusLabel = computed(() => {
  if (props.task?.director)  return { label: 'Approved by Director',    cls: 'bg-green-100 text-green-800' }
  if (props.task?.unitHead)  return { label: 'Pending Director Review', cls: 'bg-amber-100 text-amber-800' }
  return                            { label: 'Pending Unit Head',       cls: 'bg-gray-100  text-gray-600'  }
})

const badgeClass = (val) => ({
  ongoing:   'bg-green-800 text-white',
  approved:  'bg-blue-600 text-white',
  urgent:    'bg-red-800 text-white',
  regular:   'bg-amber-500 text-white',
  insertion: 'bg-red-800 text-white',
  revision:  'bg-purple-600 text-white',
}[val?.toLowerCase()] || 'bg-gray-200 text-gray-700')

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'numeric' }) : '—'

const approve = async () => {
  acting.value = 'approve'
  try {
    const role = auth.isDirector ? 'director' : 'unit_head'
    await store.approveTask(props.task.id, role)
    emit('close')
  } finally { acting.value = '' }
}

const revise = async () => {
  acting.value = 'revise'
  try {
    await store.reviseTask(props.task.id)
    emit('close')
  } finally { acting.value = '' }
}

const submitOutput = async () => {
  if (!outputUrl.value.trim()) return
  submitting.value = true
  try {
    await store.submitOutput(props.task.id, outputUrl.value.trim())
    emit('close')
  } finally { submitting.value = false }
}
</script>

<template>
  <div v-if="task"
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
    @click.self="emit('close')">

    <div class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl
                max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden">

      <!-- Close -->
      <button class="absolute top-4 right-5 text-2xl text-gray-400 hover:text-gray-700 z-10"
        @click="emit('close')">×</button>

      <!-- Title bar -->
      <div class="px-6 sm:px-8 pt-7 pb-4 flex-shrink-0">
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="px-3 py-1 text-xs font-bold rounded-full" :class="badgeClass(task.type)">
            {{ task.type }}
          </span>
          <span v-if="task.urgent" class="px-3 py-1 text-xs font-bold rounded-full" :class="badgeClass('urgent')">
            Urgent
          </span>
          <span v-if="task.revision" class="px-3 py-1 text-xs font-bold rounded-full" :class="badgeClass('revision')">
            Revision
          </span>
          <span class="px-3 py-1 text-xs font-bold rounded-full" :class="statusLabel.cls">
            {{ statusLabel.label }}
          </span>
        </div>
        <h2 class="text-xl font-bold text-gray-900 leading-snug">{{ task.name }}</h2>
      </div>

      <hr class="mx-6 sm:mx-8 border-gray-100" />

      <!-- Body -->
      <div class="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-5">

        <!-- Description -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
          <div class="border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
            {{ task.description }}
          </div>
        </div>

        <!-- Meta grid -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Assigned by</p>
            <div class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
              <div class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-800">
                {{ (task.assignerName || '?').charAt(0) }}
              </div>
              <span class="text-xs text-gray-700 truncate">{{ task.assignerName || '—' }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Assigned to</p>
            <div class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
              <div class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-800">
                {{ (task.assigneeName || '?').charAt(0) }}
              </div>
              <span class="text-xs text-gray-700 truncate">{{ task.assigneeName || '—' }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date Given</p>
            <p class="text-gray-700">{{ fmt(task.from) }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Deadline</p>
            <p class="text-gray-700">{{ fmt(task.to) }}</p>
          </div>
        </div>

        <!-- Output -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Output</p>

          <!-- Has output -->
          <div v-if="task.outputLink"
            class="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
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

          <!-- Member submit output -->
          <div v-else-if="canSubmitOutput" class="flex gap-2">
            <input v-model="outputUrl" type="url" placeholder="Paste your Google Drive / output URL…"
              class="flex-1 border-2 border-gray-300 rounded-xl h-10 px-3 text-sm
                     focus:outline-none focus:border-green-800 transition-colors" />
            <button @click="submitOutput" :disabled="submitting || !outputUrl.trim()"
              class="h-10 px-4 rounded-xl bg-green-950 text-white text-sm font-bold
                     hover:bg-green-800 disabled:opacity-40 transition-colors flex items-center gap-1">
              <svg v-if="submitting" class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
              </svg>
              Submit
            </button>
          </div>

          <!-- No output yet -->
          <div v-else
            class="border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-400 text-center">
            No output submitted yet
          </div>
        </div>

        <!-- Subtasks -->
        <div v-if="task.subtasks?.length">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Sub-tasks ({{ task.subtasks.length }})
          </p>
          <div class="space-y-2">
            <div v-for="(sub, i) in task.subtasks" :key="i"
              class="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-2.5">
              <span class="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
                :class="sub.director ? 'bg-green-700' : 'bg-gray-400'">
                {{ i + 1 }}
              </span>
              <p class="flex-1 text-sm text-gray-700 leading-snug">{{ sub.name }}</p>
              <a v-if="sub.outputLink" :href="sub.outputLink" target="_blank"
                class="text-xs text-green-800 font-semibold hover:underline flex-shrink-0">↗</a>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer actions -->
      <div class="flex gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 flex-shrink-0">

        <!-- Unit head approval -->
        <template v-if="canApproveAsUnitHead">
          <button @click="revise" :disabled="acting !== ''"
            class="flex-1 h-11 rounded-xl border-2 border-amber-400 text-amber-600 font-bold text-sm
                   hover:bg-amber-50 disabled:opacity-40 transition-colors">
            {{ acting === 'revise' ? 'Sending…' : 'Request Revision' }}
          </button>
          <button @click="approve" :disabled="acting !== ''"
            class="flex-1 h-11 rounded-xl bg-green-950 text-white font-bold text-sm
                   hover:bg-green-800 disabled:opacity-40 transition-colors">
            {{ acting === 'approve' ? 'Approving…' : 'Approve & Send to Director' }}
          </button>
        </template>

        <!-- Director approval -->
        <template v-else-if="canApproveAsDirector">
          <button @click="revise" :disabled="acting !== ''"
            class="flex-1 h-11 rounded-xl border-2 border-amber-400 text-amber-600 font-bold text-sm
                   hover:bg-amber-50 disabled:opacity-40 transition-colors">
            {{ acting === 'revise' ? 'Sending…' : 'Send for Revision' }}
          </button>
          <button @click="approve" :disabled="acting !== ''"
            class="flex-1 h-11 rounded-xl bg-green-950 text-white font-bold text-sm
                   hover:bg-green-800 disabled:opacity-40 transition-colors">
            {{ acting === 'approve' ? 'Approving…' : 'Final Approve' }}
          </button>
        </template>

        <!-- Approved state -->
        <template v-else-if="task.director">
          <div class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-green-50 border border-green-200">
            <svg class="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="text-sm font-bold text-green-700">Approved</span>
          </div>
        </template>

        <!-- Close fallback -->
        <template v-else>
          <button @click="emit('close')"
            class="flex-1 h-11 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm
                   hover:border-green-800 hover:text-green-800 transition-colors">
            Close
          </button>
        </template>

      </div>
    </div>
  </div>
</template>