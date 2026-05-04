<script setup vapor>
import { useDesignStore } from "@/stores/design";
import { useMemberStore } from "@/stores/member";
import { usePosStore } from "@/stores/positions";
import { useTaskStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/useAuthStore";
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";

const emit = defineEmits(["close", "success"]);
const props = defineProps({
    design: { type: Boolean, default: false },
    preFill: { type: Object, default: null },
    parentId: { type: Number },
    defaultType: { type: Number, default: null },
    lockType: { type: Boolean, default: false },
});

const memberStore = useMemberStore();
const posStore = usePosStore();
const taskStore = useTaskStore();
const designStore = useDesignStore();
const auth = useAuthStore();

const { tasks } = storeToRefs(taskStore);

const loading = ref(false);
const subTasks = ref([{ text: "" }]);
const outputUrl = ref("");
const errorMsg = ref("");
const showBulk = ref(false);

// ── Upload state ──────────────────────────────────────────────────────────────
const uploadMode = ref("link"); // 'link' | 'file'
const uploadLoading = ref(false);
const uploadSuccess = ref(false);
const uploadError = ref("");
const uploadedFileName = ref("");
const fileInputRef = ref(null);

const newTask = ref({
    id: null,
    parentId: props.parentId ?? null,
    name: "",
    description: "",
    endDate: null,
    assignee: null,
    subtaskId: null,
    parentTask: null,
    type: props.defaultType ?? "",
    urgent: false,
    outputLink: "",
});

onMounted(async () => {
    await Promise.all([
        memberStore.fetchMembers(),
        posStore.fetchMemberPos(),
        posStore.fetchPos(),
    ]);
    if (props.preFill) applyPreFill(props.preFill);
});

const applyPreFill = (fill) => {
    if (!fill) return;
    newTask.value = fill || {};

    if (
        props.lockType &&
        props.defaultType !== null &&
        props.defaultType !== undefined &&
        !newTask.value.id
    ) {
        newTask.value.type = Number(props.defaultType);
        newTask.value.assignee = auth.userID;
    }

    console.log(fill);
};

watch(
    () => props.preFill,
    (fill) => {
        if (fill && memberStore.members.length > 0) applyPreFill(fill);
    },
);

watch(
    () => props.defaultType,
    (type) => {
        if (type !== null && type !== undefined) {
            newTask.value.type = Number(type);
        }
    },
    { immediate: true },
);

// ── Position ID constants ─────────────────────────────────────────────────────
const POS_UNIT_HEAD = 4;
const DIRECTOR_ASSIGNABLE = new Set(["2", "3", "4", "12"]);
const DIRECTOR_ASSIGNABLE_NR = [2, 3, 4, 12];

// ── Shared helper ─────────────────────────────────────────────────────────────
const _resolvePosName = (userId, allPositions, context = null) => {
    // 1. Get all raw positions for the user
    const userRows = allPositions.filter(
        (p) => String(p.user_id) === String(userId),
    );
    if (!userRows.length) return "No Position";

    let targetRows = [];

    // Case A: context is the Director's allowed Position IDs (Array: [2, 3, 4, 12])
    if (Array.isArray(context)) {
        const allowedIds = context.map(String);
        targetRows = userRows.filter((p) =>
            allowedIds.includes(String(p.pos_id)),
        );
    }
    // Case B: context is the Unit Head's specific Unit ID (Number or String)
    else if (
        context !== null &&
        (typeof context === "string" || typeof context === "number")
    ) {
        targetRows = userRows.filter(
            (p) => String(p.unit_id) === String(context),
        );
    }

    // Fallback: If context filtering yields nothing, use all user rows
    const finalRows = targetRows.length > 0 ? targetRows : userRows;

    // 2. Map to names and join
    const names = finalRows
        .map(
            (row) =>
                posStore.position.find(
                    (p) => String(p.id) === String(row?.pos_id),
                )?.name,
        )
        .filter(Boolean);

    return [...new Set(names)].join(" | ") || "No Position";
};

// ── Assignable members ────────────────────────────────────────────────────────
const assignableMembers = computed(() => {
    const allMembers = memberStore.members || [];
    const allPositions = posStore.memberPos || [];
    const PDU_UNIT_ID = 1;

    if (auth.isDirector) {
        const allowedIds = new Set(
            allPositions
                .filter((p) => DIRECTOR_ASSIGNABLE.has(String(p.pos_id)))
                .map((p) => String(p.user_id)),
        );
        return allMembers
            .filter((m) => allowedIds.has(String(m.id)))
            .map((m) => ({
                ...m,
                pos_name: _resolvePosName(
                    m.id,
                    allPositions,
                    DIRECTOR_ASSIGNABLE_NR,
                ),
            }));
    }

    if (auth.isUnitHead) {
        const unitId =
            auth.positions.find((p) => p.pos_id === POS_UNIT_HEAD)?.unit_id ??
            null;
        const selfMember = allMembers.find(
            (m) => String(m.id) === String(auth.userID),
        );
        const uhPosName =
            posStore.position.find((p) => p.id === POS_UNIT_HEAD)?.name ||
            "Unit Head";
        const selfEntry = selfMember
            ? { ...selfMember, pos_name: uhPosName, isSelf: true }
            : null;

        const seen = new Set([String(auth.userID)]);
        const peerUserIds = [
            ...new Set(
                allPositions
                    .filter((p) => {
                        const isInUnit = String(p.unit_id) === String(unitId);
                        const isNotSelf = !seen.has(String(p.user_id));

                        return isInUnit && isNotSelf;
                    })
                    .map((p) => String(p.user_id)),
            ),
        ];
        const peers = peerUserIds
            .map((uid) => {
                const m = allMembers.find((mb) => String(mb.id) === uid);
                return m
                    ? {
                          ...m,
                          pos_name: _resolvePosName(uid, allPositions, unitId),
                          isSelf: false,
                      }
                    : null;
            })
            .filter(Boolean);

        return selfEntry ? [selfEntry, ...peers] : peers;
    }

    if (auth.isSeniorDraftsman) {
        // 1. Get the Senior Draftsman's unit (assuming pos_id 6 is Senior Draftsman)
        const unitId =
            auth.positions.find((p) => p.pos_id === 6)?.unit_id ?? null;

        // 2. Identify all Junior Draftsmen (pos_id 5) in the same unit
        const juniorIds = allPositions
            .filter(
                (p) =>
                    Number(p.pos_id) === 5 &&
                    String(p.unit_id) === String(unitId),
            )
            .map((p) => String(p.user_id));

        // 3. Map them to the member data
        return allMembers
            .filter((m) => juniorIds.includes(String(m.id)))
            .map((m) => ({
                ...m,
                pos_name: "Junior Draftsman",
                isSelf: false,
            }));
    }

    return allMembers
        .filter((m) => String(m.id) === String(auth.userID))
        .map((m) => ({ ...m, pos_name: "" }));
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const typeOptions = computed(() => {
    if (auth.isMember) return [{ id: 2, label: "Insertion Task" }];
    return [
        { id: 1, label: "Regular Task" },
        { id: 2, label: "Insertion Task" },
    ];
});

const showOutput = computed(() => auth.isMember && newTask.value.type === 2);
const isSelfInsertion = computed(
    () =>
        props.lockType && Number(newTask.value.type) === 2 && !newTask.value.id,
);

watch(
    isSelfInsertion,
    (selfInsertion) => {
        if (selfInsertion) {
            newTask.value.assignee = auth.userID;
        }
    },
    { immediate: true },
);

const memberLabel = (u) => {
    const name = [
        u.fname,
        u.middle_initial ? u.middle_initial + "." : "",
        u.lname,
    ]
        .filter(Boolean)
        .join(" ");
    return u.pos_name ? `${name} — ${u.pos_name}` : name;
};

const selectedAssigneeUnit = computed(() => {
    const assigneeId = newTask.value.assignee;
    if (!assigneeId) return null;

    // 1. Identify the Unit Head's active unit ID
    const activeUnitId = auth.positions.find(
        (p) => p.pos_id === POS_UNIT_HEAD,
    )?.unit_id;
    if (!activeUnitId) return null;

    // 2. Find the specific row where this assignee belongs to the Unit Head's unit
    const matchingPos = posStore.memberPos.find(
        (p) =>
            String(p.user_id) === String(assigneeId) &&
            String(p.unit_id) === String(activeUnitId),
    );

    if (!matchingPos) return null;

    // 3. Return the Unit Name from the Unit Head's own position records or a fallback
    return (
        auth.positions.find((ap) => String(ap.unit_id) === String(activeUnitId))
            ?.unit_name || `Unit ${activeUnitId}`
    );
});

// ── File upload ───────────────────────────────────────────────────────────────
function resetUpload() {
    uploadSuccess.value = false;
    uploadError.value = "";
    uploadedFileName.value = "";
    if (uploadMode.value === "file") outputUrl.value = "";
}

function switchMode(mode) {
    uploadMode.value = mode;
    resetUpload();
}

async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    uploadLoading.value = true;
    uploadSuccess.value = false;
    uploadError.value = "";
    uploadedFileName.value = file.name;

    try {
        const formData = new FormData();
        formData.append("file", file);
        // fullName from authStore e.g. "Juan D. Dela Cruz" → becomes the Drive folder name
        formData.append("userName", auth.fullName);

        const [res, data] = await Promise.all([
            fetch("/api/upload", { method: "POST", body: formData }),
            res.json(),
        ]);

        if (!res.ok || !data.success)
            throw new Error(data.error || "Upload failed");

        outputUrl.value = data.fileUrl; // auto-fill the output link
        uploadSuccess.value = true;
    } catch (err) {
        uploadError.value = err.message || "Upload failed. Please try again.";
        uploadedFileName.value = "";
    } finally {
        uploadLoading.value = false;
        // reset input so re-uploading the same file triggers change again
        if (fileInputRef.value) fileInputRef.value.value = "";
    }
}

// ── Submit ────────────────────────────────────────────────────────────────────
const submitForm = async () => {
    errorMsg.value = "";
    loading.value = true;
    try {
        if (!newTask.value.name.trim()) throw new Error("Title is required.");
        if (!newTask.value.description.trim())
            throw new Error("Description is required.");
        if (!newTask.value.type) throw new Error("Task type is required.");
        if (!newTask.value.endDate) throw new Error("Deadline is required.");

        const assigneeId =
            auth.isMember || isSelfInsertion.value
                ? auth.userID
                : newTask.value.assignee;

        await taskStore.addTasks({
            mainTask: {
                id: newTask.value.id,
                parentId: newTask.value.parentId,
                name: newTask.value.name,
                description: newTask.value.description,
                type: newTask.value.type,
                endDate: newTask.value.endDate,
                urgent: newTask.value.urgent,
                assignee: assigneeId || null,
                outputLink: showOutput.value ? outputUrl.value : "",
            },
        });
        // }

        emit("success");
    } catch (e) {
        console.error("[AddTask] submit error:", e);
        errorMsg.value = e.message || "Something went wrong. Please try again.";
    } finally {
        loading.value = false;
    }
};

const isComplete = computed(() => {
    if (!props.preFill || typeof props.preFill !== "object") return false;

    // Returns true if all values are NOT null
    return Object.values(props.preFill).every(
        (value) => value !== null && value !== undefined,
    );
});

const isLocked = computed(() => {
    // If no preFill, nothing is locked
    if (!props.preFill) return false;

    // Logic: Locked if NOT director AND NOT the assignee
    return !auth.isDirector && props.preFill.assignee !== auth.userID;
});
</script>

<template>
    <!-- ── Main AddTask card ──────────────────────────────────────────────────── -->
    <div
        class="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
        <!-- Header -->
        <div
            class="flex items-center justify-between px-7 py-5 border-b border-gray-100"
        >
            <h2 class="text-xl font-bold text-gray-900">
                <template v-if="lockType && Number(newTask.type) === 2"
                    >Add Insertion Task</template
                >
                <template v-else-if="auth.isDirector">Assign a Task</template>
                <template v-else-if="auth.isUnitHead">Assign to Unit</template>
                <template v-else>Submit Insertion Task</template>
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
            <!-- Pre-fill info banner -->
            <div
                v-if="preFill"
                class="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3"
            >
                <svg
                    class="w-4 h-4 text-green-700 mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p class="text-xs text-green-800">
                    Pre-filled from the Director's original sub-task — you can
                    edit any field before assigning.
                </p>
            </div>

            <!-- Title -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Title <span class="text-red-500">*</span>
                </label>
                <input
                    v-model="newTask.name"
                    :disabled="isLocked && preFill?.name"
                    type="text"
                    maxlength="100"
                    placeholder="Task title…"
                    class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-green-800 transition-colors"
                />
            </div>

            <!-- Description -->
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Description <span class="text-red-500">*</span>
                </label>
                <textarea
                    v-model="newTask.description"
                    :disabled="isLocked && preFill?.description"
                    rows="4"
                    maxlength="500"
                    placeholder="Describe the task…"
                    class="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-green-800 transition-colors"
                />
                <p class="text-xs text-gray-400 mt-0.5">
                    {{ newTask.description.length }}/500
                </p>
            </div>

            <!-- Type + Deadline -->
            <div class="flex gap-3">
                <div class="flex-1">
                    <label
                        class="block text-sm font-semibold text-gray-700 mb-1"
                    >
                        Type <span class="text-red-500">*</span>
                    </label>
                    <select
                        v-model="newTask.type"
                        :disabled="(isLocked && preFill?.type) || lockType"
                        class="hover:cursor-pointer w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-green-800 bg-white"
                    >
                        <option value="" disabled hidden>
                            Select task type
                        </option>
                        <option
                            v-for="t in typeOptions"
                            :key="t.id"
                            :value="t.id"
                        >
                            {{ t.label }}
                        </option>
                    </select>
                </div>
                <div class="flex-1">
                    <label
                        class="block text-sm font-semibold text-gray-700 mb-1"
                    >
                        Deadline <span class="text-red-500">*</span>
                    </label>
                    <input
                        v-model="newTask.endDate"
                        :disabled="isLocked && preFill?.endDate"
                        type="date"
                        class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-green-800 transition-colors hover:cursor-pointer"
                    />
                </div>
            </div>

            <!-- Assignee -->
            <div v-if="!auth.isMember && !isSelfInsertion">
                <label class="block text-sm font-semibold text-gray-700 mb-1">
                    Assign To <span class="text-red-500">*</span>
                </label>

                <div
                    v-if="memberStore.members.length === 0"
                    class="w-full border-2 border-gray-200 rounded-xl h-11 px-3 flex items-center text-sm text-gray-400 bg-gray-50 animate-pulse"
                >
                    Loading members…
                </div>

                <template v-else>
                    <select
                        v-model="newTask.assignee"
                        :disabled="isLocked && preFill?.assignee"
                        class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-green-800 bg-white hover:cursor-pointer"
                    >
                        <option :value="null" disabled hidden>
                            Select assignee...
                        </option>
                        <option
                            v-for="m in assignableMembers"
                            :key="m.id"
                            :value="m.id"
                        >
                            {{ memberLabel(m) }}{{ m.isSelf ? " (You)" : "" }}
                        </option>
                    </select>

                    <p
                        v-if="selectedAssigneeUnit"
                        class="text-xs text-gray-400 mt-1.5 flex items-center gap-1"
                    >
                        <svg
                            class="w-3 h-3"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                            />
                        </svg>
                        {{ selectedAssigneeUnit }}
                    </p>
                </template>
            </div>

            <div
                v-else-if="isSelfInsertion"
                class="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-900"
            >
                This insertion will be assigned to you.
            </div>

            <!-- ── Output / Upload (members + insertion task only) ────────────────── -->
            <div v-if="showOutput" class="space-y-2">
                <div class="flex items-center justify-between">
                    <label class="text-sm font-semibold text-gray-700">
                        Output
                        <span class="text-gray-400 font-normal"
                            >(optional)</span
                        >
                    </label>

                    <!-- Mode toggle -->
                    <div
                        class="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5"
                    >
                        <button
                            type="button"
                            @click="switchMode('file')"
                            :class="[
                                'hover:cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-all',
                                uploadMode === 'file'
                                    ? 'bg-white text-green-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700',
                            ]"
                        >
                            <!-- upload icon -->
                            <svg
                                class="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            Upload
                        </button>
                        <button
                            type="button"
                            @click="switchMode('link')"
                            :class="[
                                'flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-all',
                                uploadMode === 'link'
                                    ? 'bg-white text-green-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700',
                            ]"
                        >
                            <!-- link icon -->
                            <svg
                                class="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                            </svg>
                            Paste Link
                        </button>
                    </div>
                </div>

                <!-- FILE UPLOAD mode -->
                <template v-if="uploadMode === 'file'">
                    <!-- Drop zone / trigger -->
                    <label
                        :class="[
                            'flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed',
                            'cursor-pointer transition-colors px-4 py-5',
                            uploadLoading
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                : uploadSuccess
                                  ? 'border-green-400 bg-green-50'
                                  : uploadError
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-gray-300 hover:border-green-700 hover:bg-green-50',
                        ]"
                    >
                        <!-- Spinner while uploading -->
                        <template v-if="uploadLoading">
                            <svg
                                class="animate-spin w-6 h-6 text-green-800"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="rgba(0,0,0,0.1)"
                                    stroke-width="3"
                                />
                                <path
                                    d="M12 2a10 10 0 0 1 10 10"
                                    stroke="#166534"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                />
                            </svg>
                            <span class="text-xs text-gray-500"
                                >Uploading
                                <span class="font-medium text-gray-700">{{
                                    uploadedFileName
                                }}</span
                                >…</span
                            >
                        </template>

                        <!-- Success state -->
                        <template v-else-if="uploadSuccess">
                            <svg
                                class="w-6 h-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <p
                                class="text-xs text-green-800 font-medium text-center"
                            >
                                {{ uploadedFileName }}<br />
                                <span class="font-normal text-green-600"
                                    >Uploaded — link filled in below</span
                                >
                            </p>
                            <span class="text-xs text-gray-400 underline"
                                >Click to replace</span
                            >
                        </template>

                        <!-- Error state -->
                        <template v-else-if="uploadError">
                            <svg
                                class="w-6 h-6 text-red-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                                />
                            </svg>
                            <p
                                class="text-xs text-red-600 font-medium text-center"
                            >
                                {{ uploadError }}
                            </p>
                            <span class="text-xs text-gray-400 underline"
                                >Click to try again</span
                            >
                        </template>

                        <!-- Idle state -->
                        <template v-else>
                            <svg
                                class="w-6 h-6 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                            </svg>
                            <p class="text-xs text-gray-500 text-center">
                                <span class="font-semibold text-gray-700"
                                    >Click to choose a file</span
                                ><br />
                                Uploads to your Drive folder
                            </p>
                        </template>

                        <input
                            ref="fileInputRef"
                            type="file"
                            class="hidden"
                            :disabled="uploadLoading"
                            @change="uploadFile"
                        />
                    </label>

                    <!-- Auto-filled link preview (editable) -->
                    <div v-if="outputUrl" class="flex items-center gap-2">
                        <svg
                            class="w-3.5 h-3.5 text-green-700 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                        </svg>
                        <input
                            v-model="outputUrl"
                            type="url"
                            class="flex-1 border border-gray-200 rounded-lg h-8 px-2 text-xs focus:outline-none focus:border-green-700 text-gray-600 bg-gray-50 transition-colors"
                        />
                        <a
                            :href="outputUrl"
                            target="_blank"
                            class="text-xs text-green-800 font-semibold hover:underline whitespace-nowrap"
                        >
                            Preview ↗
                        </a>
                    </div>
                </template>

                <!-- LINK PASTE mode -->
                <template v-else>
                    <input
                        v-model="outputUrl"
                        type="url"
                        placeholder="https://drive.google.com/…"
                        class="w-full border-2 border-gray-300 rounded-xl h-11 px-3 text-sm focus:outline-none focus:border-green-800 transition-colors"
                    />
                </template>
            </div>
            <!-- ── end Output block ────────────────────────────────────────────────── -->
            <div class="flex justify-start gap-10">
                <!-- Urgent -->
                <div class="flex items-center gap-2">
                    <input
                        v-model="newTask.urgent"
                        type="checkbox"
                        id="urgent"
                        class="w-4 h-4 accent-red-700 hover:cursor-pointer"
                    />
                    <label
                        for="urgent"
                        class="text-sm font-semibold text-red-700 hover:cursor-pointer"
                        >Mark as Urgent</label
                    >
                </div>
            </div>

            <!-- Approval flow note -->
            <div
                v-if="!auth.isDirector"
                class="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
            >
                <svg
                    class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                </svg>
                <p class="text-xs text-amber-700">
                    <span v-if="auth.isUnitHead">
                        This task will be sent to the Director for final
                        approval.
                    </span>
                    <span v-else>
                        This insertion task requires approval from your Unit
                        Head and the Director.
                    </span>
                </p>
            </div>

            <!-- Error -->
            <p
                v-if="errorMsg"
                class="text-xs text-red-600 font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-1.5"
            >
                <svg
                    class="w-3.5 h-3.5 shrink-0"
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
                :disabled="
                    loading ||
                    uploadLoading ||
                    (isComplete && preFill?.assignee === auth.userID)
                "
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
                        ? "Saving…"
                        : uploadLoading
                          ? "Uploading…"
                          : "Submit"
                }}
            </button>
        </div>
    </div>
</template>
