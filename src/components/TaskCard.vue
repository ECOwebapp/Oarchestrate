<script setup vapor>
import { useAuthStore } from '@/stores/useAuthStore'
import { mdiAccount, mdiLink } from '@mdi/js'
import { computed } from 'vue'

const props = defineProps({
  task: Object,
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['open', 'toggle-select'])
const auth = useAuthStore()

const daysLeft = computed(() => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(props.task?.to); target.setHours(0, 0, 0, 0)
  return Math.ceil((target - today) / 86400000)
})

const progress = computed(() => {
  const start = new Date(props.task?.from).getTime()
  const end = new Date(props.task?.to).getTime()
  const now = Date.now()
  if (now <= start) return 0
  if (now >= end) return 100
  return Math.round(((now - start) / (end - start)) * 100)
})

const statusLabel = computed(() => {
  if (props.task?.director) return { label: 'Approved', cls: 'bg-green-100 text-green-800' }
  if (props.task?.unitHead) return { label: 'Pending', cls: 'bg-amber-100 text-amber-800' }
  if (props.task?.revision) return { label: 'Needs Revision', cls: 'bg-orange-100 text-orange-700' }
  if ((props.task?.assigneeIsOffice || props.task?.isSelfAssigned) && props.task?.outputLink)
    return { label: 'Waiting for Submission', cls: 'bg-amber-100 text-amber-800' }
  if (!props.task?.assigneeIsOffice && !props.task?.isSelfAssigned && props.task?.outputLink)
    return { label: 'Pending Unit Head', cls: 'bg-gray-100 text-gray-600' }
  return { label: 'Pending', cls: 'bg-gray-100 text-gray-600' }
})

const cardClass = computed(() => {
  if ((auth.isUnitHead || auth.isDirector) && !props.task?.outputLink) {
    return 'opacity-50'
  }
  return ''
})

const showAssignee = computed(() =>
  props.task?.assigneeName && props.task?.assignee !== auth.userID
)

const isResubmitted = computed(() =>
  props.task?.outputLink && !props.task?.revision && !props.task?.director && props.task?.revisedAt
)

const handleClick = (e) => {
  if (props.selectable) {
    emit('toggle-select', props.task)
  } else {
    emit('open', props.task)
  }
}

const handleCheckboxClick = (e) => {
  e.stopPropagation()
  emit('toggle-select', props.task)
}
</script>

<template>
  <div @click="handleClick" class="relative flex flex-col rounded-2xl py-3 px-4 overflow-hidden bg-white shadow-lg
           hover:shadow-xl hover:cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group animate-slide-up
           h-44" :class="[
            cardClass,
            selected ? 'ring-2 ring-green-600 ring-offset-1' : '',
            task.urgent
              ? 'outline outline-2 outline-red-800'
              : task.revision
                ? 'outline outline-2 outline-orange-400'
                : 'outline outline-2 outline-green-950'
          ]">

    <!-- Selection checkbox — top-right, always visible in selectable mode -->
    <div v-if="selectable" @click="handleCheckboxClick" class="absolute top-2.5 right-2.5 z-20 w-5 h-5 rounded-md border-2 flex items-center justify-center
             transition-all duration-150 cursor-pointer shadow-sm" :class="selected
              ? 'bg-green-700 border-green-700'
              : 'bg-white/90 border-gray-400 hover:border-green-600'">
      <svg v-if="selected" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </div>

    <!-- Selected overlay tint -->
    <div v-if="selected" class="absolute inset-0 bg-green-50/40 rounded-2xl pointer-events-none" />

    <!-- Urgent ribbon -->
    <div v-if="task.urgent" class="absolute top-0 right-0 h-16 w-16 overflow-hidden pointer-events-none">
      <div class="absolute transform rotate-45 bg-red-800 text-white text-[10px]
                  font-bold py-0.5 w-40 bottom-7 -right-14 text-center uppercase tracking-wide">
        Urgent
      </div>
    </div>

    <!-- Type + revision badges -->
    <div class="flex items-center gap-2 mb-2 flex-wrap">
      <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" :class="task.type?.toLowerCase() === 'insertion'
        ? 'bg-red-100 text-red-700'
        : 'bg-green-100 text-green-800'">
        {{ task.type }}
      </span>
      <span v-if="task.revision"
        class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
        Revision
      </span>
      <span v-if="isResubmitted"
        class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path :d="mdiLink" />
        </svg>
        Resubmitted
      </span>
    </div>

    <!-- Title -->
    <p class="truncate font-bold text-sm mb-1" :class="task.urgent ? 'text-red-900' : 'text-green-950'">
      {{ task.name }}
    </p>

    <!-- Description -->
    <p class="line-clamp-2 text-xs text-gray-500 italic mb-2 leading-relaxed">{{ task.description }}</p>

    <div class="flex items-center justify-between gap-5" :class="showAssignee ? 'flex-row-reverse' : ''">
      <!-- Assignee (director/unit head view) -->
      <p v-if="showAssignee" class="text-xs text-gray-400 mb-2 truncate flex items-center gap-1">
        <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path :d="mdiAccount" />
        </svg>
        {{ task.assigneeName }}
      </p>

      <!-- Status badge -->
      <span class="self-start text-[10px] font-bold px-2 py-0.5 rounded-full mb-2" :class="statusLabel.cls">
        {{ statusLabel.label }}
      </span>
    </div>

    <!-- Output submitted indicator -->
      <div v-if="task.outputLink && !task.director"
        class="flex items-center gap-1 text-[10px] text-blue-600 font-semibold mb-1">
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path :d="mdiLink" />
        </svg>
        Output submitted
      </div>


    <!-- Progress bar + due date -->
    <div class="flex items-center gap-2 mt-auto pt-1">
      <div class="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500"
          :class="task.urgent ? 'bg-red-800' : task.director ? 'bg-green-600' : 'bg-green-950'"
          :style="{ width: progress + '%' }" />
      </div>
      <p class="text-[10px] font-bold italic flex-shrink-0"
        :class="daysLeft < 0 && !task.director ? 'text-red-600' : task.director ? 'text-green-600' : 'text-gray-500'">
        {{ task.director ? 'Done' : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' :
          `${daysLeft}d left` }} </p>
    </div>
  </div>
</template>