<script setup vapor>
import { ref, watch, nextTick } from "vue";
import ProjectCard from "./ProjectCard.vue";
import { useProjectStore } from "@/stores/projects";

const projectStore = useProjectStore();
const props = defineProps({
  projects: Array,
  selectable: { type: Boolean, default: false },
  selectedIds: { type: Object, default: () => new Set() }, // Set of selected task ids
  isDeletable: { type: Function, default: () => false },
  modal: { type: Boolean, default: false },
  emptyTitle: { type: String, default: "No projects found" },
  emptyHint: { type: String, default: "" },
});
const emit = defineEmits(["toggle-select", "open", "close", "success"]);
const selected = ref(null);
const loading = ref(false);
const success = ref(false);

const handleOpen = (task) => {
  if (props.selectable) return;
  selected.value = task;
  emit("open");
};
</script>

<template>
  <div>
    <div
      v-if="props.projects.length < 1"
      class="h-full flex items-center justify-center px-4 py-8"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-dashed border-green-300/70 bg-green-50/50 p-8 text-center"
      >
        <svg
          class="w-12 h-12 mb-3 mx-auto text-green-700/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p class="text-sm font-semibold text-green-950">
          {{ props.emptyTitle }}
        </p>
        <p v-if="props.emptyHint" class="mt-1 text-xs text-gray-600">
          {{ props.emptyHint }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="mask-y-from-95% mask-y-to-97% h-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 justify-items-stretch px-4 sm:px-6 lg:px-10 py-6 gap-4"
    >
      <ProjectCard
        v-for="(project, index) in props.projects"
        :key="project.id"
        :project="project"
        :selectable="props.selectable"
        :selected="props.selectedIds.has(project.id)"
        :is-deletable="props.isDeletable(project)"
        @open="handleOpen(project)"
        @toggle-select="emit('toggle-select', $event)"
        :style="{ animationDelay: `${index * 0.03}s` }"
      />
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active {
  animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.modal-leave-active {
  animation: modalOut 0.15s ease both;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes modalOut {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
    transform: scale(0.97);
  }
}
</style>
