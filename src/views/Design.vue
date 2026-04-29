<script setup vapor>
import Icons from "@/components/Icons.vue";
import Loading from "@/components/Loading.vue";
import ChartSubtasks from "@/components/Subtasks/ChartSubtasks.vue";
import GridSubtasks from "@/components/Subtasks/GridSubtasks.vue";
import TableSubtasks from "@/components/Subtasks/TableSubtasks.vue";
import { useSubtaskStore } from "@/stores/subtasks";
import { taskStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/useAuthStore";
import { computed, onMounted, ref } from "vue";

const store = taskStore();
const subtaskStore = useSubtaskStore();
const auth = useAuthStore();
const state = ref("Grid View");
const addTask = ref(false);
const search = ref("");
const filter = ref("All");
const sortBy = ref("Recently Assigned");
const loading = ref(false);

const taskDetail = ref(false);

// ── Selection state ─────────────────────────────────────────────────────────
const selectedIds = ref(new Set());
const selectionMode = ref(false);

const tasks = computed(() => {
    return [
        ...store.tasks.filter((t) => t.design),
        ...subtaskStore.subtasks.filter((st) => st.design),
    ];
});

onMounted(async () => {
    loading.value = true;
    await Promise.all([store.fetchTasks(), subtaskStore.fetchSubTasks()]);
    loading.value = false;
});

const filterOpts = computed(() => {
    const base = ["All", "Regular", "Insertion", "Urgent", "Revision"];
    // For design tasks: show "Pending Unit Head", "Pending Director", and "Approved" filters
    if (auth.isDirector || auth.isUnitHead)
        base.push("Pending Unit Head", "Pending Director", "Approved");
    return base;
});

const sortOpts = ["Recently Assigned", "Date Due", "Name A→Z", "Urgent First"];

const filtered = computed(() => {
    let list = tasks.value;
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
            // New design-specific filters
            if (f === "pending unit head")
                return t.design && t.outputLink && !t.designApproval?.unit_head;
            if (f === "pending director")
                return t.design && t.designApproval?.unit_head && !t.director;
            if (f === "approved") return t.director;
            // Fallback for old filter values
            if (f === "pending") return !t.director;
            return true;
        });
    }
    if (sortBy.value === "Date Due")
        list = [...list].sort((a, b) => new Date(a.to) - new Date(b.to));
    else if (sortBy.value === "Name A→Z")
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy.value === "Urgent First")
        list = [...list].sort(
            (a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0),
        );
    else list = [...list].sort((a, b) => new Date(b.from) - new Date(a.from));
    return list;
});

// ── Edit task modal ────────────────────────────────────────────────────────
const preFillData = ref(null);

const onAssignSubtask = (data) => {
    if (!data) return;

    // Extract subtask from event data (comes from TaskDetail.pickMemberAndAssign)
    const subtask = data.subtask || data;
    const parentTask = data.parentTask;

    // Get deadline from multiple possible sources
    const deadline =
        parentTask?.to ||
        parentTask?.endDate ||
        subtask?.to ||
        subtask?.endDate ||
        null;

    preFillData.value = {
        id: subtask.id, // CRITICAL: Must have ID for update-only logic
        name: subtask.name || "",
        description: subtask.description || "",
        endDate: deadline, // Use the resolved deadline
        type: parentTask?.typeId || 1,
        urgent: subtask.urgent || false,
        design: true, // Always mark prefilled tasks as design tasks
    };
    addTask.value = true;
};

const onCloseAddTask = async (success) => {
    addTask.value = false;
    preFillData.value = null;

    if (success && taskDetail.value === false) {
        await Promise.all([store.fetchTasks(), subtaskStore.fetchSubTasks()]);
    }
};
</script>

<template>
    <div class="flex flex-col h-full min-h-0">
        <Loading v-if="loading" :message="'Loading best designs...'" />
        <div v-else class="flex flex-col h-full min-h-0">
            <!-- ── Toolbar ── -->
            <div
                class="flex flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-10 py-4 shrink-0"
            >
                <!-- Search -->
                <div
                    class="flex items-center rounded-2xl bg-white border border-gray-300 px-3 focus-within:border-green-800 focus-within:ring-2 focus-within:ring-green-800/20 transition-all flex-1 min-w-0 h-11"
                >
                    <Icons
                        :icon="'search'"
                        class="text-gray-400 flex-shrink-0"
                    />
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
                    <option v-for="o in filterOpts" :key="o" :value="o">
                        {{ o }}
                    </option>
                </select>

                <!-- Sort -->
                <select
                    v-model="sortBy"
                    class="h-11 px-3 rounded-2xl border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-green-800 bg-white flex-shrink-0"
                >
                    <option v-for="o in sortOpts" :key="o" :value="o">
                        {{ o }}
                    </option>
                </select>

                <!-- Count -->
                <span
                    class="text-xs text-gray-500 flex-shrink-0 hidden sm:block"
                >
                    {{ filtered.length }} task{{
                        filtered.length !== 1 ? "s" : ""
                    }}
                </span>
            </div>

            <!-- ── View ── -->
            <div
                class="flex-1 overflow-auto bg-white mx-4 sm:mx-6 lg:mx-10 rounded-xl shadow-md min-h-0"
            >
                <GridSubtasks
                    v-if="state === 'Grid View'"
                    :subtasks="filtered"
                    :selectable="selectionMode"
                    :selected-ids="selectedIds"
                    :is-deletable="false"
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
                    :is-deletable="false"
                    @toggle-select="toggleTaskSelect"
                    @assign-subtask="onAssignSubtask"
                />
                <ChartSubtasks
                    v-else-if="state === 'Chart View'"
                    :subtasks="filtered"
                />
            </div>

            <!-- ── View toggle ── -->
            <div class="flex justify-center py-3 flex-shrink-0">
                <div
                    class="inline-flex flex-wrap items-center gap-1 rounded-2xl bg-gray-100 p-1"
                >
                    <button
                        v-for="btn in ['Grid View', 'Table View', 'Chart View']"
                        :key="btn"
                        @click="state = btn"
                        class="group flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all cursor-pointer"
                        :class="
                            state === btn
                                ? 'bg-white text-green-900 shadow-sm ring-1 ring-green-900/10'
                                : 'text-gray-600 hover:text-green-900 hover:bg-white/80'
                        "
                    >
                        <Icons
                            :icon="
                                btn === 'Grid View'
                                    ? 'grid'
                                    : btn === 'Table View'
                                      ? 'table'
                                      : 'chart'
                            "
                            iconClass="w-3.5 h-3.5"
                        />
                        <span>{{ btn }}</span>
                    </button>
                </div>
            </div>
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
