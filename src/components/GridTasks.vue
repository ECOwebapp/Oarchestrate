<script setup>
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'
import TaskDetail from './TaskDetail.vue'

const props      = defineProps(['tasks'])
const selected   = ref(null)
</script>

<template>
  <div v-if="props.tasks.length === 0"
    class="flex flex-col items-center justify-center h-full py-20 text-gray-400">
    <svg class="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
    <p class="text-sm font-semibold">No tasks found</p>
  </div>

  <div v-else
    class="h-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4
           justify-items-stretch px-4 sm:px-6 lg:px-10 py-6 gap-4
           overflow-y-auto mask-y-from-95% mask-y-to-97%">
    <TaskCard
      v-for="task in props.tasks"
      :key="task.id"
      :task="task"
      @open="selected = $event" />
  </div>

  <Transition name="modal">
    <TaskDetail v-if="selected" :task="selected" @close="selected = null" />
  </Transition>
</template>

<style scoped>
.modal-enter-active { animation: modalIn  0.25s cubic-bezier(.16,1,.3,1) both }
.modal-leave-active { animation: modalOut 0.15s ease both }
@keyframes modalIn  { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }
@keyframes modalOut { from { opacity:1 } to { opacity:0; transform:scale(0.97) } }
</style>