<script setup vapor>
import { useAuthStore } from "@/stores/useAuthStore";
import { mdiAccount, mdiLink } from "@mdi/js";
import { computed } from "vue";

const props = defineProps({
    subtask: Object,
    selectable: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
    itemLoading: { type: Boolean, default: false },
});
const emit = defineEmits(["assignSubtask", "open", "toggle-select"]);
const auth = useAuthStore();

const daysLeft = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(props.subtask?.to);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / 86400000);
});

const progress = computed(() => {
    const start = new Date(props.subtask?.from).getTime();
    const end = new Date(props.subtask?.to).getTime();
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
});

const statusLabel = computed(() => {
    if (props.subtask?.director)
        return { label: "Approved", cls: "bg-green-100 text-green-800" };
    if (props.subtask?.overdue)
        return { label: "Overdue", cls: "bg-red-100 text-red-800" };
    if (props.subtask?.unitHead)
        return { label: "Pending", cls: "bg-amber-100 text-amber-800" };
    if (props.subtask?.revision)
        return {
            label: "Needs Revision",
            cls: "bg-orange-100 text-orange-700",
        };
    if (
        (props.subtask?.assigneeIsOffice || props.subtask?.isSelfAssigned) &&
        props.subtask?.outputLink
    )
        return {
            label: "Waiting for Submission",
            cls: "bg-amber-100 text-amber-800",
        };
    if (
        !props.subtask?.assigneeIsOffice &&
        !props.subtask?.isSelfAssigned &&
        props.subtask?.outputLink
    )
        return { label: "Pending Unit Head", cls: "bg-gray-100 text-gray-600" };
    return { label: "Pending", cls: "bg-gray-100 text-gray-600" };
});

const cardClass = computed(() => {
    if ((auth.isUnitHead || auth.isDirector) && !props.subtask?.outputLink) {
        return "opacity-50";
    }
    return "";
});

const showAssignee = computed(
    () =>
        props.subtask?.assigneeName && props.subtask?.assignee !== auth.userID,
);

const isResubmitted = computed(
    () =>
        props.subtask?.outputLink &&
        !props.subtask?.revision &&
        !props.subtask?.director &&
        props.subtask?.revisedAt,
);

const handleClick = () => {
    if (props.selectable) {
        emit("toggle-select", props.project);
    } else {
        emit("open");
    }
};
const handleCheckboxClick = (e) => {
    e.stopPropagation();
    emit("toggle-select", props.subtask);
};

const handleEditClick = () => {
    emit("assignSubtask", {
        id: props.subtask.id,
        parentId: props.subtask.parentTaskId,
        name: props.subtask.name,
        description: props.subtask.description,
        endDate: props.subtask.endDate,
        assignee: props.subtask.assignee,
        type: props.subtask.typeId,
        urgent: props.subtask.urgent,
        design: props.subtask.design,
        outputLink: props.subtask.outputLink,
    });
};

const canEdit = () => {
    // 1. Directors always have access
    if (auth.isDirector) return true;

    // 2. If it's unassigned, only the Unit Head (or the person who created it) should touch it
    if (!props.subtask?.assignee) {
        return auth.isUnitHead || auth.isSeniorDraftsman;
    }

    // 3. If it IS assigned, only the original assigner can edit it
    return props.subtask?.assigner === auth.userID;
};
</script>

<template>
    <div
        @click="handleClick"
        class="relative flex flex-col rounded-2xl py-3 px-3 sm:px-4 overflow-hidden bg-white shadow-lg hover:shadow-xl cursor-pointer transition-all duration-200 hover:-translate-y-0.5 group h-full min-h-40 sm:min-h-44"
        :class="[
            cardClass,
            selected ? 'ring-2 ring-green-600 ring-offset-1' : '',
            subtask.urgent
                ? 'outline-2 outline-red-800'
                : subtask.revision
                  ? 'outline-2 outline-orange-400'
                  : 'outline-2 outline-green-950',
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
            v-else-if="canEdit"
            @click.stop="handleEditClick"
            class="absolute top-2.5 right-2.5 z-20 w-10 h-5 rounded-sm flex items-center justify-center transition-all duration-150 shadow-sm text-xs bg-yellow-500"
        >
            Edit
        </div>

        <div
            v-if="selected"
            class="absolute inset-0 bg-green-50/40 rounded-2xl pointer-events-none"
        />

        <div
            v-if="subtask.urgent || subtask.design"
            class="absolute top-0 right-0 h-16 w-16 overflow-hidden pointer-events-none"
        >
            <div
                class="absolute transform rotate-45 text-white text-[10px] font-bold py-0.5 w-40 bottom-7 -right-14 text-center uppercase tracking-wide"
                :class="subtask.urgent ? 'bg-red-800' : 'bg-green-800'"
            >
                {{ subtask.urgent ? "Urgent" : "Design" }}
            </div>
        </div>

        <div class="flex items-center gap-1.5 mb-2 flex-wrap">
            <span
                class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap"
                :class="
                    subtask.type?.toLowerCase() === 'insertion'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-800'
                "
            >
                {{ subtask.type }}
            </span>
            <span
                v-if="subtask.revision"
                class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 flex items-center gap-1 whitespace-nowrap"
            >
                <span
                    :class="[
                        'w-1.5 h-1.5 rounded-full bg-orange-500 inline-block',
                        !props.itemLoading ? 'animate-slide-up' : '',
                    ]"
                />
                Revision
            </span>
            <span
                v-if="isResubmitted"
                class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 whitespace-nowrap"
            >
                <svg
                    class="w-3 h-3 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path :d="mdiLink" />
                </svg>
                Resubmitted
            </span>
        </div>

        <p
            class="truncate font-bold text-sm mb-1 pr-1"
            :class="subtask.urgent ? 'text-red-900' : 'text-green-950'"
        >
            {{ subtask.name }}
        </p>

        <p
            class="line-clamp-2 text-xs text-gray-500 italic mb-2 leading-relaxed"
        >
            {{ subtask.description }}
        </p>

        <div class="flex items-center justify-between gap-2 mb-2">
            <p
                v-if="showAssignee"
                class="text-[10px] sm:text-xs text-gray-400 truncate flex items-center gap-1"
            >
                <svg
                    class="w-3 h-3 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path :d="mdiAccount" />
                </svg>
                <span class="truncate">{{ subtask.assigneeName }}</span>
            </p>

            <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                :class="statusLabel.cls"
            >
                {{ statusLabel.label }}
            </span>
        </div>

        <div
            v-if="subtask.outputLink && !subtask.director"
            class="flex items-center gap-1 text-[10px] text-blue-600 font-semibold mb-2"
        >
            <svg
                class="w-3 h-3 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
            >
                <path :d="mdiLink" />
            </svg>
            Output submitted
        </div>

        <div class="flex items-center gap-2 mt-auto pt-1">
            <div
                class="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden min-w-0"
            >
                <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="
                        subtask.urgent
                            ? 'bg-red-800'
                            : subtask.director
                              ? 'bg-green-600'
                              : 'bg-green-950'
                    "
                    :style="{ width: progress + '%' }"
                />
            </div>
            <p
                class="text-[10px] font-bold italic shrink-0"
                :class="
                    daysLeft < 0 && !subtask.director
                        ? 'text-red-600'
                        : subtask.director
                          ? 'text-green-600'
                          : 'text-gray-500'
                "
            >
                {{
                    subtask.director
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
