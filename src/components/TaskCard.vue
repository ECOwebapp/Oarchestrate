<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import { computed } from 'vue'

const props = defineProps(['task'])
const emit  = defineEmits(['open'])
const auth  = useAuthStore()

const daysLeft = computed(() => {
  const today  = new Date(); today.setHours(0,0,0,0)
  const target = new Date(props.task?.to); target.setHours(0,0,0,0)
  return Math.ceil((target - today) / 86400000)
})

const progress = computed(() => {
  const start = new Date(props.task?.from).getTime()
  const end   = new Date(props.task?.to).getTime()
  const now   = Date.now()
  if (now <= start) return 0
  if (now >= end)   return 100
  return Math.round(((now - start) / (end - start)) * 100)
})

const statusLabel = computed(() => {
  if (props.task?.director)  return { label: 'Approved',          cls: 'bg-green-100 text-green-800' }
  if (props.task?.unitHead)  return { label: 'Pending Director',  cls: 'bg-amber-100 text-amber-800' }
  return                            { label: 'Pending Unit Head', cls: 'bg-gray-100  text-gray-600'  }
})
</script>

<template>
  <div
    @click="emit('open', task)"
    class="relative flex flex-col rounded-2xl py-3 px-4 overflow-hidden bg-white shadow-md
           hover:shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
    :class="task.urgent
      ? 'outline outline-2 outline-red-800'
      : 'outline outline-2 outline-green-950'">

    <!-- Urgent ribbon -->
    <div v-if="task.urgent" class="absolute top-0 right-0 h-14 w-14 overflow-hidden">
      <div class="absolute transform rotate-45 bg-red-800 text-white text-[10px]
                  font-bold py-0.5 w-32 bottom-3 -right-9 text-center uppercase tracking-wide">
        Urgent
      </div>
    </div>

    <!-- Type badge -->
    <div class="flex items-center gap-2 mb-2">
      <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
        :class="task.type?.toLowerCase() === 'insertion'
          ? 'bg-red-100 text-red-700'
          : 'bg-green-100 text-green-800'">
        {{ task.type }}
      </span>
      <span v-if="task.revision"
        class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        Revision
      </span>
    </div>

    <!-- Title -->
    <p class="truncate font-bold text-sm mb-1"
      :class="task.urgent ? 'text-red-900' : 'text-green-950'">
      {{ task.name }}
    </p>

    <!-- Description -->
    <p class="line-clamp-2 text-xs text-gray-500 italic mb-2">{{ task.description }}</p>

    <!-- Assignee (director/unit head view) -->
    <p v-if="task.assigneeName" class="text-xs text-gray-400 mb-2 truncate">
      → {{ task.assigneeName }}
    </p>

    <!-- Status badge -->
    <span class="self-start text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
      :class="statusLabel.cls">
      {{ statusLabel.label }}
    </span>

    <!-- Progress + due -->
    <div class="flex items-center gap-2 mt-auto">
      <div class="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div class="h-full transition-all duration-500"
          :class="task.urgent ? 'bg-red-800' : 'bg-green-950'"
          :style="{ width: progress + '%' }" />
      </div>
      <p class="text-[10px] font-bold italic flex-shrink-0"
        :class="daysLeft < 0 ? 'text-red-600' : 'text-gray-500'">
        {{ daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left` }}
      </p>
    </div>
  </div>
</template>