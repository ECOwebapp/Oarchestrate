<script setup vapor>
import { ref } from 'vue'
import TaskCard from './TaskCard.vue'
import TaskDetail from './TaskDetail.vue'

const props = defineProps({
  tasks: Array,
  selectable: { type: Boolean, default: false },
  selectedIds: { type: Object, default: () => new Set() },  // Set of selected task ids
  isDeletable: { type: Function, default: () => false },
})
const emit = defineEmits(['assignSubtask', 'toggle-select'])
const selected = ref(null)

const handleOpen = (task) => {
  if (props.selectable) return   // block detail open while in selection mode
  selected.value = task
}
</script>

<template>
  <div class="h-full">
    <div v-if="props.tasks.length === 0" class="flex flex-col items-center justify-center h-full py-20 text-gray-400">
      <svg class="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="text-sm font-semibold">No tasks found</p>
    </div>

    <div v-else class="mask-y-from-95% mask-y-to-97% h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4
           justify-items-stretch px-4 sm:px-6 lg:px-10 py-6 gap-4">
      <TaskCard v-for="(task, index) in props.tasks" :key="task.id" :task="task" :selectable="props.selectable"
        :selected="props.selectedIds.has(task.id)" :is-deletable="props.isDeletable(task)" @open="handleOpen"
        @toggle-select="emit('toggle-select', $event)" :style="{ animationDelay: `${index * 0.03}s` }" />
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <TaskDetail v-if="selected" :task="selected" @close="selected = null"
          @assignSubtask="emit('assignSubtask', $event)" />
      </Transition>
    </Teleport>
  </div>

</template>

<style scoped>
.modal-enter-active {
  animation: modalIn 0.25s cubic-bezier(.16, 1, .3, 1) both
}

.modal-leave-active {
  animation: modalOut 0.15s ease both
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.97)
  }

  to {
    opacity: 1;
    transform: scale(1)
  }
}

@keyframes modalOut {
  from {
    opacity: 1
  }

  to {
    opacity: 0;
    transform: scale(0.97)
  }
}
</style>