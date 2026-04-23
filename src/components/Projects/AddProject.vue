<script setup vapor>
import { useProjectStore } from "@/stores/projects";
import { computed, ref, watch } from "vue";

const props = defineProps({
  defaultType: { type: Number, default: 1 },
});

const emit = defineEmits(["close", "success"]);
const projectStore = useProjectStore();

const loading = ref(false);
const errorMsg = ref("");

const newProject = ref({
  title: "",
  description: "",
  type: props.defaultType,
  deadline: null,
});

const isInsertion = computed(() => Number(newProject.value.type) === 2);

watch(
  () => props.defaultType,
  (nextType) => {
    newProject.value.type = Number(nextType) === 2 ? 2 : 1;
  },
  { immediate: true },
);

// ── Submit ────────────────────────────────────────────────────────────────────
const submitForm = async () => {
  errorMsg.value = "";
  loading.value = true;
  try {
    if (!newProject.value.title.trim()) throw new Error("Title is required.");
    if (!newProject.value.deadline) throw new Error("Deadline is required.");

    const response = await projectStore.insertProjects(newProject.value);

    if (response === "success") emit(response);
  } catch (e) {
    console.error("[AddProject] submit error:", e);
    errorMsg.value = e.message || "Something went wrong. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <!-- ── Main AddProject card ──────────────────────────────────────────────────── -->
  <div
    class="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
  >
    <!-- Header -->
    <div
      class="flex items-center justify-between px-7 py-5 border-b border-gray-100"
    >
      <h2 class="text-xl font-bold text-gray-900">
        {{ isInsertion ? "Add New Insertion" : "Add New PPA" }}
      </h2>

      <div class="flex items-center gap-2">
        <button
          @click="emit('close')"
          class="hover:cursor-pointer text-gray-400 hover:text-gray-700 text-2xl leading-none"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Body -->
    <div class="overflow-y-auto flex-1 px-7 py-5 space-y-4">
      <!-- Title -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          Title <span class="text-red-500">*</span>
        </label>
        <input
          v-model="newProject.title"
          type="text"
          maxlength="100"
          placeholder="Task title…"
          class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-green-800 transition-colors"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          Description <span class="text-green-900">(Optional)</span>
        </label>
        <textarea
          v-model="newProject.description"
          rows="4"
          maxlength="500"
          placeholder="Describe the task…"
          class="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-800 transition-colors"
        />
        <p class="text-xs text-gray-400 mt-0.5">
          {{ newProject.description.length }}/500
        </p>
      </div>

      <!-- Type + Deadline -->
      <div class="flex gap-3">
        <div class="flex-1">
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            Deadline <span class="text-red-500">*</span>
          </label>
          <input
            v-model="newProject.deadline"
            type="date"
            class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-green-800 transition-colors hover:cursor-pointer"
          />
        </div>
      </div>

      <!-- Error -->
      <p
        v-if="errorMsg"
        class="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-1.5"
      >
        <svg
          class="w-3.5 h-3.5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        {{ errorMsg }}
      </p>
    </div>

    <!-- Footer -->
    <div class="flex gap-3 px-7 py-4 border-t border-gray-100">
      <button
        type="button"
        @click="emit('close')"
        class="flex-1 h-11 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:border-green-800 hover:text-green-800 hover:cursor-pointer transition-colors"
      >
        Cancel
      </button>
      <button
        @click="submitForm"
        :disabled="loading"
        class="flex-1 h-11 rounded-xl bg-green-950 text-white font-semibold text-sm hover:bg-green-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer flex items-center justify-center gap-2"
      >
        <svg
          v-if="loading"
          class="animate-spin w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="rgba(255,255,255,0.3)"
            stroke-width="3"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
        {{
          loading
            ? "Inserting..."
            : isInsertion
              ? "Insert Insertion"
              : "Insert PPA"
        }}
      </button>
    </div>
  </div>
</template>
