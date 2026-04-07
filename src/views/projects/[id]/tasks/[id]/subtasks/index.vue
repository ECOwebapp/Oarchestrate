<script setup vapor>
import Icons from "@/components/Icons.vue";
import Loading from "@/components/Loading.vue";
import { useSubtaskStore } from "@/stores/subtasks";
import { taskStore } from "@/stores/tasks";
import { useProjectStore } from "@/stores/projects";
import { useAuthStore } from "@/stores/useAuthStore";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import GridSubtasks from "@/components/Subtasks/GridSubtasks.vue";
import TableSubtasks from "@/components/Subtasks/TableSubtasks.vue";
import ChartSubtasks from "@/components/Subtasks/ChartSubtasks.vue";
import AddSubtask from "@/components/Subtasks/AddSubtask.vue";

const subtaskStore = useSubtaskStore();
const { subtasks } = storeToRefs(subtaskStore);
const tasksStore = taskStore();
const projectStore = useProjectStore();
const auth = useAuthStore();
const route = useRoute();
const state = ref("Grid View");
const addTask = ref(false);
const search = ref("");
const filter = ref("All");
const sortBy = ref("Recently Assigned");
const loading = storeToRefs(subtaskStore)?.loading;
const parentId = computed(() => Number(route.params.id));

// ── Only Directors and Unit Heads can select / delete ──────────────────────
const canDelete = computed(() => auth.isDirector || auth.isUnitHead);

// ── Selection state ─────────────────────────────────────────────────────────
const selectedIds = ref(new Set());
const selectionMode = ref(false);
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");
const taskDetail = ref(false);

const activeUnitId = computed(() => {
  const headRole = auth.positions?.find((p) => p.pos_id === 4);
  return headRole?.unit_id ?? null;
});

onMounted(async () => {
  await Promise.all([
    subtaskStore.fetchSubTasks(parentId.value),
    tasksStore.fetchTasks(),
    projectStore.fetchProjects(),
  ]);
});

const parentTask = computed(() => {
  return tasksStore.tasks.find((t) => t.id === parentId.value) || null;
});

const parentProjectTitle = computed(() => {
  if (!parentTask.value) return "Unknown PPA";
  const project = projectStore.projects.find(
    (p) => p.id === parentTask.value.parentId,
  );
  return project?.title || project?.name || "Unknown PPA";
});

const filterOpts = computed(() => {
  const base = ["All", "Regular", "Insertion", "Urgent", "Revision", "Overdue"];
  if (auth.isDirector || auth.isUnitHead) base.push("Pending", "Approved");
  return base;
});

const sortOpts = ["Recently Assigned", "Date Due", "Name A→Z", "Urgent First"];

const filtered = computed(() => {
  let list = subtasks.value;
  const q = search.value.toLowerCase();
  if (q)
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assigneeName?.toLowerCase().includes(q),
    );
  if (filter.value !== "All") {
    const f = filter.value.toLowerCase();
    list = list.filter((t) => {
      if (f === "urgent") return t.urgent;
      if (f === "revision") return t.revision;
      if (f === "regular") return t.type?.toLowerCase() === "regular";
      if (f === "insertion") return t.type?.toLowerCase() === "insertion";
      if (f === "overdue") return !!t.overdue;
      if (f === "pending") return !t.director;
      if (f === "approved") return t.director;
      return true;
    });
  }
  if (sortBy.value === "Date Due")
    list = [...list].sort((a, b) => new Date(a.to) - new Date(b.to));
  else if (sortBy.value === "Name A→Z")
    list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy.value === "Urgent First")
    list = [...list].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
  else list = [...list].sort((a, b) => new Date(b.from) - new Date(a.from));

  // Always bubble overdue subtasks to the top. Within overdue subtasks, sort by days overdue (most overdue first).
  list = list.sort((a, b) => {
    const oa = a.overdue ? 1 : 0;
    const ob = b.overdue ? 1 : 0;
    if (oa !== ob) return ob - oa;
    if (oa && ob) return (b.overdueDays || 0) - (a.overdueDays || 0);
    return 0;
  });
  return list;
});

// ── Permission check per task ────────────────────────────────────────────────
// Director: any task | Unit Head: only subtasks they assigned
const isDeletable = (task) => {
  if (auth.isDirector) return true;
  if (auth.isUnitHead) return task.assigner === auth.userID;
  return false;
};

// How many of the currently selected subtasks the current user can actually delete
const deletableSelectedCount = computed(
  () =>
    [...selectedIds.value].filter((id) => {
      const t = subtaskStore.subtasks.find((t) => t.id === id);
      return t && isDeletable(t);
    }).length,
);

// ── Selection helpers ────────────────────────────────────────────────────────
const selectedCount = computed(() => selectedIds.value.size);

// Subset of visible subtasks that this user is allowed to delete
const selectableTasks = computed(() => filtered.value.filter(isDeletable));

const allVisibleSelected = computed(
  () =>
    selectableTasks.value.length > 0 &&
    selectableTasks.value.every((t) => selectedIds.value.has(t.id)),
);

const someSelected = computed(
  () => selectedCount.value > 0 && !allVisibleSelected.value,
);

const toggleSelectMode = () => {
  selectionMode.value = !selectionMode.value;
  if (!selectionMode.value) {
    selectedIds.value = new Set();
    deleteError.value = "";
  }
};

const toggleTaskSelect = (task) => {
  if (!isDeletable(task)) return; // silently ignore non-deletable subtasks
  const next = new Set(selectedIds.value);
  if (next.has(task.id)) next.delete(task.id);
  else next.add(task.id);
  selectedIds.value = next;
};

const toggleSelectAll = () => {
  if (allVisibleSelected.value) {
    const next = new Set(selectedIds.value);
    selectableTasks.value.forEach((t) => next.delete(t.id));
    selectedIds.value = next;
  } else {
    const next = new Set(selectedIds.value);
    selectableTasks.value.forEach((t) => next.add(t.id));
    selectedIds.value = next;
  }
};

// ── Delete via store action ──────────────────────────────────────────────────
const deleteTasks = async () => {
  isDeleting.value = true;
  deleteError.value = "";
  try {
    const ids = [...selectedIds.value];
    await subtaskStore.deleteSubTasks(ids); // store handles auth filtering internally too
    selectedIds.value = new Set();
    selectionMode.value = false;
    showDeleteConfirm.value = false;
  } catch (err) {
    console.error("[Tasks] delete error:", err);
    deleteError.value =
      err.message || "Failed to delete subtasks. Please try again.";
  } finally {
    isDeleting.value = false;
  }
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  deleteError.value = "";
};

// ── Add task pre-fill ────────────────────────────────────────────────────────
const preFillData = ref(null);

const onAssignSubtask = (data) => {
  preFillData.value = data || {};
  addTask.value = true;
};

const onCloseAddTask = async (success) => {
  addTask.value = false;
  preFillData.value = null;

  if (success && taskDetail.value === false) {
    await subtaskStore.fetchSubTasks(parentId.value);
  }
};
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <Loading v-if="loading" :message="'Loading subtasks from the source...'" />

    <div v-else class="flex flex-col h-full min-h-0">
      <!-- ── Toolbar ── -->
      <div
        class="flex flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-10 py-4 flex-shrink-0"
      >
        <!-- Add Task -->
        <button
          v-if="
            !selectionMode &&
            (auth.isDirector || auth.isUnitHead || auth.isMember)
          "
          @click="addTask = true"
          class="flex items-center gap-2 bg-green-950 text-white font-bold h-11 px-5 rounded-2xl hover:bg-green-800 active:scale-95 transition-all text-sm flex-shrink-0 hover:cursor-pointer"
        >
          <Icons :icon="'add'" />
          <span class="hidden sm:inline">Add Subtask</span>
        </button>

        <!-- Select toggle — Director & Unit Head only -->
        <button
          v-if="canDelete"
          @click="toggleSelectMode"
          class="flex items-center gap-2 font-bold h-11 px-5 rounded-2xl transition-all text-sm flex-shrink-0"
          :class="
            selectionMode
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'outline outline-2 outline-green-950 text-green-950 bg-white hover:bg-green-50'
          "
        >
          <svg
            v-if="!selectionMode"
            class="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
          <span class="hidden sm:inline">{{
            selectionMode ? "Cancel" : "Select"
          }}</span>
        </button>

        <!-- Select All — only in selection mode -->
        <button
          v-if="selectionMode"
          @click="toggleSelectAll"
          :disabled="selectableTasks.length === 0"
          class="flex items-center gap-2 font-bold h-11 px-4 rounded-2xl transition-all text-sm outline outline-2 outline-green-950 bg-white text-green-950 hover:bg-green-50 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <div
            class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
            :class="
              allVisibleSelected
                ? 'bg-green-700 border-green-700'
                : someSelected
                  ? 'bg-green-200 border-green-700'
                  : 'border-gray-400'
            "
          >
            <svg
              v-if="allVisibleSelected"
              class="w-2.5 h-2.5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <svg
              v-else-if="someSelected"
              class="w-2.5 h-2.5 text-green-800"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 13H5v-2h14v2z" />
            </svg>
          </div>
          <span class="hidden sm:inline">All</span>
        </button>

        <!-- Selected count badge -->
        <Transition name="fade-slide">
          <div
            v-if="selectionMode && selectedCount > 0"
            class="flex items-center gap-1.5 h-11 px-4 rounded-2xl bg-green-950 text-white text-sm font-bold flex-shrink-0"
          >
            <span>{{ selectedCount }}</span>
            <span class="hidden sm:inline">selected</span>
            <!-- Warn Unit Head if some selections aren't deletable by them -->
            <span
              v-if="
                auth.isUnitHead &&
                !auth.isDirector &&
                deletableSelectedCount < selectedCount
              "
              class="text-amber-300 text-[10px] ml-1 hidden sm:inline"
            >
              ({{ deletableSelectedCount }} deletable)
            </span>
          </div>
        </Transition>

        <!-- Delete button — visible only when ≥1 deletable task is selected -->
        <Transition name="fade-slide">
          <button
            v-if="selectionMode && deletableSelectedCount > 0"
            @click="showDeleteConfirm = true"
            class="flex items-center gap-2 h-11 px-5 rounded-2xl font-bold text-sm transition-all bg-red-700 text-white hover:bg-red-800 active:scale-95 flex-shrink-0"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
              />
            </svg>
            <span class="hidden sm:inline">Delete</span>
          </button>
        </Transition>

        <!-- Search -->
        <div
          class="flex items-center rounded-2xl bg-white border border-gray-300 px-3 focus-within:border-green-800 focus-within:ring-2 focus-within:ring-green-800/20 transition-all flex-1 min-w-0 h-11"
        >
          <Icons :icon="'search'" class="text-gray-400 flex-shrink-0" />
          <input
            v-model="search"
            type="text"
            placeholder="Search tasks…"
            class="ml-2 flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>

        <!-- Filter -->
        <select
          v-model="filter"
          class="h-11 px-3 rounded-2xl border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-green-800 bg-white flex-shrink-0"
        >
          <option v-for="o in filterOpts" :key="o" :value="o">{{ o }}</option>
        </select>

        <!-- Sort -->
        <select
          v-model="sortBy"
          class="h-11 px-3 rounded-2xl border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-green-800 bg-white flex-shrink-0"
        >
          <option v-for="o in sortOpts" :key="o" :value="o">{{ o }}</option>
        </select>

        <!-- Count -->
        <span class="text-xs text-gray-500 flex-shrink-0 hidden sm:block">
          {{ filtered.length }} task{{ filtered.length !== 1 ? "s" : "" }}
        </span>
      </div>

      <!-- ── View ── -->
      <div
        class="flex-1 flex flex-col bg-white mx-4 sm:mx-6 lg:mx-10 rounded-xl shadow-md min-h-0 overflow-hidden"
      >
        <div
          class="px-5 py-3 flex items-center flex-wrap gap-2 border-b border-gray-200 flex-shrink-0 bg-white"
        >
          <router-link
            to="/projects"
            class="text-sm font-semibold text-gray-900 hover:text-gray-700 hover:bg-gray-100 px-2.5 py-1 rounded-md transition-colors truncate max-w-[170px] sm:max-w-[320px]"
            :title="parentProjectTitle"
          >
            {{ parentProjectTitle }}
          </router-link>
          <svg
            class="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
          <router-link
            v-if="parentTask"
            :to="`/projects/${parentTask.parentId}/tasks`"
            class="text-sm font-medium text-gray-700 hover:text-gray-600 hover:bg-gray-100 px-2.5 py-1 rounded-md transition-colors truncate max-w-[170px] sm:max-w-[320px]"
            :title="parentTask.name"
          >
            {{ parentTask.name }}
          </router-link>
          <span
            v-else
            class="text-sm font-medium text-gray-700 px-2.5 py-1 truncate max-w-[170px] sm:max-w-[320px]"
            title="Task"
          >
            Task
          </span>
          <svg
            class="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
          <span class="text-sm font-medium text-gray-600 px-2.5 py-1"
            >Subtasks</span
          >
        </div>

        <div class="flex-1 overflow-auto min-h-0">
          <GridSubtasks
            v-if="state === 'Grid View'"
            :subtasks="filtered"
            :selectable="selectionMode"
            :selected-ids="selectedIds"
            :is-deletable="isDeletable"
            @toggle-select="toggleTaskSelect"
            @assign-subtask="onAssignSubtask"
            :modal="loading"
            @open="taskDetail = true"
            @close="taskDetail = false"
            @success="
              () => {
                taskDetail = false;
                onCloseAddTask(true);
              }
            "
          />
          <TableSubtasks
            v-else-if="state === 'Table View'"
            :subtasks="filtered"
            :selectable="selectionMode"
            :selected-ids="selectedIds"
            :is-deletable="isDeletable"
            @toggle-select="toggleTaskSelect"
            @assign-subtask="onAssignSubtask"
            :modal="loading"
            @open="taskDetail = true"
            @close="taskDetail = false"
            @success="
              () => {
                taskDetail = false;
                onCloseAddTask(true);
              }
            "
          />
          <ChartSubtasks
            v-else-if="state === 'Chart View'"
            :subtasks="filtered"
          />
        </div>
      </div>

      <!-- ── View toggle ── -->
      <div class="flex justify-center gap-3 py-3 flex-shrink-0">
        <button
          v-for="btn in ['Grid View', 'Table View', 'Chart View']"
          :key="btn"
          @click="state = btn"
          class="text-sm font-bold h-10 px-5 rounded-xl cursor-pointer transition-all"
          :class="
            state === btn
              ? 'bg-green-950 text-white'
              : 'outline outline-2 outline-green-950 text-green-950 bg-white hover:bg-green-950 hover:text-white'
          "
        >
          {{ btn }}
        </button>
      </div>
    </div>

    <!-- ── Add Task Modal ── -->
    <Teleport to="#add-task">
      <Transition name="modal">
        <div
          v-if="addTask"
          class="fixed inset-0 z-150 flex items-center justify-center bg-black/50 px-4"
          @click.self="onCloseAddTask"
        >
          <AddSubtask
            @close="onCloseAddTask"
            @success="onCloseAddTask(true)"
            :design="false"
            :pre-fill="preFillData"
            :parent-id="parentId"
          />
        </div>
      </Transition>
    </Teleport>

    <!-- ── Delete Confirm Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4"
          @click.self="cancelDelete"
        >
          <div
            class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col gap-4"
          >
            <!-- Icon -->
            <div
              class="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto"
            >
              <svg
                class="w-6 h-6 text-red-700"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                />
              </svg>
            </div>

            <!-- Text -->
            <div class="text-center">
              <h3 class="font-bold text-green-950 text-lg">Delete Tasks</h3>
              <p class="text-gray-500 text-sm mt-1">
                You are about to permanently delete
                <span class="font-bold text-red-700">
                  {{ deletableSelectedCount }} task{{
                    deletableSelectedCount !== 1 ? "s" : ""
                  }} </span
                >. This cannot be undone.
              </p>
              <!-- Inform Unit Head that some selections are being skipped -->
              <p
                v-if="
                  auth.isUnitHead &&
                  !auth.isDirector &&
                  deletableSelectedCount < selectedCount
                "
                class="text-amber-700 text-xs mt-2 bg-amber-50 rounded-lg px-3 py-2"
              >
                {{ selectedCount - deletableSelectedCount }}
                task{{
                  selectedCount - deletableSelectedCount !== 1 ? "s" : ""
                }}
                assigned by others will be skipped.
              </p>
            </div>

            <!-- Error -->
            <p
              v-if="deleteError"
              class="text-red-600 text-xs text-center bg-red-50 rounded-lg px-3 py-2"
            >
              {{ deleteError }}
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="cancelDelete"
                :disabled="isDeleting"
                class="flex-1 h-11 rounded-xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                @click="deleteTasks"
                :disabled="isDeleting"
                class="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-700 hover:bg-red-800 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <svg
                  v-if="isDeleting"
                  class="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                {{ isDeleting ? "Deleting…" : "Delete" }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
    transform: scale(0.96);
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
    transform: scale(0.96);
  }
}

.fade-slide-enter-active {
  animation: fadeSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.fade-slide-leave-active {
  animation: fadeSlideOut 0.15s ease both;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeSlideOut {
  from {
    opacity: 1;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>
<route lang="yaml">
name: "Subtasks"
meta:
  requiresAuth: true
  layout: "projects"
</route>
