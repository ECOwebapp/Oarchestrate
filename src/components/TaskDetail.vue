<script setup vapor>
import { uploadOutputFile } from "@/lib/uploadOutput";
import { useDesignStore } from "@/stores/design";
import { useMemberStore } from "@/stores/member";
import { usePosStore } from "@/stores/positions";
import { useSubtaskStore } from "@/stores/subtasks";
import { useTaskStore } from "@/stores/tasks";
import { useAuthStore } from "@/stores/useAuthStore";
import { storeToRefs } from "pinia";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

// MDI icon paths
const mdiLink =
    "M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z";
const mdiCloudUpload =
    "M11 20H6.5Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20H13V12.85L14.6 14.4L16 13L12 9L8 13L9.4 14.4L11 12.85Z";
const mdiFileDocument =
    "M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M15,18V16H6V18H15M18,14V12H6V14H18Z";
const mdiAlertCircle =
    "M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z";
const mdiAlert = "M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z";
const mdiCheck = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z";
const mdiAccount =
    "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z";
const mdiCommentOutline =
    "M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9M10,16V19.08L13.08,16H20V4H4V16H10Z";
const mdiPaperclip =
    "M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z";
const mdiClose =
    "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";
const mdiCheckCircle =
    "M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z";
const mdiClockOutline =
    "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z";
const mdiRefresh =
    "M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z";
const mdiPencil =
    "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z";
const mdiTrashCan =
    "M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z";

const props = defineProps(["task", "loading"]);
const emit = defineEmits(["close", "refresh", "assignSubtask"]);
const auth = useAuthStore();
const taskStore = useTaskStore();
const subtaskStore = useSubtaskStore();
const memberStore = useMemberStore();
const posStore = usePosStore();
const designStore = useDesignStore();
const { plenary } = storeToRefs(designStore);
const memberPos = storeToRefs(posStore)?.memberPos;

const outputUrl = ref(props.task?.outputLink || "");
const newOutputUrl = ref("");
const revisionComment = ref("");
const submitting = ref(false);
const submitError = ref("");
const acting = ref("");
const tab = ref("detail");
const revisions = ref([]);
const loadingRevs = ref(false);
const chatBottom = ref(null);

const openDropdownId = ref(null);

const uploadFile = ref(null);
const resubmitFile = ref(null);
const editFile = ref(null);
const uploadProgress = ref(0);
const dragOverSubmit = ref(false);
const dragOverResub = ref(false);
const dragOverEdit = ref(false);
const fileInputRef = ref(null);
const resubInputRef = ref(null);
const editInputRef = ref(null);

onMounted(async () => {
    await Promise.all([
        posStore.fetchMemberPos(),
        posStore.fetchPos(),
        designStore.getPlenaryMembers(),
        loadRevisions(),
    ]);
    document.addEventListener("click", handleOutsideClick);
});

const handleOutsideClick = (e) => {
    if (!e.target.closest("[data-dropdown]")) openDropdownId.value = null;
};

// A simple method is best for this use case
// ── Edit submission UI state ─────────────────────────────────────────────────
// true  = user clicked "Edit" and we show the replace-file picker
// false = normal "submitted" view
const editingSubmission = ref(false);
// true  = user clicked "Delete" and we show a confirm prompt
const confirmingDelete = ref(false);

const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};

const onDropSubmit = (e) => {
    dragOverSubmit.value = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) {
        uploadFile.value = f;
        submitError.value = "";
    }
};
const onDropResub = (e) => {
    dragOverResub.value = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) {
        resubmitFile.value = f;
        submitError.value = "";
    }
};
const onDropEdit = (e) => {
    dragOverEdit.value = false;
    const f = e.dataTransfer?.files?.[0];
    if (f) {
        editFile.value = f;
        submitError.value = "";
    }
};
const onFilePickSubmit = (e) => {
    const f = e.target?.files?.[0];
    if (f) {
        uploadFile.value = f;
        submitError.value = "";
    }
};
const onFilePickResub = (e) => {
    const f = e.target?.files?.[0];
    if (f) {
        resubmitFile.value = f;
        submitError.value = "";
    }
};
const onFilePickEdit = (e) => {
    const f = e.target?.files?.[0];
    if (f) {
        editFile.value = f;
        submitError.value = "";
    }
};

const loadRevisions = async () => {
    loadingRevs.value = true;
    revisions.value = (await taskStore.fetchRevisions(props.task?.id)) || [];
    loadingRevs.value = false;
    await nextTick();
    chatBottom.value?.scrollIntoView({ behavior: "smooth" });
};

const filteredRevisions = computed(() => {
    // If there's no data yet, return empty array immediately
    if (!revisions.value.length) return [];

    return revisions.value.map((rev) => {
        // 1. Look up the sender's role
        const membership = (memberPos.value || [])
            .filter(
                (m) =>
                    String(m.user_id).trim() === String(rev.from_user).trim(),
            )
            .map((m) => Number(m.pos_id));

        let displayRole = "Unit Member";
        if (membership.includes(1)) displayRole = "Director";
        else if (membership.includes(4)) displayRole = "Unit Head";

        return {
            ...rev,
            roleLabel: displayRole,
            // Add a flag so the UI knows if the CURRENT user sent it
            isMine: rev.from_user === auth.user?.id,
        };
    });
});

// In your component or Store
const avatarMap = computed(() => {
    return memberStore.members.reduce((acc, m) => {
        acc[m.id] = m.avatar_url;
        return acc;
    }, {});
});

// Then your function becomes instant:
const getAvatarUrl = (userId) => avatarMap.value[userId];

watch(
    () => props.task?.id,
    async () => {
        outputUrl.value = props.task?.outputLink || "";
        newOutputUrl.value = "";
        revisionComment.value = "";
        submitError.value = "";
        tab.value = "detail";
        openDropdownId.value = null;
        editingSubmission.value = false;
        confirmingDelete.value = false;
        editFile.value = null;
        await loadRevisions();
    },
);

watch(tab, async (val) => {
    if (val === "comments") {
        await nextTick();
        chatBottom.value?.scrollIntoView({ behavior: "smooth" });
    }
});

const unreadCount = computed(
    () =>
        filteredRevisions.value.filter(
            (r) => r.to_user === auth.user?.id && !r.is_read,
        ).length,
);
// ── Capabilities ─────────────────────────────────────────────────────────────
const canApproveAsUnitHead = computed(() => {
    if (!auth.isUnitHead) return false;
    if (props.task?.isOwnTask) return false;
    if (props.task?.unitHead) return false;
    if (props.task?.director) return false;
    if (!props.task?.outputLink) return false;
    if (props.task?.assigneeIsOffice) return false;
    return true;
});

// For regular tasks: Director can only approve AFTER unit head approves
// For design tasks: Depends on the design approval chain
const canApproveAsDirector = computed(() => {
    if (!auth.isDirector || props.task?.director || !props.task?.outputLink)
        return false;

    // Regular task: requires unit_head approval first
    if (!props.task?.design) {
        return props.task?.unitHead === true;
    }

    // Design task: director can approve only after unit_head approves
    return (
        props.task?.designApproval?.unit_head === true &&
        props.task?.designApproval?.director === false
    );
});

// Design-specific approval logic based on user position
// New workflow: Unit Head → Director (no senior draftsman/engineers approval)
// All involved (engineers, unit head, director) can see and comment
const canApproveAsDesignRole = computed(() => {
    if (props.task?.director) return false;
    if (!props.task?.outputLink) return false;
    if (!props.task?.design) return false;

    const designApp = props.task?.designApproval || {};
    const userPosIds = (auth.positions || []).map((p) => p.pos_id);

    // 1. Unit Head (pos_id = 4) - FIRST in approval chain
    if (userPosIds.includes(4)) {
        return !designApp.unit_head;
    }

    // 2. Director (pos_id = 1) - FINAL approval (only after unit head approves)
    if (userPosIds.includes(1)) {
        return designApp.unit_head === true && !designApp.director;
    }

    return false;
});

// All engineers, unit heads, and director can see and comment on design output
const canCommentOnDesign = computed(() => {
    if (!props.task?.outputLink) return false;
    if (!props.task?.design) return false;
    if (props.task?.director) return false;

    const userPosIds = (auth.positions || []).map((p) => p.pos_id);
    const isPlenaryUser = userPosIds.some((id) =>
        plenary.value.map((p) => p.pos_id).includes(id),
    );

    return isPlenaryUser || userPosIds.includes(4) || userPosIds.includes(1);
});

const canSubmitOutput = computed(
    () =>
        (auth.isMember || (auth.isUnitHead && props.task?.isOwnTask)) &&
        !props.task?.outputLink &&
        !props.task?.director,
);
const canResubmit = computed(
    () =>
        (auth.isMember || (auth.isUnitHead && props.task?.isOwnTask)) &&
        !!props.task?.revision &&
        !props.task?.director,
);

// ── can the submitter manage (edit/delete) their own submission?
// Conditions:
//   - current user is the task assignee
//   - output has been submitted (outputLink exists)
//   - director has NOT given final approval yet
const canManageSubmission = computed(() => {
    const isAssignee = String(props.task?.assignee) === String(auth.userID);
    const isUnitHeadOwnTask = auth.isUnitHead && props.task?.isOwnTask;
    return (
        (auth.isMember || isUnitHeadOwnTask || isAssignee) &&
        !!props.task?.outputLink &&
        !props.task?.director
    );
});

const canRequestRevision = computed(() => {
    const hasComment = revisionComment.value.trim().length > 0;
    if (!hasComment || !props.task?.outputLink || props.task?.director)
        return false;

    // Design task: only unit head and director can request revision (no engineers)
    if (props.task?.design) {
        return canApproveAsDesignRole.value; // Unit head or director
    }

    // Regular task: unit head and director can request revision
    return true;
});
const isOverdue = computed(
    () =>
        props.task?.to &&
        new Date(props.task.to) < new Date() &&
        !props.task?.director,
);

const statusLabel = computed(() => {
    if (props.task?.director)
        return {
            label: "Approved by Director",
            cls: "bg-green-100 text-green-800",
            icon: mdiCheckCircle,
        };

    // Design task specific status
    if (props.task?.design) {
        if (props.task?.designApproval?.unit_head) {
            return {
                label: "Pending Director Final Review",
                cls: "bg-blue-100 text-blue-800",
                icon: mdiClockOutline,
            };
        } else if (props.task?.outputLink) {
            return {
                label: "Pending Unit Head Review",
                cls: "bg-amber-100 text-amber-800",
                icon: mdiClockOutline,
            };
        }
    }

    if (props.task?.unitHead)
        return {
            label: "Pending Director Review",
            cls: "bg-amber-100 text-amber-800",
            icon: mdiClockOutline,
        };
    if (props.task?.revision)
        return {
            label: "Revision Requested",
            cls: "bg-orange-100 text-orange-700",
            icon: mdiRefresh,
        };
    if (props.task?.assigneeIsOffice && props.task?.outputLink)
        return {
            label: "Pending Director Review",
            cls: "bg-amber-100 text-amber-800",
            icon: mdiClockOutline,
        };
    return {
        label: "Pending Approval",
        cls: "bg-gray-100 text-gray-600",
        icon: mdiClockOutline,
    };
});

const badgeClass = (val) =>
    ({
        ongoing: "bg-green-800 text-white",
        approved: "bg-blue-600 text-white",
        urgent: "bg-red-800 text-white",
        regular: "bg-amber-500 text-white",
        insertion: "bg-red-800 text-white",
        revision: "bg-purple-600 text-white",
    })[val?.toLowerCase()] || "bg-gray-200 text-gray-700";

const fmt = (d) =>
    d
        ? new Date(d).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "—";

// ── Actions ───────────────────────────────────────────────────────────────────
const approve = async () => {
    acting.value = "approve";
    try {
        let role = 4; // default to unit head

        if (props.task?.design) {
            // Design task: only unit head (4) or director (1) can approve
            const userPosId = auth.positions?.map((p) => p.pos_id) || [];
            if (userPosId.includes(1))
                role = 1; // Director
            else if (userPosId.includes(4)) role = 4; // Unit Head
        } else {
            // Regular task: use director or unit_head
            role = auth.isDirector ? 1 : 4;
        }
        if (Object.hasOwn(props.task, "designApproval"))
            await subtaskStore.approveSubTask(
                props.task.id,
                role,
                props.task.parentId,
            );
        else
            await taskStore.approveTask(
                props.task.id,
                role,
                props.task.parentId,
            );
        emit("refresh");
        emit("close");
    } finally {
        acting.value = "";
    }
};

const requestRevision = async () => {
    if (!revisionComment.value.trim()) return;
    acting.value = "revise";
    try {
        let role = 4; // default to unit head

        if (props.task?.design) {
            // Design task: only unit head (4) or director (1) can request revision
            const userPosId = auth.positions?.map((p) => p.pos_id) || [];
            if (userPosId.includes(1))
                role = 1; // Director
            else if (userPosId.includes(4)) role = 4; // Unit Head
        } else {
            // Regular task: use director or unit_head
            role = auth.isDirector ? 1 : 4;
        }

        if (Object.hasOwn(props.task, "designApproval")) {
            await subtaskStore.requestRevision(
                props.task.id,
                revisionComment.value.trim(),
                role,
                props.task.parentId,
            );
        } else
            await taskStore.requestRevision(
                props.task.id,
                revisionComment.value.trim(),
                role,
                props.task.parentId,
            );
        revisionComment.value = "";
        await loadRevisions();
        emit("refresh");
        tab.value = "comments";
    } finally {
        acting.value = "";
    }
};

const submitOutput = async () => {
    if (!uploadFile.value) return;
    submitting.value = true;
    submitError.value = "";
    uploadProgress.value = 0;
    try {
        const result = await uploadOutputFile({
            file: uploadFile.value,
            onProgress: (p) => {
                uploadProgress.value = p;
            },
        });
        if (Object.hasOwn(props.task, "designApproval"))
            await subtaskStore.submitOutput(props.task.id, result.fileUrl);
        else await taskStore.submitOutput(props.task.id, result.fileUrl);
        emit("refresh");
        emit("close");
    } catch (err) {
        submitError.value = err.message || "Upload failed. Please try again.";
    } finally {
        submitting.value = false;
        uploadProgress.value = 0;
    }
};

const resubmit = async () => {
    if (!resubmitFile.value) return;
    acting.value = "resubmit";
    submitError.value = "";
    uploadProgress.value = 0;
    try {
        const result = await uploadOutputFile({
            file: resubmitFile.value,
            onProgress: (p) => {
                uploadProgress.value = p;
            },
        });
        if (Object.hasOwn(props.task, "designApproval"))
            await subtaskStore.resubmitTask(
                props.task.id,
                result.fileUrl,
                props.task.parentId,
            );
        else
            await taskStore.resubmitTask(
                props.task.id,
                result.fileUrl,
                props.task.parentId,
            );
        resubmitFile.value = null;
        uploadProgress.value = 0;
        await loadRevisions();
        emit("refresh");
        tab.value = "comments";
    } catch (err) {
        submitError.value = err.message || "Upload failed. Please try again.";
    } finally {
        acting.value = "";
        uploadProgress.value = 0;
    }
};

// ── NEW: edit submission (replace the file while still pending review) ────────
const saveEditedOutput = async () => {
    if (!editFile.value) return;
    acting.value = "editOutput";
    submitError.value = "";
    uploadProgress.value = 0;
    try {
        const result = await uploadOutputFile({
            file: editFile.value,
            onProgress: (p) => {
                uploadProgress.value = p;
            },
        });
        if (Object.hasOwn(props.task, "designApproval"))
            await subtaskStore.editOutput(props.task.id, result.fileUrl);
        else await taskStore.editOutput(props.task.id, result.fileUrl);
        editFile.value = null;
        editingSubmission.value = false;
        uploadProgress.value = 0;
        emit("refresh");
        // Stay open so the user can see the updated link
    } catch (err) {
        submitError.value = err.message || "Upload failed. Please try again.";
    } finally {
        acting.value = "";
        uploadProgress.value = 0;
    }
};

// ── NEW: delete submission (retract the file, reset back to "no output") ──────
const confirmDeleteOutput = async () => {
    acting.value = "deleteOutput";
    try {
        if (Object.hasOwn(props.task, "designApproval"))
            await subtaskStore.deleteOutput(props.task.id);
        else await taskStore.deleteOutput(props.task.id);
        confirmingDelete.value = false;
        emit("refresh");
        // Stay open; task now shows the upload UI again
    } catch (err) {
        submitError.value = err.message || "Failed to remove submission.";
    } finally {
        acting.value = "";
    }
};
onUnmounted(() => document.removeEventListener("click", handleOutsideClick));
</script>

<template>
    <div
        v-if="task"
        class="fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4"
        @click.self="emit('close')"
    >
        <div
            class="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden"
        >
            <!-- Close button -->
            <button
                class="absolute top-3.5 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors z-10"
                @click="emit('close')"
            >
                <svg viewBox="0 0 24 24" class="w-5 h-5" fill="currentColor">
                    <path :d="mdiClose" />
                </svg>
            </button>

            <!-- Title bar -->
            <div class="px-6 sm:px-8 pt-7 pb-4 flex-shrink-0">
                <div class="flex flex-wrap gap-2 mb-3">
                    <span
                        class="px-3 py-1 text-xs font-bold rounded-full"
                        :class="badgeClass(task.type)"
                    >
                        {{ task.type }}
                    </span>
                    <span
                        v-if="task.urgent"
                        class="px-3 py-1 text-xs font-bold rounded-full bg-red-800 text-white flex items-center gap-1"
                    >
                        <span
                            class="w-1.5 h-1.5 rounded-full bg-red-300 animate-pulse"
                        />
                        Urgent
                    </span>
                    <span
                        v-if="task.revision"
                        class="px-3 py-1 text-xs font-bold rounded-full bg-purple-600 text-white"
                    >
                        Revision
                    </span>
                    <span
                        class="px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1"
                        :class="statusLabel.cls"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            class="w-3 h-3 flex-shrink-0"
                            fill="currentColor"
                        >
                            <path :d="statusLabel.icon" />
                        </svg>
                        {{ statusLabel.label }}
                    </span>
                    <span
                        v-if="isOverdue"
                        class="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700"
                    >
                        ⚠ Overdue
                    </span>
                </div>
                <h2 class="text-xl font-bold text-gray-900 leading-snug pr-8">
                    {{ task.name }}
                </h2>
            </div>

            <!-- Tabs -->
            <div
                class="flex border-b border-gray-100 px-6 sm:px-8 flex-shrink-0 gap-1"
            >
                <button
                    v-for="t in ['detail', 'comments']"
                    :key="t"
                    @click="tab = t"
                    class="relative pb-3 px-1 mr-4 text-sm font-semibold capitalize transition-colors"
                    :class="
                        tab === t
                            ? 'text-green-900'
                            : 'text-gray-400 hover:text-gray-600 hover:cursor-pointer'
                    "
                >
                    {{ t === "comments" ? "Comments" : "Details" }}
                    <span
                        v-if="t === 'comments' && unreadCount"
                        class="ml-1.5 px-1.5 text-[10px] font-bold rounded-full bg-red-500 text-white align-top py-0.5"
                    >
                        {{ unreadCount }}
                    </span>
                    <span
                        v-if="tab === t"
                        class="absolute bottom-0 left-0 right-0 h-0.5 bg-green-900 rounded-full"
                    />
                </button>
            </div>

            <!-- BODY -->
            <div class="flex-1 min-h-0 flex flex-col overflow-hidden">
                <!-- DETAILS TAB -->
                <div
                    v-if="tab === 'detail'"
                    class="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-5"
                >
                    <div>
                        <p
                            class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                        >
                            Description
                        </p>
                        <div
                            class="border border-gray-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed bg-gray-50"
                        >
                            {{ task.description || "—" }}
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p
                                class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
                            >
                                Assigned by
                            </p>
                            <div
                                class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white"
                            >
                                <div
                                    class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-4 h-4 text-green-800"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiAccount" />
                                    </svg>
                                </div>
                                <span class="text-xs text-gray-700 truncate">{{
                                    task.assignerName || "—"
                                }}</span>
                            </div>
                        </div>
                        <div>
                            <p
                                class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
                            >
                                Assigned to
                            </p>
                            <div
                                class="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white"
                            >
                                <div
                                    class="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-4 h-4 text-green-800"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiAccount" />
                                    </svg>
                                </div>
                                <span class="text-xs text-gray-700 truncate">{{
                                    task.assigneeName || "—"
                                }}</span>
                            </div>
                        </div>
                        <div>
                            <p
                                class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
                            >
                                Date Given
                            </p>
                            <p class="text-sm text-gray-700 font-medium">
                                {{ fmt(task.from) }}
                            </p>
                        </div>
                        <div>
                            <p
                                class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
                            >
                                Deadline
                            </p>
                            <p
                                class="text-sm font-semibold"
                                :class="
                                    isOverdue ? 'text-red-600' : 'text-gray-700'
                                "
                            >
                                {{ fmt(task.to) }}
                            </p>
                        </div>
                    </div>

                    <!-- OUTPUT -->
                    <div>
                        <p
                            class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                        >
                            Output
                        </p>

                        <!-- ── SUBMITTED: normal view + manage controls ── -->
                        <template
                            v-if="
                                task.outputLink &&
                                !editingSubmission &&
                                !confirmingDelete
                            "
                        >
                            <div
                                class="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-green-50"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="w-5 h-5 text-green-700 flex-shrink-0"
                                    fill="currentColor"
                                >
                                    <path :d="mdiLink" />
                                </svg>
                                <a
                                    :href="task.outputLink"
                                    target="_blank"
                                    class="text-sm text-green-800 font-semibold hover:underline truncate flex-1"
                                >
                                    View submitted output ↗
                                </a>
                            </div>

                            <!-- Edit / Delete buttons — only shown when submission is still pending review -->
                            <div
                                v-if="canManageSubmission && !canResubmit"
                                class="flex gap-2 mt-2"
                            >
                                <button
                                    @click="
                                        editingSubmission = true;
                                        submitError = '';
                                    "
                                    class="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:border-green-700 hover:text-green-800 hover:bg-green-50 transition-colors hover:cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-3.5 h-3.5"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiPencil" />
                                    </svg>
                                    Edit submission
                                </button>
                                <button
                                    @click="
                                        confirmingDelete = true;
                                        submitError = '';
                                    "
                                    class="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors hover:cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-3.5 h-3.5"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiTrashCan" />
                                    </svg>
                                    Remove submission
                                </button>
                            </div>
                        </template>

                        <!-- ── EDIT SUBMISSION: replace file picker ── -->
                        <template v-else-if="editingSubmission">
                            <div class="space-y-2.5">
                                <!-- Current file reference -->
                                <div
                                    class="flex items-center gap-2 text-xs text-gray-500 mb-1"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-3.5 h-3.5 text-green-700 flex-shrink-0"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiLink" />
                                    </svg>
                                    <span class="truncate"
                                        >Current:
                                        <a
                                            :href="task.outputLink"
                                            target="_blank"
                                            class="text-green-700 hover:underline font-medium"
                                        >
                                            view file ↗
                                        </a>
                                    </span>
                                </div>

                                <input
                                    ref="editInputRef"
                                    type="file"
                                    class="hidden"
                                    @change="onFilePickEdit"
                                />
                                <div
                                    v-if="!editFile"
                                    @dragover.prevent="dragOverEdit = true"
                                    @dragleave.prevent="dragOverEdit = false"
                                    @drop.prevent="onDropEdit"
                                    @click="editInputRef?.click()"
                                    class="border-2 border-dashed rounded-2xl px-5 py-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none"
                                    :class="
                                        dragOverEdit
                                            ? 'border-green-700 bg-green-50'
                                            : 'border-gray-300 bg-gray-50 hover:border-green-700 hover:bg-green-50'
                                    "
                                >
                                    <div
                                        class="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                                        :class="
                                            dragOverEdit
                                                ? 'bg-green-100'
                                                : 'bg-white border border-gray-200'
                                        "
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            class="w-5 h-5"
                                            :class="
                                                dragOverEdit
                                                    ? 'text-green-700'
                                                    : 'text-gray-400'
                                            "
                                            fill="currentColor"
                                        >
                                            <path :d="mdiCloudUpload" />
                                        </svg>
                                    </div>
                                    <p
                                        class="text-sm font-semibold text-gray-700"
                                    >
                                        {{
                                            dragOverEdit
                                                ? "Drop to replace"
                                                : "Drop replacement file or click to browse"
                                        }}
                                    </p>
                                    <p class="text-xs text-gray-400">
                                        Replaces the current submission
                                    </p>
                                </div>

                                <div
                                    v-else
                                    class="flex items-center gap-3 border-2 border-green-200 bg-green-50 rounded-2xl px-4 py-3"
                                >
                                    <div
                                        class="w-9 h-9 rounded-xl bg-white border border-green-200 flex items-center justify-center flex-shrink-0"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            class="w-4 h-4 text-green-700"
                                            fill="currentColor"
                                        >
                                            <path :d="mdiFileDocument" />
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p
                                            class="text-sm font-semibold text-gray-800 truncate"
                                        >
                                            {{ editFile.name }}
                                        </p>
                                        <p class="text-xs text-gray-400">
                                            {{ formatBytes(editFile.size) }}
                                        </p>
                                    </div>
                                    <button
                                        @click="
                                            editFile = null;
                                            editInputRef &&
                                                (editInputRef.value = '');
                                        "
                                        class="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            class="w-5 h-5"
                                            fill="currentColor"
                                        >
                                            <path :d="mdiClose" />
                                        </svg>
                                    </button>
                                </div>

                                <!-- Upload progress -->
                                <div
                                    v-if="acting === 'editOutput'"
                                    class="space-y-1"
                                >
                                    <div
                                        class="h-2 bg-gray-100 rounded-full overflow-hidden"
                                    >
                                        <div
                                            class="h-full bg-green-700 rounded-full transition-all duration-300"
                                            :style="{
                                                width: uploadProgress + '%',
                                            }"
                                        />
                                    </div>
                                    <p class="text-xs text-gray-500 text-right">
                                        {{
                                            uploadProgress < 100
                                                ? `Uploading… ${uploadProgress}%`
                                                : "Saving…"
                                        }}
                                    </p>
                                </div>

                                <p
                                    v-if="submitError"
                                    class="text-xs text-red-600 font-medium flex items-center gap-1.5"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-3.5 h-3.5 flex-shrink-0"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiAlertCircle" />
                                    </svg>
                                    {{ submitError }}
                                </p>

                                <div class="flex gap-2">
                                    <button
                                        @click="
                                            editingSubmission = false;
                                            editFile = null;
                                            submitError = '';
                                        "
                                        :disabled="acting === 'editOutput'"
                                        class="flex-1 h-10 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:border-gray-400 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 transition-colors active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        @click="saveEditedOutput"
                                        :disabled="
                                            acting === 'editOutput' || !editFile
                                        "
                                        class="flex-1 h-10 rounded-xl bg-green-950 text-white text-sm font-bold hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2 hover:cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        <svg
                                            v-if="acting === 'editOutput'"
                                            class="animate-spin w-3.5 h-3.5"
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
                                            acting === "editOutput"
                                                ? uploadProgress < 100
                                                    ? `Uploading ${uploadProgress}%…`
                                                    : "Saving…"
                                                : "Save new file"
                                        }}
                                    </button>
                                </div>
                            </div>
                        </template>

                        <!-- ── DELETE CONFIRMATION ── -->
                        <template v-else-if="confirmingDelete">
                            <div
                                class="border-2 border-red-200 bg-red-50 rounded-xl px-4 py-4 space-y-3"
                            >
                                <div class="flex items-start gap-3">
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiAlert" />
                                    </svg>
                                    <div>
                                        <p
                                            class="text-sm font-bold text-red-700"
                                        >
                                            Remove this submission?
                                        </p>
                                        <p
                                            class="text-xs text-red-600 mt-0.5 leading-relaxed"
                                        >
                                            The submitted file will be removed
                                            and the task will return to
                                            "awaiting submission" state. The
                                            reviewer will be notified.
                                        </p>
                                    </div>
                                </div>
                                <p
                                    v-if="submitError"
                                    class="text-xs text-red-600 font-medium flex items-center gap-1.5"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-3.5 h-3.5 flex-shrink-0"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiAlertCircle" />
                                    </svg>
                                    {{ submitError }}
                                </p>
                                <div class="flex gap-2">
                                    <button
                                        @click="
                                            confirmingDelete = false;
                                            submitError = '';
                                        "
                                        :disabled="acting === 'deleteOutput'"
                                        class="flex-1 h-9 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:border-gray-400 disabled:opacity-40 transition-colors active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        @click="confirmDeleteOutput"
                                        :disabled="acting === 'deleteOutput'"
                                        class="flex-1 h-9 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            v-if="acting === 'deleteOutput'"
                                            class="animate-spin w-3.5 h-3.5"
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
                                            acting === "deleteOutput"
                                                ? "Removing…"
                                                : "Yes, remove it"
                                        }}
                                    </button>
                                </div>
                            </div>
                        </template>

                        <!-- ── SUBMIT OUTPUT (no file yet) ── -->
                        <div v-else-if="canSubmitOutput" class="space-y-2.5">
                            <input
                                ref="fileInputRef"
                                type="file"
                                class="hidden"
                                @change="onFilePickSubmit"
                            />
                            <div
                                v-if="!uploadFile"
                                @dragover.prevent="dragOverSubmit = true"
                                @dragleave.prevent="dragOverSubmit = false"
                                @drop.prevent="onDropSubmit"
                                @click="fileInputRef?.click()"
                                class="border-2 border-dashed rounded-2xl px-5 py-7 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none"
                                :class="
                                    dragOverSubmit
                                        ? 'border-green-700 bg-green-50'
                                        : submitError
                                          ? 'border-red-300 bg-red-50'
                                          : 'border-gray-300 bg-gray-50 hover:border-green-700 hover:bg-green-50'
                                "
                            >
                                <div
                                    class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                                    :class="
                                        dragOverSubmit
                                            ? 'bg-green-100'
                                            : 'bg-white border border-gray-200'
                                    "
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-5 h-5"
                                        :class="
                                            dragOverSubmit
                                                ? 'text-green-700'
                                                : 'text-gray-400'
                                        "
                                        fill="currentColor"
                                    >
                                        <path :d="mdiCloudUpload" />
                                    </svg>
                                </div>
                                <p class="text-sm font-semibold text-gray-700">
                                    {{
                                        dragOverSubmit
                                            ? "Drop to attach"
                                            : "Drop file here or click to browse"
                                    }}
                                </p>
                                <p class="text-xs text-gray-400">
                                    Any file type · stored securely
                                </p>
                            </div>
                            <div
                                v-else
                                class="flex items-center gap-3 border-2 border-green-200 bg-green-50 rounded-2xl px-4 py-3"
                            >
                                <div
                                    class="w-9 h-9 rounded-xl bg-white border border-green-200 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-4 h-4 text-green-700"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiFileDocument" />
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="text-sm font-semibold text-gray-800 truncate"
                                    >
                                        {{ uploadFile.name }}
                                    </p>
                                    <p class="text-xs text-gray-400">
                                        {{ formatBytes(uploadFile.size) }}
                                    </p>
                                </div>
                                <button
                                    @click="
                                        uploadFile = null;
                                        fileInputRef &&
                                            (fileInputRef.value = '');
                                    "
                                    class="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-5 h-5"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiClose" />
                                    </svg>
                                </button>
                            </div>
                            <div v-if="submitting" class="space-y-1">
                                <div
                                    class="h-2 bg-gray-100 rounded-full overflow-hidden"
                                >
                                    <div
                                        class="h-full bg-green-700 rounded-full transition-all duration-300"
                                        :style="{ width: uploadProgress + '%' }"
                                    />
                                </div>
                                <p class="text-xs text-gray-500 text-right">
                                    {{
                                        uploadProgress < 100
                                            ? `Uploading… ${uploadProgress}%`
                                            : "Saving…"
                                    }}
                                </p>
                            </div>
                            <p
                                v-if="submitError"
                                class="text-xs text-red-600 font-medium flex items-center gap-1.5"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="w-3.5 h-3.5 flex-shrink-0"
                                    fill="currentColor"
                                >
                                    <path :d="mdiAlertCircle" />
                                </svg>
                                {{ submitError }}
                            </p>
                            <button
                                @click="submitOutput"
                                :disabled="submitting || !uploadFile"
                                class="w-full h-11 rounded-xl bg-green-950 text-white text-sm font-bold hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2 hover:cursor-pointer disabled:cursor-not-allowed"
                            >
                                <svg
                                    v-if="submitting"
                                    class="animate-spin w-3.5 h-3.5"
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
                                    submitting
                                        ? uploadProgress < 100
                                            ? `Uploading ${uploadProgress}%…`
                                            : "Saving…"
                                        : "Upload & Submit"
                                }}
                            </button>
                        </div>

                        <!-- ── RESUBMIT (revision requested) ── -->
                        <div v-else-if="canResubmit" class="space-y-2.5">
                            <input
                                ref="resubInputRef"
                                type="file"
                                class="hidden"
                                @change="onFilePickResub"
                            />
                            <div
                                v-if="task.revisionComment"
                                class="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                >
                                    <path :d="mdiAlert" />
                                </svg>
                                <div class="min-w-0">
                                    <p
                                        class="text-xs font-bold text-orange-700 mb-0.5"
                                    >
                                        What needs to be revised:
                                    </p>
                                    <p
                                        class="text-xs text-orange-800 leading-relaxed"
                                    >
                                        {{ task.revisionComment }}
                                    </p>
                                </div>
                            </div>
                            <div
                                v-if="!resubmitFile"
                                @dragover.prevent="dragOverResub = true"
                                @dragleave.prevent="dragOverResub = false"
                                @drop.prevent="onDropResub"
                                @click="resubInputRef?.click()"
                                class="border-2 border-dashed rounded-2xl px-5 py-7 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all select-none"
                                :class="
                                    dragOverResub
                                        ? 'border-orange-500 bg-orange-50'
                                        : 'border-orange-200 bg-orange-50/50 hover:border-orange-400 hover:bg-orange-50'
                                "
                            >
                                <div
                                    class="w-10 h-10 rounded-xl bg-white border border-orange-200 flex items-center justify-center"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-5 h-5 text-orange-400"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiCloudUpload" />
                                    </svg>
                                </div>
                                <p
                                    class="text-sm font-semibold text-orange-700"
                                >
                                    {{
                                        dragOverResub
                                            ? "Drop to attach"
                                            : "Drop revised file here or click to browse"
                                    }}
                                </p>
                                <p class="text-xs text-orange-400">
                                    Replaces your previous submission
                                </p>
                            </div>
                            <div
                                v-else
                                class="flex items-center gap-3 border-2 border-orange-200 bg-orange-50 rounded-2xl px-4 py-3"
                            >
                                <div
                                    class="w-9 h-9 rounded-xl bg-white border border-orange-200 flex items-center justify-center flex-shrink-0"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-4 h-4 text-orange-600"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiFileDocument" />
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="text-sm font-semibold text-gray-800 truncate"
                                    >
                                        {{ resubmitFile.name }}
                                    </p>
                                    <p class="text-xs text-gray-400">
                                        {{ formatBytes(resubmitFile.size) }}
                                    </p>
                                </div>
                                <button
                                    @click="
                                        resubmitFile = null;
                                        resubInputRef &&
                                            (resubInputRef.value = '');
                                    "
                                    class="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        class="w-5 h-5"
                                        fill="currentColor"
                                    >
                                        <path :d="mdiClose" />
                                    </svg>
                                </button>
                            </div>
                            <div v-if="acting === 'resubmit'" class="space-y-1">
                                <div
                                    class="h-2 bg-orange-100 rounded-full overflow-hidden"
                                >
                                    <div
                                        class="h-full bg-orange-500 rounded-full transition-all duration-300"
                                        :style="{ width: uploadProgress + '%' }"
                                    />
                                </div>
                                <p class="text-xs text-orange-500 text-right">
                                    {{
                                        uploadProgress < 100
                                            ? `Uploading… ${uploadProgress}%`
                                            : "Saving…"
                                    }}
                                </p>
                            </div>
                            <p
                                v-if="submitError"
                                class="text-xs text-red-600 font-medium flex items-center gap-1.5"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="w-3.5 h-3.5 flex-shrink-0"
                                    fill="currentColor"
                                >
                                    <path :d="mdiAlertCircle" />
                                </svg>
                                {{ submitError }}
                            </p>
                            <button
                                @click="resubmit"
                                :disabled="
                                    acting === 'resubmit' || !resubmitFile
                                "
                                class="w-full h-11 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-500 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <svg
                                    v-if="acting === 'resubmit'"
                                    class="animate-spin w-3.5 h-3.5"
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
                                    acting === "resubmit"
                                        ? uploadProgress < 100
                                            ? `Uploading ${uploadProgress}%…`
                                            : "Saving…"
                                        : "Upload & Resubmit"
                                }}
                            </button>
                        </div>

                        <!-- ── FALLBACK ── -->
                        <div
                            v-else
                            class="border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-400 text-center"
                        >
                            No output submitted yet
                        </div>
                    </div>

                    <!-- REVISION NOTES -->
                    <div
                        v-if="
                            (props.task?.design && canApproveAsDesignRole) ||
                            (!props.task?.design &&
                                (canApproveAsUnitHead || canApproveAsDirector))
                        "
                    >
                        <p
                            class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1"
                        >
                            Approval Comments
                            <span
                                class="ml-1.5 text-gray-400 font-normal normal-case"
                                :class="
                                    revisionComment.trim()
                                        ? 'text-green-700'
                                        : ''
                                "
                            >
                                {{
                                    revisionComment.trim()
                                        ? "— ready to send"
                                        : "— required for revision or approval"
                                }}
                            </span>
                        </p>
                        <textarea
                            v-model="revisionComment"
                            rows="3"
                            maxlength="500"
                            :placeholder="
                                props.task?.design && canApproveAsDesignRole
                                    ? 'Add your approval feedback or revision notes…'
                                    : 'Describe what needs to be revised before you can approve…'
                            "
                            class="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-amber-400 transition-colors leading-relaxed"
                            :class="
                                revisionComment.trim()
                                    ? 'border-amber-300 bg-amber-50'
                                    : ''
                            "
                        />
                        <p class="text-right text-[10px] text-gray-400 mt-1">
                            {{ revisionComment.length }}/500
                        </p>
                    </div>
                </div>

                <!-- COMMENTS TAB -->
                <div v-else class="flex-1 flex flex-col min-h-0">
                    <div
                        class="flex-1 overflow-y-auto px-6 sm:px-8 py-5 space-y-4"
                    >
                        <div
                            v-if="loadingRevs"
                            class="flex justify-center py-12"
                        >
                            <svg
                                class="animate-spin w-5 h-5 text-green-700"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="#d1fae5"
                                    stroke-width="3"
                                />
                                <path
                                    d="M12 2a10 10 0 0 1 10 10"
                                    stroke="#15803d"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </div>
                        <div
                            v-else-if="filteredRevisions.length < 1"
                            class="flex flex-col items-center justify-center py-14 text-center text-gray-400"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                class="w-12 h-12 mb-3 opacity-20"
                                fill="currentColor"
                            >
                                <path :d="mdiCommentOutline" />
                            </svg>
                            <p class="text-sm font-semibold">No comments yet</p>
                            <p
                                class="text-xs mt-1 max-w-[200px] leading-relaxed"
                            >
                                Revision notes and approval messages will appear
                                here
                            </p>
                        </div>
                        <template v-else>
                            <div
                                v-for="rev in filteredRevisions"
                                :key="rev.id"
                                class="flex gap-3"
                                :class="
                                    rev.from_user === auth.user?.id
                                        ? 'flex-row-reverse'
                                        : ''
                                "
                            >
                                <div
                                    class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white self-end mb-1 overflow-hidden"
                                    :class="
                                        rev.roleLabel.toLowerCase() ===
                                        'director'
                                            ? 'bg-green-900'
                                            : 'bg-amber-600'
                                    "
                                >
                                    <img
                                        v-if="getAvatarUrl(rev.from_user)"
                                        :src="getAvatarUrl(rev.from_user)"
                                        class="w-full h-full object-cover"
                                    />

                                    <span v-else>
                                        {{
                                            (rev.fromName ||
                                                "?")[0].toUpperCase()
                                        }}
                                    </span>
                                </div>
                                <div
                                    class="max-w-[72%] min-w-0 space-y-1"
                                    :class="
                                        rev.from_user === auth.user?.id
                                            ? 'items-end flex flex-col'
                                            : ''
                                    "
                                >
                                    <div
                                        class="flex items-center gap-2 flex-wrap"
                                        :class="
                                            rev.from_user === auth.user?.id
                                                ? 'flex-row-reverse'
                                                : ''
                                        "
                                    >
                                        <span
                                            class="text-xs font-bold text-gray-700 truncate"
                                            >{{ rev.fromName }}</span
                                        >
                                        <span class="text-[10px] text-gray-400">
                                            {{
                                                new Date(
                                                    rev.created_at,
                                                ).toLocaleDateString("en-PH", {
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                            }}
                                        </span>
                                        <span
                                            class="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                            :class="
                                                rev.roleLabel?.toLowerCase() ===
                                                'director'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-amber-100 text-amber-700'
                                            "
                                        >
                                            {{ rev.roleLabel }}
                                        </span>
                                    </div>
                                    <div
                                        class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words"
                                        :class="
                                            rev.from_user === auth.user?.id
                                                ? 'bg-green-900 text-white rounded-tr-sm'
                                                : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                                        "
                                    >
                                        {{ rev.comment }}
                                    </div>
                                </div>
                            </div>
                            <div ref="chatBottom" />
                        </template>
                    </div>

                    <!-- Resubmit bar -->
                    <div
                        v-if="canResubmit"
                        class="flex-shrink-0 px-6 sm:px-8 py-3 border-t border-gray-100 bg-orange-50 space-y-2"
                    >
                        <p
                            class="text-xs font-bold text-orange-700 flex items-center gap-1.5"
                        >
                            <span
                                class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"
                            />
                            Revision requested — upload your revised file:
                        </p>
                        <div class="flex items-center gap-2">
                            <input
                                ref="resubInputRef"
                                type="file"
                                class="hidden"
                                @change="onFilePickResub"
                            />
                            <button
                                @click="resubInputRef?.click()"
                                class="hover:cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 h-9 px-3 rounded-xl border-2 border-orange-200 bg-white text-orange-700 text-xs font-bold hover:border-orange-400 transition-colors flex-shrink-0"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="w-3.5 h-3.5"
                                    fill="currentColor"
                                >
                                    <path :d="mdiPaperclip" />
                                </svg>
                                Choose file
                            </button>
                            <span class="flex-1 text-xs text-gray-500 truncate">
                                {{
                                    resubmitFile
                                        ? resubmitFile.name
                                        : "No file chosen"
                                }}
                            </span>
                            <button
                                v-if="resubmitFile"
                                @click="resubmitFile = null"
                                class="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    class="w-5 h-5"
                                    fill="currentColor"
                                >
                                    <path :d="mdiClose" />
                                </svg>
                            </button>
                        </div>
                        <div
                            v-if="acting === 'resubmit'"
                            class="h-1.5 bg-orange-100 rounded-full overflow-hidden"
                        >
                            <div
                                class="h-full bg-orange-500 rounded-full transition-all duration-300"
                                :style="{ width: uploadProgress + '%' }"
                            />
                        </div>
                        <button
                            @click="resubmit"
                            :disabled="acting === 'resubmit' || !resubmitFile"
                            class="w-full h-9 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-1.5 hover:cursor-pointer disabled:cursor-not-allowed"
                        >
                            <svg
                                v-if="acting === 'resubmit'"
                                class="animate-spin w-3 h-3"
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
                                acting === "resubmit"
                                    ? uploadProgress < 100
                                        ? `Uploading ${uploadProgress}%…`
                                        : "Saving…"
                                    : "Upload & Resubmit"
                            }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- FOOTER -->
            <div
                class="flex gap-3 px-6 sm:px-8 py-4 border-t border-gray-100 flex-shrink-0 bg-white"
            >
                <!-- Design Task Approvals - New simplified workflow -->
                <template v-if="props.task?.design && canApproveAsDesignRole">
                    <button
                        @click="requestRevision"
                        :disabled="acting !== '' || !canRequestRevision"
                        :title="
                            !revisionComment.trim()
                                ? 'Write revision notes above first'
                                : ''
                        "
                        class="flex-1 h-11 rounded-xl border-2 border-amber-400 text-amber-600 font-bold text-sm hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:cursor-pointer"
                    >
                        {{
                            acting === "revise"
                                ? "Sending…"
                                : "Request Revision"
                        }}
                    </button>
                    <button
                        @click="approve"
                        :disabled="acting !== ''"
                        class="flex-1 h-11 rounded-xl bg-green-950 text-white font-bold text-sm hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2 hover:cursor-pointer"
                    >
                        <svg
                            v-if="acting === 'approve'"
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
                            acting === "approve"
                                ? "Approving…"
                                : props.task?.designApproval?.unit_head
                                  ? "Final Approve"
                                  : "Approve Design"
                        }}
                    </button>
                </template>
                <!-- Regular Task - Unit Head Approval -->
                <template
                    v-else-if="!props.task?.design && canApproveAsUnitHead"
                >
                    <button
                        @click="requestRevision"
                        :disabled="acting !== '' || !canRequestRevision"
                        :title="
                            !revisionComment.trim()
                                ? 'Write revision notes above first'
                                : ''
                        "
                        class="flex-1 h-11 rounded-xl border-2 border-amber-400 text-amber-600 font-bold text-sm hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:cursor-pointer"
                    >
                        {{
                            acting === "revise"
                                ? "Sending…"
                                : "Request Revision"
                        }}
                    </button>
                    <button
                        @click="approve"
                        :disabled="acting !== ''"
                        class="flex-1 h-11 rounded-xl bg-green-950 text-white font-bold text-sm hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2 hover:cursor-pointer"
                    >
                        <svg
                            v-if="acting === 'approve'"
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
                            acting === "approve"
                                ? "Approving…"
                                : "Approve & Send to Director"
                        }}
                    </button>
                </template>
                <!-- Regular Task - Director Approval (only after unit head approves) -->
                <template
                    v-else-if="!props.task?.design && canApproveAsDirector"
                >
                    <button
                        @click="requestRevision"
                        :disabled="acting !== '' || !canRequestRevision"
                        :title="
                            !revisionComment.trim()
                                ? 'Write revision notes above first'
                                : ''
                        "
                        class="flex-1 h-11 rounded-xl border-2 border-amber-400 text-amber-600 font-bold text-sm hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:cursor-pointer"
                    >
                        {{
                            acting === "revise"
                                ? "Sending…"
                                : "Send for Revision"
                        }}
                    </button>
                    <button
                        @click="approve"
                        :disabled="acting !== ''"
                        class="flex-1 h-11 rounded-xl bg-green-950 text-white font-bold text-sm hover:bg-green-800 disabled:opacity-40 transition-all active:scale-95 flex items-center justify-center gap-2 hover:cursor-pointer"
                    >
                        <svg
                            v-if="acting === 'approve'"
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
                            acting === "approve"
                                ? "Approving…"
                                : "Final Approve"
                        }}
                    </button>
                </template>
                <!-- Fully Approved State -->
                <template v-else-if="task.director">
                    <div
                        class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-green-50 border border-green-200"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            class="w-4 h-4 text-green-700"
                            fill="currentColor"
                        >
                            <path :d="mdiCheck" />
                        </svg>
                        <span class="text-sm font-bold text-green-700"
                            >Fully Approved</span
                        >
                    </div>
                </template>
                <template v-else>
                    <button
                        @click="emit('close')"
                        :disabled="loading"
                        class="flex-1 h-11 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:border-green-800 hover:text-green-800 transition-colors active:scale-95 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Close
                    </button>
                </template>
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
