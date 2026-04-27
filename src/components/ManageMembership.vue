<script setup>
import { storeToRefs } from "pinia";
import { ref, computed, watch, onMounted } from "vue";
import { useMemberStore } from "@/stores/member";
import { useNotifStore } from "@/stores/useNotifStore";
import { usePosStore } from "@/stores/positions";
import { useUnitStore } from "@/stores/unit";

// 1. Use storeToRefs to keep the properties reactive
const memberStore = useMemberStore();
const notifStore = useNotifStore();
const posStore = usePosStore();
const unitStore = useUnitStore();
const { members } = storeToRefs(memberStore);
const { roles, memberPos } = storeToRefs(posStore);
const { unit } = storeToRefs(unitStore);
const loading = ref({
    update: false,
    delete: false,
});

onMounted(async () => {
    await Promise.all([posStore.fetchRoles(), unitStore.fetchUnit()]);
});

const pendingMembers = computed(() => {
    // 1. Create the list of expected notification IDs (e.g., ["reg-uuid1", "reg-uuid2"])
    const validRegIds = members.value.map((m) => `reg-${m.id}`);

    // 2. Filter notifications to find only those in our list
    return notifStore.notifs.filter((n) => validRegIds.includes(n.id));
});

const normalMembers = computed(() => {
    return members.value.filter((m) => m.status_id === 2);
});

const isActing = (n) => n.status === "approving" || n.status === "denying";

const changePosMembers = ref({
    user_id: null,
    pos_id: null,
    unit_id: null,
});

const deleteMember = ref({ user_id: null });

watch(
    () => changePosMembers.value.user_id,
    (userId) => {
        changePosMembers.value.pos_id = changePosMembers.value.unit_id = null;

        if (!userId) return;

        const isExecutive = memberPos.value.find(
            (p) =>
                String(p.user_id).trim() === String(userId).trim() &&
                [1, 4].includes(Number(p.pos_id)),
        );

        if (isExecutive) {
            changePosMembers.value.pos_id = isExecutive?.pos_id;
            changePosMembers.value.unit_id = isExecutive?.unit_id;
        }
    },
);

const availableUnit = computed(() => {
    const selectedUserId = changePosMembers.value.user_id;
    const selectedPosId = changePosMembers.value.pos_id;

    // 1. If no ID is selected, return all unit
    if (!selectedUserId && selectedPosId) return unit.value || [];

    // 2. Find the user, forcing both IDs to String and trimming whitespace
    const currentMember = memberPos.value.find((p) => {
        const isTargetUser =
            String(p.user_id).trim() === String(selectedUserId).trim();
        const isUnitHead = [1].includes(Number(p.pos_id));

        return isTargetUser && isUnitHead;
    });

    // 3. If member not found in the position list, return all position
    if (!currentMember) return unit.value;

    // 4. Filter out the current position ID (also forcing string comparison)
    return unit.value.filter((u) => {
        return String(u.id).trim() !== String(currentMember.unit_id).trim();
    });
});

const selectedMemberUnitLabel = computed(() => {
    const selectedUserId = changePosMembers.value.user_id;
    if (!selectedUserId) return "";

    const selectedRows = memberPos.value.filter(
        (p) => String(p.user_id).trim() === String(selectedUserId).trim(),
    );

    if (!selectedRows.length) return "No unit assigned";

    const uniqueUnitIds = [
        ...new Set(
            selectedRows
                .map((r) => r.unit_id)
                .filter((unitId) => unitId != null)
                .map((unitId) => String(unitId)),
        ),
    ];

    if (!uniqueUnitIds.length) return "No unit assigned";

    const unitLabels = uniqueUnitIds.map((unitId) => {
        const unitMatch = unit.value.find((u) => {
            const rowUnitId = u.id ?? u.unit_id;
            return String(rowUnitId) === unitId;
        });

        return unitMatch?.unit_name || unitMatch?.name || `Unit ${unitId}`;
    });

    return unitLabels.join(", ");
});

// Change Member position to Director/Unit Head/Unit Member
const submitChangeRole = async () => {
    try {
        loading.value.update = true;

        const response = await posStore.changeMemberRoles({
            member: { ...changePosMembers.value },
        });
        if (response === 200) console.log(response);
    } catch (e) {
        console.log("Error submission: ", e);
    } finally {
        changePosMembers.value = {
            user_id: null,
            pos_id: null,
            unit_id: null,
        };
        loading.value.update = false;
    }
};

// Remove Members
const removeMember = async () => {
    try {
        loading.value.delete = true;
        const response = await memberStore.removeMember({
            member: { ...deleteMember.value },
        });
        if (response === 200) console.log(response);
    } catch (e) {
        console.log("Error removal: ", e);
    } finally {
        deleteMember.value = { user_id: null };
        loading.value.delete = false;
    }
};
</script>

<template>
    <div
        class="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 lg:gap-8"
    >
        <div
            class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
        >
            <div
                class="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 sm:mb-5"
            >
                <h2 class="text-base font-bold text-gray-800 sm:text-lg">
                    Approve Members
                </h2>
                <span
                    class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600"
                >
                    {{ pendingMembers.length }}
                </span>
            </div>

            <div class="space-y-4">
                <div
                    v-if="pendingMembers && pendingMembers.length > 0"
                    class="space-y-4"
                >
                    <div
                        v-for="member in pendingMembers"
                        :key="member.id"
                        class="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                    >
                        <div class="flex min-w-0 items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                            >
                                <svg
                                    class="w-6 h-6 text-gray-500"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                                    />
                                </svg>
                            </div>
                            <span
                                class="min-w-0 break-words font-semibold text-gray-700"
                                >{{ member.title }}</span
                            >
                        </div>
                        <div
                            class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:flex md:w-auto md:gap-2"
                        >
                            <button
                                @click="notifStore.approveUser(member.userId)"
                                :disabled="isActing(member)"
                                class="flex w-full items-center justify-center gap-2 rounded-md bg-green-700 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:cursor-pointer hover:bg-green-800 disabled:cursor-not-allowed sm:w-auto sm:px-4 sm:py-1 sm:text-xs"
                            >
                                <svg
                                    v-if="member.status === 'approving'"
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
                                    member.status === "approving"
                                        ? "Approving…"
                                        : "Approve"
                                }}
                            </button>
                            <button
                                @click="notifStore.denyUser(member.userId)"
                                :disabled="isActing(member)"
                                class="flex w-full items-center justify-center gap-2 rounded-md border border-red-400 px-3 py-1.5 text-[11px] font-semibold text-red-600 transition-colors hover:cursor-pointer hover:bg-red-50 disabled:cursor-not-allowed sm:w-auto sm:px-4 sm:py-1 sm:text-xs"
                            >
                                <svg
                                    v-if="member.status === 'denying'"
                                    class="animate-spin w-3 h-3"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        stroke-opacity="0.3"
                                        stroke-width="3"
                                    />
                                    <path
                                        d="M12 2a10 10 0 0 1 10 10"
                                        stroke="currentColor"
                                        stroke-width="3"
                                        stroke-linecap="round"
                                    />
                                </svg>
                                {{
                                    member.status === "denying"
                                        ? "Denying…"
                                        : "Deny"
                                }}
                            </button>
                        </div>
                    </div>
                </div>
                <p v-else class="text-center text-sm italic text-gray-500">
                    No pending requests.
                </p>
            </div>
        </div>

        <div class="flex flex-col gap-4 sm:gap-8">
            <div
                class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            >
                <div class="mb-4 border-b border-gray-100 pb-3 sm:mb-5">
                    <h2 class="text-base font-bold text-gray-800 sm:text-lg">
                        Change Position
                    </h2>
                    <p class="mt-1 text-xs text-gray-500">
                        Update a member's role and unit assignment.
                    </p>
                </div>

                <form @submit.prevent="submitChangeRole">
                    <div class="space-y-4">
                        <div>
                            <label
                                class="block text-sm font-semibold text-gray-700 mb-2"
                                >Member:</label
                            >
                            <select
                                v-model="changePosMembers.user_id"
                                class="hover:cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                                :disabled="loading?.update"
                            >
                                <option disabled selected :value="null">
                                    -- Select a member --
                                </option>
                                <option
                                    v-for="member in normalMembers"
                                    :key="member.id"
                                    :value="member.id"
                                >
                                    {{
                                        `${member.fname}
                                    ${member.middle_initial || ""} ${member.lname}`
                                    }}
                                </option>
                            </select>
                            <p
                                v-if="changePosMembers.user_id"
                                class="mt-2 text-xs text-gray-500"
                            >
                                Current unit:
                                <span class="font-semibold text-slate-700">{{
                                    selectedMemberUnitLabel
                                }}</span>
                            </p>
                        </div>

                        <div v-if="changePosMembers.user_id">
                            <label
                                class="block text-sm font-semibold text-gray-700 mb-2"
                                >Position:</label
                            >
                            <select
                                v-model="changePosMembers.pos_id"
                                class="hover:cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                                :disabled="loading?.update"
                            >
                                <option disabled selected :value="null">
                                    -- Select position --
                                </option>
                                <option
                                    v-for="role in roles"
                                    :key="role.pos_id"
                                    :value="role.pos_id"
                                >
                                    {{ role.pos_name }}
                                </option>
                            </select>
                        </div>

                        <div v-if="changePosMembers.pos_id === 4">
                            <label
                                class="block text-sm font-semibold text-gray-700 mb-2"
                                >Unit:</label
                            >
                            <select
                                v-model="changePosMembers.unit_id"
                                class="hover:cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                                :disabled="loading?.update"
                            >
                                <option disabled selected :value="null">
                                    -- Select Unit --
                                </option>
                                <option
                                    v-for="unit in availableUnit"
                                    :key="unit.id"
                                    :value="unit.id"
                                >
                                    {{ unit.name }}
                                </option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            :disabled="loading?.update"
                            class="flex justify-center items-center gap-2 w-full mt-2 px-4 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors hover:cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            <svg
                                v-if="loading?.update"
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
                            <span>{{
                                loading?.update ? "Confirming…" : "Confirm"
                            }}</span>
                        </button>
                    </div>
                </form>
            </div>

            <div
                class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            >
                <div class="mb-4 border-b border-gray-100 pb-3 sm:mb-5">
                    <h2 class="text-base font-bold text-gray-800 sm:text-lg">
                        Remove Member
                    </h2>
                    <p class="mt-1 text-xs text-gray-500">
                        Remove member access from the system.
                    </p>
                </div>

                <form @submit.prevent="removeMember">
                    <div class="space-y-4">
                        <div>
                            <label
                                class="block text-sm font-semibold text-gray-700 mb-2"
                                >Member:</label
                            >
                            <select
                                v-model="deleteMember.user_id"
                                class="hover:cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                                :disabled="loading?.delete"
                            >
                                <option disabled selected :value="null">
                                    -- Select a member --
                                </option>
                                <option
                                    v-for="member in normalMembers"
                                    :key="member.id"
                                    :value="member.id"
                                >
                                    {{
                                        `${member.fname}
                                    ${member.middle_initial || ""} ${member.lname}`
                                    }}
                                </option>
                            </select>
                            <p class="text-xs text-red-500 mt-1">
                                * Not 2 members at the same time
                            </p>
                        </div>

                        <button
                            :disabled="loading?.delete"
                            type="submit"
                            class="w-full mt-4 px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors flex justify-center items-center gap-2 hover:cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                        >
                            <svg
                                v-if="loading?.delete"
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
                            <span>{{
                                loading?.delete ? "Removing…" : "Remove"
                            }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
