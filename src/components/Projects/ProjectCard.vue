<script setup vapor>
import { mdiAccount } from "@mdi/js";
import { computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import router from "@/router";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { isDirector } = storeToRefs(authStore);

const props = defineProps({
    project: Object,
    selectable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    itemLoading: { type: Boolean, default: false },
    editMode: { type: Boolean, default: false },
});
const emit = defineEmits([
    "toggle-select",
    "open",
    "edit",
    "visibleEditToggle",
]);
const daysLeft = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(props.project?.deadline);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / 86400000);
});

const progress = computed(() => {
    const start = new Date(props.project?.created_at).getTime();
    const end = new Date(props.project?.deadline).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
});

const projectStatusChip = computed(() => {
    if (props.project?.is_completed) {
        return { label: "Completed", cls: "bg-green-100 text-green-800" };
    }
    return { label: "Ongoing", cls: "bg-orange-100 text-orange-700" };
});

const handleClick = () => {
    if (props.selectable) {
        emit("toggle-select", props.project);
    } else if (props.project?.standaloneInsertion) {
        emit("open", props.project);
    } else {
        router.push(`/projects/${props.project.id}/tasks/`);
    }
};

const handleCheckboxClick = (e) => {
    e.stopPropagation();
    emit("toggle-select", props.project);
};

const handleEditClick = () => {
    emit("edit", props.task);
};

const canEdit = computed(() => isDirector.value);
onMounted(() => emit("visibleEditToggle", canEdit.value));
</script>

<template>
    <div
        @click="handleClick"
        :class="[
            'relative flex flex-col rounded-2xl py-3 px-3 sm:px-4 overflow-hidden bg-white shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group h-full min-h-40 sm:min-h-44',
            !props.itemLoading ? 'animate-slide-up' : '',
        ]"
    >
        <div
            v-if="selectable"
            @click.stop="handleCheckboxClick"
            class="absolute top-2.5 right-2.5 z-20 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150 shadow-sm"
            :class="
                selected
                    ? 'bg-green-700 border-green-700'
                    : 'bg-white/90 border-gray-400 hover:border-green-600'
            "
        >
            <svg
                v-if="selected"
                class="w-3 h-3 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
        </div>

        <div
            v-else-if="canEdit && props.editMode"
            @click.stop="handleEditClick"
            class="absolute top-2.5 right-2.5 z-20 w-10 h-5 rounded-sm flex items-center justify-center transition-all duration-150 shadow-sm text-xs bg-yellow-500"
        >
            Edit
        </div>

        <div
            v-if="selected"
            class="absolute inset-0 bg-green-50/40 rounded-2xl pointer-events-none"
        />

        <div class="flex items-center gap-1.5 mb-2 flex-wrap">
            <span
                class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap"
                :class="projectStatusChip.cls"
            >
                <span
                    class="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                    :class="
                        project?.is_completed ? 'bg-green-500' : 'bg-orange-500'
                    "
                />
                {{ projectStatusChip.label }}
            </span>
        </div>

        <p class="truncate font-bold text-sm mb-1 pr-1">
            {{ project.name }}
        </p>

        <p
            class="line-clamp-2 text-xs text-gray-500 italic mb-2 leading-relaxed"
        >
            {{ project.description }}
        </p>

        <div class="flex items-center justify-between gap-2 mb-2">
            <p
                class="text-[10px] sm:text-xs text-gray-400 truncate flex items-center gap-1"
            >
                <svg
                    class="w-3 h-3 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path :d="mdiAccount" />
                </svg>
                <span class="truncate">{{
                    project?.directorName || project?.director
                }}</span>
            </p>

            <!-- <span class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" :class="statusLabel.cls">
        {{ statusLabel.label }}
      </span> -->
        </div>

        <div class="flex items-center gap-2 mt-auto pt-1">
            <div
                class="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden min-w-0"
            >
                <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="
                        project?.is_completed ? 'bg-green-600' : 'bg-green-950'
                    "
                    :style="{ width: progress + '%' }"
                />
            </div>
            <p
                class="text-[10px] font-bold italic shrink-0"
                :class="
                    daysLeft < 0 && !project.director
                        ? 'text-red-600'
                        : project.director
                          ? 'text-green-600'
                          : 'text-gray-500'
                "
            >
                {{
                    project?.is_completed
                        ? "Done"
                        : daysLeft < 0
                          ? `${Math.abs(daysLeft)}d overdue`
                          : daysLeft === 0
                            ? "Due today!"
                            : `${daysLeft}d left`
                }}
            </p>
        </div>
    </div>
</template>
