<script setup vapor>
import { ref } from "vue";
import TaskCard from "./TaskCard.vue";
import TaskDetail from "../TaskDetail.vue";
import Loading from "../Loading.vue";

const props = defineProps({
    tasks: Array,
    selectable: { type: Boolean, default: false },
    selectedIds: { type: Object, default: () => new Set() }, // Set of selected task ids
    itemLoading: { type: Boolean, default: false },
    isDeletable: { type: Function, default: () => false },
    emptyTitle: { type: String, default: "No tasks found" },
    emptyHint: { type: String, default: "" },
});
const emit = defineEmits([
    "assignSubtask",
    "edit-task",
    "toggle-select",
    "open",
    "close",
    "success",
]);
const selected = ref(null);
const loading = ref(false);
const success = ref(false);

const handleOpen = (task) => {
    if (props.selectable) return;
    selected.value = task;
    emit("open");
};

const handleAssign = (event) => {
    emit("assignSubtask", event);
    if (event) success.value = true;
};

const handleEdit = (task) => {
    if (props.selectable) return;
    emit("edit-task", task);
};

const handleClose = () => {
    loading.value = true;
    selected.value = null;
    setTimeout(() => {
        loading.value = false;
        if (success.value) emit("success");
        else emit("close");
    }, 10);
};
</script>

<template>
    <div class="h-full min-h-0">
        <div
            v-if="props.tasks.length < 1"
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
            <TaskCard
                v-for="(task, index) in props.tasks"
                :key="task.id"
                :task="task"
                :selectable="props.selectable"
                :selected="props.selectedIds.has(task.id)"
                :is-deletable="props.isDeletable(task)"
                :item-loading="props.itemLoading"
                @open="handleOpen"
                @edit="handleEdit"
                @toggle-select="emit('toggle-select', $event)"
                :style="{ animationDelay: `${index * 0.03}s` }"
            />
        </div>

        <Transition name="loading">
            <TaskDetail
                v-if="selected"
                :task="selected"
                :loading="loading"
                @close="handleClose"
                @assignSubtask="handleAssign"
            />
        </Transition>
    </div>
</template>

<style scoped>
.loading-enter-active {
    animation: loadingIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.loading-leave-active {
    animation: loadingOut 0.15s ease both;
}

@keyframes loadingIn {
    from {
        opacity: 0;
        transform: scale(0.97);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes loadingOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
        transform: scale(0.97);
    }
}
</style>
