<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import { mdiAccount, mdiLink } from '@mdi/js'
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
  if (props.task?.director)   return { label: 'Approved',            cls: 'bg-green-100 text-green-800'  }
  // unit_head=true means either UH approved OR bypass marker (Office/Self-assigned) — both mean Pending Director
  if (props.task?.unitHead)   return { label: 'Pending Director',    cls: 'bg-amber-100 text-amber-800'  }
  if (props.task?.revision)   return { label: 'Needs Revision',      cls: 'bg-orange-100 text-orange-700'}
  // Office or self-assigned tasks with output submitted but unitHead flag not yet set
  if ((props.task?.assigneeIsOffice || props.task?.isSelfAssigned) && props.task?.outputLink)
                              return { label: 'Pending Director',    cls: 'bg-amber-100 text-amber-800'  }
  // Non-office, non-self-assigned tasks pending unit head review
  if (!props.task?.assigneeIsOffice && !props.task?.isSelfAssigned && props.task?.outputLink)
                              return { label: 'Pending Unit Head',   cls: 'bg-gray-100 text-gray-600'    }
  return                             { label: 'Pending',             cls: 'bg-gray-100 text-gray-600'    }
})

const cardClass = computed(() => {
  // dim card when reviewer role and no submission yet
  if ((auth.isUnitHead || auth.isDirector) && !props.task?.outputLink) {
    return 'opacity-50'
  }
  return ''
})

// Show assignee name only if the viewer is not the assignee
const showAssignee = computed(() =>
  props.task?.assigneeName && props.task?.assignee !== auth.userID
)

// Check if task has been resubmitted (outputLink exists AND no revision flag AND not director approved)
const isResubmitted = computed(() =>
  props.task?.outputLink && !props.task?.revision && !props.task?.director && props.task?.revisedAt
)
</script>

<template>
  <div
    @click="emit('open', task)"
    class="relative flex flex-col rounded-2xl py-3 px-4 overflow-hidden bg-white shadow-lg
           hover:shadow-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group
           h-44"
    :class="[ cardClass,
      task.urgent
        ? 'outline outline-2 outline-red-800'
        : task.revision
          ? 'outline outline-2 outline-orange-400'
          : 'outline outline-2 outline-green-950' ]">

    <!-- Urgent ribbon -->
    <div v-if="task.urgent" class="absolute top-0 right-0 h-16 w-16 overflow-hidden pointer-events-none">
      <div class="absolute transform rotate-45 bg-red-800 text-white text-[10px]
                  font-bold py-0.5 w-40 bottom-7 -right-14 text-center uppercase tracking-wide">
        Urgent
      </div>
    </div>

    <!-- Type + revision badges -->
    <div class="flex items-center gap-2 mb-2 flex-wrap">
      <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
        :class="task.type?.toLowerCase() === 'insertion'
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
    <p class="truncate font-bold text-sm mb-1"
      :class="task.urgent ? 'text-red-900' : 'text-green-950'">
      {{ task.name }}
    </p>

    <!-- Description -->
    <p class="line-clamp-2 text-xs text-gray-500 italic mb-2 leading-relaxed">{{ task.description }}</p>

    <!-- Assignee (director/unit head view) -->
    <p v-if="showAssignee" class="text-xs text-gray-400 mb-2 truncate flex items-center gap-1">
      <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path :d="mdiAccount" />
      </svg>
      {{ task.assigneeName }}
    </p>

    <!-- Status badge -->
    <span class="self-start text-[10px] font-bold px-2 py-0.5 rounded-full mb-2"
      :class="statusLabel.cls">
      {{ statusLabel.label }}
    </span>

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
        {{ task.director ? 'Done' : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left` }}
      </p>
    </div>
  </div>
</template>