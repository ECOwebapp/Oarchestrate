<script setup vapor>
import { useAuthStore } from "@/stores/useAuthStore";
import { mdiAccount, mdiLink } from "@mdi/js";
import { computed } from "vue";
import router from "@/router";

const props = defineProps({
    project: Object,
    selectable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-select", "open"]);
const auth = useAuthStore();

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
</script>

<template>
    <div
        @click="handleClick"
        class="relative flex flex-col rounded-2xl py-3 px-3 sm:px-4 overflow-hidden bg-white shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group animate-slide-up h-full min-h-[160px] sm:min-h-[176px]"
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
                class="text-[10px] font-bold italic flex-shrink-0"
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
