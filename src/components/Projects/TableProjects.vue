<script setup vapor>
import { ref } from "vue";
import TaskDetail from "../TaskDetail.vue";

const props = defineProps({
    items: Array,
    selectable: { type: Boolean, default: false },
    selectedIds: { type: Object, default: () => new Set() }, // Set of selected item ids
    isDeletable: { type: Function, default: () => false },
    itemLoading: { type: Boolean, default: false },
});
const emit = defineEmits([
    "assignSubitem",
    "toggle-select",
    "open",
    "close",
    "success",
]);
const selected = ref(null);
const loading = ref(false);
const success = ref(false);
const type = (item) => {
    if (!Object.hasOwn(item, "type")) return "Project";
    else return item.type;
};
const status = (item) => {
    if (item?.is_completed) {
        return { label: "Completed", cls: "bg-green-100 text-green-800" };
    }
    return { label: "Ongoing", cls: "bg-orange-100 text-orange-700" };
};

const fmt = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "2-digit",
          })
        : "—";

const statusCls = (item) => {
    if (item.director) return "bg-green-100 text-green-800";
    if (item.overdue) return "bg-red-100 text-red-800";
    if (item.unitHead) return "bg-amber-100 text-amber-800";
    return "bg-gray-100 text-gray-600";
};
const statusLabel = (item) => {
    if (item.director) return "Approved";
    if (item.overdue) return "Overdue";
    if (item.unitHead) return "Pending Director";
    return "Pending Unit Head";
};

const handleRowClick = (item) => {
    if (props.selectable && props.isDeletable(item)) {
        emit("toggle-select", item);
    }
};

const handleOpen = (item) => {
    if (props.selectable) return;
    selected.value = item;
    emit("open");
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

const handleAssign = (event) => {
    emit("assignSubitem", event);
    if (event) success.value = true;
};
</script>

<template>
    <div class="h-full min-h-0">
        <div class="overflow-auto h-full w-full">
            <table class="min-w-full text-sm border-collapse">
                <thead class="sticky top-0 z-10">
                    <tr>
                        <!-- Checkbox column header — only in selection mode -->
                        <th
                            v-if="selectable"
                            class="w-10 px-4 py-3 bg-green-950 border border-green-800"
                        />
                        <th
                            v-for="h in [
                                'Title',
                                'Assignee',
                                'Type',
                                'Deadline',
                                'Status',
                                'Urgent',
                                '',
                            ]"
                            :key="h"
                            :class="[
                                'px-4 py-3 text-left text-xs font-bold uppercase tracking-wider bg-green-950 text-white border border-green-800 whitespace-nowrap',
                                !props.itemLoading ? 'animate-slide-up' : '',
                            ]"
                        >
                            {{ h }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="items.length === 0">
                        <td
                            :colspan="selectable ? 8 : 7"
                            class="text-center py-16 text-gray-400 text-sm"
                        >
                            No items found
                        </td>
                    </tr>
                    <tr
                        v-for="(item, index) in items"
                        :key="item.id"
                        class="border-b border-gray-100 transition-colors"
                        :class="[
                            selectedIds.has(item.id)
                                ? 'bg-green-50'
                                : 'hover:bg-gray-50',
                            selectable && isDeletable(item)
                                ? 'cursor-pointer'
                                : '',
                            !props.itemLoading ? 'animate-slide-up' : '',
                        ]"
                        :style="{ animationDelay: `${index * 0.04}s` }"
                        @click="handleRowClick(item)"
                    >
                        <!-- Checkbox cell -->
                        <td
                            v-if="selectable"
                            class="px-4 py-3 text-center"
                            @click.stop="
                                isDeletable(item) && emit('toggle-select', item)
                            "
                        >
                            <div
                                class="w-5 h-5 rounded-md border-2 flex items-center justify-center mx-auto transition-all"
                                :class="
                                    selectedIds.has(item.id)
                                        ? 'bg-green-700 border-green-700'
                                        : isDeletable(item)
                                          ? 'border-gray-400 hover:border-green-600 bg-white'
                                          : 'border-gray-200 bg-gray-50 opacity-40'
                                "
                            >
                                <svg
                                    v-if="selectedIds.has(item.id)"
                                    class="w-3 h-3 text-white"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path
                                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                                    />
                                </svg>
                            </div>
                        </td>

                        <td
                            class="px-4 py-3 font-semibold text-gray-900 max-w-45 truncate"
                        >
                            {{ item.name }}
                        </td>
                        <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {{ item.assigneeName || "—" }}
                        </td>
                        <td class="px-4 py-3">
                            <span
                                class="px-2 py-0.5 text-xs font-bold rounded-full"
                                :class="
                                    item.type?.toLowerCase() === 'insertion'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-800'
                                "
                            >
                                {{ type(item) }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                            {{ fmt(item.to || item.deadline) }}
                        </td>
                        <td class="px-4 py-3">
                            <span
                                class="px-2 py-0.5 text-xs font-bold rounded-full"
                                :class="status(item).cls"
                            >
                                {{ status(item).label }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-center">
                            <span
                                v-if="item.urgent"
                                class="text-red-600 font-bold text-xs"
                                >⚑ Urgent</span
                            >
                            <span v-else class="text-gray-300 text-xs">—</span>
                        </td>
                        <td class="px-4 py-3 text-center" @click.stop>
                            <button
                                :disabled="selectable"
                                @click="handleOpen(item)"
                                class="bg-green-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-green-800 active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                View
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Transition name="modal">
            <TaskDetail
                v-if="selected"
                :item="selected"
                :loading="loading"
                @close="handleClose"
                @assignSubitem="handleAssign"
            />
        </Transition>
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
