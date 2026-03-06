<script setup>
import { useMemberStore } from '@/stores/member'
import { taskStore } from '@/stores/tasks.js'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, onMounted, ref } from 'vue'
import Icons from './Icons.vue'

const emit    = defineEmits(['close'])
const store   = taskStore()
const members = useMemberStore()
const auth    = useAuthStore()

const loading   = ref(false)
const subTasks  = ref([{ text: '' }])
const outputUrl = ref('')   // for member insertion task

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

onMounted(() => members.fetchMembers?.())

// ── Who can be assigned ──
const assignableMembers = computed(() => {
  if (auth.isDirector) return members.members   // anyone
  if (auth.isUnitHead) {
    // their own unit members + themselves
    return members.members.filter(m =>
      m.unit_id === auth.unitId || m.id === auth.userID
    )
  }
  // Member: only themselves, insertion only
  return members.members.filter(m => m.id === auth.userID)
})

// Members can only do insertion
const typeOptions = computed(() => {
  if (auth.isMember) return [{ id: 2, label: 'Insertion Task' }]
  return [
    { id: 1, label: 'Regular Task' },
    { id: 2, label: 'Insertion Task' },
  ]
})

// Members see output field immediately
const showOutput = computed(() =>
  auth.isMember && newTask.value.type === 2
)

const submitForm = async () => {
  loading.value = true
  try {
    const validSubs = subTasks.value
      .filter(s => s.text.trim())
      .map(s => ({ description: s.text }))

    await store.addTasks({
      mainTask: {
        ...newTask.value,
        outputLink: showOutput.value ? outputUrl.value : '',
      },
      subTasks: validSubs,
    })
    emit('close')
  } catch (e) {
    console.error('AddTask error:', e)
  } finally {
    loading.value = false
  }
}

const addSubTask = () => subTasks.value.push({ text: '' })
const removeSubTask = (i) => subTasks.value.splice(i, 1)
</script>

<template>
  <div class="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

    <!-- Header -->
    <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100">
      <h2 class="text-xl font-bold text-gray-900">
        {{ auth.isDirector ? 'Assign a Task' : auth.isUnitHead ? 'Assign to Unit' : 'Submit Insertion Task' }}
      </h2>
      <button @click="emit('close')" class="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
    </div>

    <!-- Body -->
    <div class="overflow-y-auto flex-1 px-7 py-5 space-y-4">

      <!-- Title -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
        <input v-model="newTask.name" type="text" maxlength="100" required
          placeholder="Task title…"
          class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                 focus:outline-none focus:border-green-800 transition-colors" />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">Description <span class="text-red-500">*</span></label>
        <textarea v-model="newTask.description" rows="4" maxlength="500" required
          placeholder="Describe the task…"
          class="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm resize-none
                 focus:outline-none focus:border-green-800 transition-colors" />
        <p class="text-xs text-gray-400 mt-0.5">{{ newTask.description.length }}/500</p>
      </div>

      <!-- Type + Date row -->
      <div class="flex gap-3">
        <div class="flex-1">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Type <span class="text-red-500">*</span></label>
          <select v-model="newTask.type" required
            class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                   focus:outline-none focus:border-green-800 bg-white">
            <option value="" disabled hidden>Select type</option>
            <option v-for="t in typeOptions" :key="t.id" :value="t.id">{{ t.label }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Deadline <span class="text-red-500">*</span></label>
          <input v-model="newTask.endDate" type="date" required
            class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                   focus:outline-none focus:border-green-800 transition-colors" />
        </div>
      </div>

      <!-- Assignee (hidden for members — auto-assigned to self) -->
      <div v-if="!auth.isMember">
        <label class="block text-sm font-semibold text-gray-700 mb-1">Assign To <span class="text-red-500">*</span></label>
        <select v-model="newTask.assignee" required
          class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                 focus:outline-none focus:border-green-800 bg-white">
          <option value="" disabled hidden>Select member</option>
          <option v-for="m in assignableMembers" :key="m.id" :value="m.id">
            {{ m.fname }} {{ m.middle_initial ? m.middle_initial + '. ' : '' }}{{ m.lname }}
          </option>
        </select>
      </div>

      <!-- Output link (members submitting insertion task) -->
      <div v-if="auth.isMember">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          Output Link <span class="text-gray-400 font-normal">(Google Drive / URL)</span>
        </label>
        <input v-model="outputUrl" type="url" placeholder="https://drive.google.com/…"
          class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm
                 focus:outline-none focus:border-green-800 transition-colors" />
      </div>

      <!-- Sub-tasks (director + unit head only) -->
      <div v-if="!auth.isMember">
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-semibold text-gray-700">Sub-tasks</label>
          <button type="button" @click="addSubTask"
            class="flex items-center gap-1 text-xs font-bold text-green-800 hover:text-green-600">
            <Icons :icon="'add'" class="w-3 h-3" /> Add
          </button>
        </div>
        <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
          <div v-for="(item, i) in subTasks" :key="i"
            class="flex items-start gap-2">
            <span class="text-xs text-gray-400 mt-2.5 flex-shrink-0 w-4">{{ i+1 }}</span>
            <textarea v-model="item.text" rows="1" maxlength="200"
              :placeholder="`Sub-task ${i+1}…`"
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

      <!-- Approval note -->
      <div v-if="!auth.isDirector"
        class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <svg class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <p class="text-xs text-amber-700">
          <span v-if="auth.isUnitHead">This task will be sent to the director for final approval.</span>
          <span v-else>This insertion task requires approval from your unit head and the director.</span>
        </p>
      </div>
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
               disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
        {{ loading ? 'Saving…' : 'Submit' }}
      </button>
    </div>
  </div>
</template>