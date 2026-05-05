<script setup vapor>
import AddProject from "@/components/Projects/AddProject.vue";
import GridProjects from "@/components/Projects/GridProjects.vue";
import TableProjects from "@/components/Projects/TableProjects.vue";
import Icons from "@/components/Icons.vue";
import ChartProjects from "@/components/Projects/ChartProjects.vue";
import ProjectNavBar from "@/components/Projects/ProjectNavBar.vue";
import AnimateLoadingLine from "@/components/AnimateLoadingLine.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { useProjectStore } from "@/stores/projects";
import { useAuthStore } from "@/stores/useAuthStore";
import { computed, onMounted, onUnmounted, ref, nextTick } from "vue";
import { storeToRefs } from "pinia";

const projectStore = useProjectStore();
const fetchItems = async () => await projectStore.fetchProjects();
const auth = useAuthStore();
const state = ref("Grid View");
const addTask = ref(false);
const search = ref("");
const filter = ref("All");
const sortBy = ref("Recently Assigned");
const { projects, loading: projectLoading } = storeToRefs(projectStore);
const loading = projectLoading;
const isMobile = ref(window.innerWidth < 640);
const checkViewport = () => (isMobile.value = window.innerWidth < 640);

const isAlive = ref(true);
const reload = async () => {
    isAlive.value = false; // Disconnect
    await Promise.all([fetchItems(), nextTick()]); // Wait for DOM to update
    isAlive.value = true; // Reconnect
};

const hierarchyItems = computed(() => [{ label: "PPAs", current: true }]);

// ── Only Directors and Unit Heads can select / delete ──────────────────────
const canDelete = computed(() => auth.isDirector);

// ── Selection state ─────────────────────────────────────────────────────────
const selectedIds = ref(new Set());
const selectionMode = ref(false);
const showDeleteConfirm = ref(false);
const isDeleting = ref(false);
const deleteError = ref("");

onMounted(() => {
    projects.value = [];
    fetchItems();
    window.addEventListener("resize", checkViewport);
});

const filterOpts = computed(() => {
    const base = ["All", "Urgent", "Revision", "Overdue"];
    if (auth.isDirector || auth.isUnitHead) base.push("Pending", "Approved");
    return base;
});

const sortOpts = ["Recently Assigned", "Date Due", "Name A→Z", "Urgent First"];
const projectEmptyTitle = computed(() => "No PPAs found");

const projectEmptyHint = computed(() => {
    if (search.value || filter.value !== "All") {
        return "Try clearing search or adjusting the filters.";
    }
    return "Add a PPA to populate this view.";
});

const filtered = computed(() => {
    let list = projects.value;

    const q = search.value.toLowerCase();
    if (q)
        list = list.filter(
            (t) =>
                (t.title || t.name || "").toLowerCase().includes(q) ||
                (t.description || "").toLowerCase().includes(q) ||
                String(t.directorName || t.director || "")
                    .toLowerCase()
                    .includes(q),
        );
    if (filter.value !== "All") {
        const f = filter.value.toLowerCase();
        list = list.filter((t) => {
            if (f === "urgent") return t.urgent;
            if (f === "revision") return t.revision;
            if (f === "overdue") return !!t.overdue;
            if (f === "pending") return !t.director;
            if (f === "approved") return t.director;
            return true;
        });
    }
    if (sortBy.value === "Date Due")
        list = [...list].sort(
            (a, b) =>
                new Date(a.deadline || a.to) - new Date(b.deadline || b.to),
        );
    else if (sortBy.value === "Name A→Z")
        list = [...list].sort((a, b) =>
            (a.title || a.name || "").localeCompare(b.title || b.name || ""),
        );
    else if (sortBy.value === "Urgent First")
        list = [...list].sort(
            (a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0),
        );
    else
        list = [...list].sort(
            (a, b) =>
                new Date(b.created_at || b.from || 0) -
                new Date(a.created_at || a.from || 0),
        );

    // Always bubble overdue tasks to the top. Within overdue tasks, sort by days overdue (most overdue first).
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
// Director: any task | Unit Head: only tasks they assigned
const isDeletable = (task) => {
    if (auth.isDirector) return true;
    return false;
};

// How many of the currently selected tasks the current user can actually delete
const deletableSelectedCount = computed(
    () =>
        [...selectedIds.value].filter((id) => {
            const t = projectStore.projects.find((p) => p.id === id);
            return t && isDeletable(t);
        }).length,
);

// ── Selection helpers ────────────────────────────────────────────────────────
const selectedCount = computed(() => selectedIds.value.size);

// Subset of visible tasks that this user is allowed to delete
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

const toggleTaskSelect = (projects) => {
    if (!isDeletable(projects)) return; // silently ignore non-deletable tasks
    const next = new Set(selectedIds.value);
    if (next.has(projects.id)) next.delete(projects.id);
    else next.add(projects.id);
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
        await projectStore.deleteProjects(ids); // store handles auth filtering internally too
        selectedIds.value = new Set();
        selectionMode.value = false;
        showDeleteConfirm.value = false;
    } catch (err) {
        console.error("[Projects] delete error:", err);
        deleteError.value =
            err.message || "Failed to delete projects. Please try again.";
    } finally {
        isDeleting.value = false;
    }
};

const cancelDelete = () => {
    showDeleteConfirm.value = false;
    deleteError.value = "";
};

const onCloseAddProject = async (success) => {
    addTask.value = false;

    if (success) {
        await projectStore.fetchProjects();
    }
};

onUnmounted(() => window.removeEventListener("resize", checkViewport));
</script>

<template>
    <div class="flex flex-col h-full min-h-0">
        <div class="flex flex-col h-full min-h-0">
            <!-- ── Toolbar ── -->
            <ProjectNavBar
                v-model:search="search"
                v-model:filter="filter"
                v-model:sort="sortBy"
                :is-mobile="isMobile"
                :selection-mode="selectionMode"
                :can-delete="canDelete"
                :is-director="auth.isDirector"
                :is-disabled="selectableTasks.length < 1"
                :is-deletable="selectionMode && deletableSelectedCount > 0"
                :selected-count="selectedCount"
                :selected="{ allVisibleSelected, someSelected }"
                :option-list="{ filterOpts, sortOpts }"
                :placeholder-text="'PPA'"
                @add="addTask = true"
                @toggle-single="toggleSelectMode"
                @toggle-all="toggleSelectAll"
                @toggle-select="toggleSelectMode"
                @delete-modal="showDeleteConfirm = true"
                @reload="reload"
            />
            <!-- ── View ── -->
            <div
                class="flex-1 flex flex-col bg-white mx-4 sm:mx-6 lg:mx-10 rounded-xl shadow-md min-h-0 overflow-hidden"
            >
                <Breadcrumb :hierarchy-items="hierarchyItems" />
                <div
                    v-for="isLoading in [{ load: !isAlive || loading }]"
                    :key="isLoading.load"
                    class="flex-1 overflow-auto min-h-0"
                >
                    <AnimateLoadingLine :loading="isLoading.load" />

                    <div
                        :class="
                            isLoading.load
                                ? 'opacity-60 pointer-events-none'
                                : ''
                        "
                    >
                        <GridProjects
                            v-if="state === 'Grid View'"
                            :items="filtered"
                            :selectable="selectionMode"
                            :selected-ids="selectedIds"
                            :is-deletable="isDeletable"
                            @toggle-select="toggleTaskSelect"
                            :empty-title="projectEmptyTitle"
                            :empty-hint="projectEmptyHint"
                            @success="onCloseAddProject(true)"
                        />
                        <TableProjects
                            v-else-if="state === 'Table View'"
                            :items="filtered"
                            :selectable="selectionMode"
                            :selected-ids="selectedIds"
                            :is-deletable="isDeletable"
                            @toggle-select="toggleTaskSelect"
                            :item-loading="loading"
                            @success="onCloseAddProject(true)"
                        />
                        <ChartProjects
                            v-else-if="state === 'Chart View'"
                            :tasks="filtered"
                        />
                    </div>
                </div>
            </div>

            <!-- ── View toggle ── -->
            <div class="flex justify-center py-3 shrink-0">
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

        <!-- ── Add Task Modal ── -->
        <Teleport to="#add-task">
            <Transition name="modal">
                <div
                    v-if="addTask"
                    class="fixed inset-0 z-150 flex items-center justify-center bg-black/50 px-4"
                    @click.self="onCloseAddProject"
                >
                    <AddProject
                        @close="onCloseAddProject"
                        @success="onCloseAddProject(true)"
                    />
                </div>
            </Transition>
        </Teleport>

        <!-- ── Delete Confirm Modal ── -->
        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="showDeleteConfirm"
                    class="fixed inset-0 z-200 flex items-center justify-center bg-black/50 px-4"
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
                            <h3 class="font-bold text-green-950 text-lg">
                                Delete Tasks
                            </h3>
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
                                    selectedCount - deletableSelectedCount !== 1
                                        ? "s"
                                        : ""
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
                                class="flex-1 h-11 rounded-xl font-bold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 hover:cursor-pointer transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                @click="deleteTasks"
                                :disabled="isDeleting"
                                class="flex-1 h-11 rounded-xl font-bold text-sm text-white bg-red-700 hover:bg-red-800 hover:cursor-pointer active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
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
name: "Projects"
meta:
    requiresAuth: true
    layout: "projects"
</route>
