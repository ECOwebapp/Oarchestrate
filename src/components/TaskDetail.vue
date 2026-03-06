<script setup>
import Icons from '@/components/Icons.vue'

const props = defineProps(['task'])
const emit = defineEmits(['close', 'approve'])

const badgeClass = (value) => {
  const map = {
    ongoing: 'bg-green-800 text-white',
    completed: 'bg-blue-600 text-white',
    urgent: 'bg-[#7b1c1c] text-white',
    regular: 'bg-amber-500 text-white',
    insertion: 'bg-[#7b1c1c] text-white',
  }
  return map[value] || 'bg-gray-300 text-gray-800'
}
</script>

<template>
  <div v-if="task" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] mx-4 relative flex flex-col">

      <!-- Close button -->
      <button class="absolute top-5 right-5 text-3xl text-gray-400 hover:text-gray-700 leading-none cursor-pointer"
        @click="emit('close')">×</button>

      <!-- Title -->
      <div class="px-8 pt-8 pb-4">
        <h2 class="text-2xl font-bold text-center text-gray-900 leading-snug">{{ task.fullTitle }}</h2>
      </div>

      <hr class="mx-8" />

      <!-- Body -->
      <div class="flex gap-8 px-8 py-6 flex-1 overflow-hidden">

        <!-- ── SINGLE TASK (no subtasks) ── -->
        <template v-if="task.subtasks.length === 0">

          <!-- Left: Description fills full height -->
          <div class="flex-1 min-w-0 flex flex-col">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <div class="border border-gray-200 rounded-lg p-4 flex-1 text-sm text-gray-600 leading-relaxed">
              {{ task.description }}
            </div>
          </div>

          <!-- Right: badges · dates · assigned · submission -->
          <div class="w-72 flex-shrink-0 flex flex-col gap-4">

            <!-- Badges -->
            <div class="flex gap-2 flex-wrap">
              <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                :class="badgeClass(task.progress)">
                {{ task.progress }}
              </span>
              <span v-if="task.urgency === 'urgent'" class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                :class="badgeClass(task.urgency)">
                {{ task.urgency }}
              </span>
              <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                :class="badgeClass(task.type)">
                {{ task.type }}
              </span>
            </div>

            <!-- Dates -->
            <div class="text-sm text-gray-700 space-y-1">
              <p><span class="font-semibold">Task given on</span> {{ task.taskGiven }}</p>
              <p><span class="font-semibold">Submit before</span> {{ task.submitBefore }}</p>
            </div>

            <!-- Assigned by / Assigned to -->
            <div class="flex gap-3">
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-700 mb-1">Assigned by</p>
                <div class="flex items-center justify-center border border-gray-200 rounded-lg h-12">
                  <Icons :icon="'account'" class="text-gray-400" />
                </div>
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-700 mb-1">Assigned to</p>
                <div class="flex items-center justify-center border border-gray-200 rounded-lg h-12">
                  <Icons :icon="'account'" class="text-gray-400" />
                </div>
              </div>
            </div>

            <!-- Submission area -->
            <!-- Approved: file attachment preview -->
            <div v-if="task.status === 'approved'"
              class="relative flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg p-4 flex-1">
              <Icons :icon="'attachment'" class="absolute top-2 right-2 text-gray-400 w-4 h-4" />
              <Icons :icon="'file'" class="text-gray-400 w-14 h-14" />
              <div class="flex items-center justify-between w-full text-xs text-gray-600 px-1">
                <span class="font-medium">{{ task.submittedFile?.name || 'Task_submission.pdf' }}</span>
                <span class="text-gray-400">{{ task.submittedFile?.size || '8.00 MB' }}</span>
              </div>
            </div>
            <!-- Pending: submitted message + view file button -->
            <div v-else
              class="flex flex-col items-center justify-center gap-3 border border-gray-200 rounded-lg p-4 flex-1">
              <p class="text-sm text-gray-600 text-center">
                <span class="font-medium">{{ task.submittedBy }}</span> has submitted a task
              </p>
              <button class="px-6 py-2 rounded-full bg-green-950 text-white text-sm font-semibold hover:bg-green-800 transition-colors">
                view file
              </button>
            </div>

          </div>
        </template>

        <!-- ── BULK TASK (has subtasks) ── -->
        <template v-else>

          <!-- Left column -->
          <div class="flex-1 min-w-0">
            <!-- Description -->
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <div class="border border-gray-200 rounded-lg p-4 mb-5 min-h-28 text-sm text-gray-600">
              {{ task.description }}
            </div>

            <!-- Badges -->
            <div class="flex gap-2 mb-5">
              <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                :class="badgeClass(task.progress)">
                {{ task.progress }}
              </span>
              <span v-if="task.urgency === 'urgent'" class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                :class="badgeClass(task.urgency)">
                {{ task.urgency }}
              </span>
              <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                :class="badgeClass(task.type)">
                {{ task.type }}
              </span>
            </div>

            <!-- Dates -->
            <p class="text-sm text-gray-700 italic">Task given on <span class="font-semibold">{{ task.taskGiven }}</span></p>
            <p class="text-sm text-gray-700 italic mb-5">Submit before <span class="font-semibold">{{ task.submitBefore }}</span></p>

            <!-- Assigned -->
            <div class="flex gap-8">
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2">Assigned by</p>
                <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Icons :icon="'account'" class="text-gray-400" />
                  </div>
                  <span class="text-xs text-gray-600">{{ task.assignedBy }}</span>
                </div>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2">Assigned to</p>
                <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Icons :icon="'account'" class="text-gray-400" />
                  </div>
                  <span class="text-xs text-gray-600">{{ task.assignedTo }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right column: Sub-tasks -->
          <div class="w-72 flex-shrink-0 flex flex-col overflow-hidden">
            <h3 class="text-sm font-semibold text-gray-700 mb-2 flex-shrink-0">Sub-tasks</h3>
            <div class="overflow-y-auto flex-1">
              <div v-for="(sub, i) in task.subtasks" :key="i"
                class="flex items-center gap-3 border border-gray-200 rounded-lg p-3 mb-2 hover:bg-gray-50 cursor-pointer">
                <p class="flex-1 text-xs text-gray-700 leading-snug">{{ sub }}</p>
                <span class="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-600 text-white text-xs font-bold flex-shrink-0">›</span>
              </div>
            </div>
          </div>

        </template>

      </div>

      <!-- Footer buttons (hidden once approved) -->
      <div v-if="task.status !== 'approved'" class="flex justify-end gap-3 px-8 pb-6">
        <template v-if="task.subtasks.length === 0">
          <button class="px-6 py-2 rounded-full border-2 border-yellow-500 text-yellow-600 font-bold text-sm hover:bg-yellow-50 transition-colors">
            Revise
          </button>
          <button class="px-6 py-2 rounded-full bg-green-950 text-white font-bold text-sm hover:bg-green-800 transition-colors"
            @click="emit('approve')">
            Approve
          </button>
        </template>
        <template v-else>
          <button class="px-6 py-2 rounded-lg border-2 border-red-500 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
            Revise All
          </button>
          <button class="px-6 py-2 rounded-lg bg-green-900 text-white font-bold text-sm hover:bg-green-800 transition-colors"
            @click="emit('approve')">
            Approve All
          </button>
        </template>
      </div>

    </div>
  </div>
</template>
