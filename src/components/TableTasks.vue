<script setup>
import { ref } from 'vue'
import TaskDetail from './TaskDetail.vue'

const props = defineProps({
  tasks:       Array,
  selectable:  { type: Boolean,  default: false },
  selectedIds: { type: Object,   default: () => new Set() },  // Set of selected task ids
  isDeletable: { type: Function, default: () => false },
})
const emit     = defineEmits(['assignSubtask', 'toggle-select'])
const selected = ref(null)

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-PH', { month:'short', day:'numeric', year:'2-digit' })
  : '—'

const statusCls = (task) => {
  if (task.director) return 'bg-green-100 text-green-800'
  if (task.overdue)  return 'bg-red-100 text-red-800'
  if (task.unitHead) return 'bg-amber-100 text-amber-800'
  return 'bg-gray-100 text-gray-600'
}
const statusLabel = (task) => {
  if (task.director) return 'Approved'
  if (task.overdue)  return 'Overdue'
  if (task.unitHead) return 'Pending Director'
  return 'Pending Unit Head'
}

const handleRowClick = (task) => {
  if (props.selectable && props.isDeletable(task)) {
    emit('toggle-select', task)
  }
}
</script>

<template>
  <div class="overflow-auto h-full w-full">
    <table class="min-w-full text-sm border-collapse">
      <thead class="sticky top-0 z-10">
        <tr>
          <!-- Checkbox column header — only in selection mode -->
          <th v-if="selectable"
            class="w-10 px-4 py-3 bg-green-950 border border-green-800" />
          <th v-for="h in ['Title','Assignee','Type','Deadline','Status','Urgent','']"
            :key="h"
            class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider
                   bg-green-950 text-white border border-green-800 whitespace-nowrap">
            {{ h }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="tasks.length === 0">
          <td :colspan="selectable ? 8 : 7"
            class="text-center py-16 text-gray-400 text-sm">No tasks found</td>
        </tr>
        <tr v-for="task in tasks" :key="task.id"
          class="border-b border-gray-100 transition-colors"
          :class="[
            selectedIds.has(task.id) ? 'bg-green-50' : 'hover:bg-gray-50',
            selectable && isDeletable(task) ? 'cursor-pointer' : '',
          ]"
          @click="handleRowClick(task)">

          <!-- Checkbox cell -->
          <td v-if="selectable" class="px-4 py-3 text-center" @click.stop="isDeletable(task) && emit('toggle-select', task)">
            <div class="w-5 h-5 rounded-md border-2 flex items-center justify-center mx-auto transition-all"
              :class="selectedIds.has(task.id)
                ? 'bg-green-700 border-green-700'
                : isDeletable(task)
                  ? 'border-gray-400 hover:border-green-600 bg-white'
                  : 'border-gray-200 bg-gray-50 opacity-40'">
              <svg v-if="selectedIds.has(task.id)" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </td>

          <td class="px-4 py-3 font-semibold text-gray-900 max-w-[180px] truncate">{{ task.name }}</td>
          <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ task.assigneeName || '—' }}</td>
          <td class="px-4 py-3">
            <span class="px-2 py-0.5 text-xs font-bold rounded-full"
              :class="task.type?.toLowerCase() === 'insertion'
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-800'">
              {{ task.type }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-600 whitespace-nowrap">{{ fmt(task.to) }}</td>
          <td class="px-4 py-3">
            <span class="px-2 py-0.5 text-xs font-bold rounded-full" :class="statusCls(task)">
              {{ statusLabel(task) }}
            </span>
          </td>
          <td class="px-4 py-3 text-center">
            <span v-if="task.urgent" class="text-red-600 font-bold text-xs">⚑ Urgent</span>
            <span v-else class="text-gray-300 text-xs">—</span>
          </td>
          <td class="px-4 py-3 text-center" @click.stop>
            <button
              :disabled="selectable"
              @click="selected = task"
              class="bg-green-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl
                     hover:bg-green-800 active:scale-95 transition-all cursor-pointer
                     disabled:opacity-30 disabled:cursor-not-allowed">
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <Transition name="modal">
    <TaskDetail
      v-if="selected"
      :task="selected"
      @close="selected = null"
      @assignSubtask="emit('assignSubtask', $event)" />
  </Transition>
</template>

<style scoped>
.modal-enter-active { animation: modalIn  0.25s cubic-bezier(.16,1,.3,1) both }
.modal-leave-active { animation: modalOut 0.15s ease both }
@keyframes modalIn  { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }
@keyframes modalOut { from { opacity:1 } to { opacity:0; transform:scale(0.97) } }
</style>