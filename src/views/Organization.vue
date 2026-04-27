<script setup vapor>
import { ref, onMounted, onUnmounted, h, computed } from "vue";
import Loading from "@/components/Loading.vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { usePosStore } from "@/stores/positions";
import { useMemberStore } from "@/stores/member";
import { storeToRefs } from "pinia";
import ManageMembership from "@/components/ManageMembership.vue";
import OrgCard from "@/components/OrgCard.vue"; // Adjust path as needed
import Icons from "@/components/Icons.vue";

const role = useAuthStore().isDirector;
const positions = usePosStore();
const members = useMemberStore();
const loading = storeToRefs(members)?.loading;
const chartLoading = ref(true);

const zoomLevel = ref(1);

const handleWheel = (event) => {
    if (event.ctrlKey) {
        event.preventDefault();
        const zoomSpeed = 0.05;
        if (event.deltaY < 0) {
            zoomLevel.value = Math.min(zoomLevel.value + zoomSpeed, 3);
        } else {
            zoomLevel.value = Math.max(zoomLevel.value - zoomSpeed, 1);
        }
    }
};

onMounted(async () => {
    chartLoading.value = true;
    await Promise.all([
        members.fetchMembers(),
        positions.fetchPos(),
        positions.fetchMemberPos(),
    ]);
    chartLoading.value = false;
    window.addEventListener("wheel", handleWheel, { passive: false });
});

onUnmounted(() => {
    window.removeEventListener("wheel", handleWheel);
});

const VLine = (props) =>
    h("div", {
        style: {
            width: "1px",
            height: props.h || "15px",
            background: "#000",
            flexShrink: 0,
        },
    });

const PROFESSIONAL_PREFIX = Object.freeze({
    Architect: "Ar.",
    Engineer: "Engr.",
});

const membersById = computed(() => {
    const map = new Map();
    for (const member of members.members) map.set(member.id, member);
    return map;
});

const positionNameById = computed(() => {
    const lookup = {};
    for (const p of positions.position) {
        if (p.id !== 11) lookup[p.id] = p.name;
    }
    return lookup;
});

const chartUsers = computed(() => {
    const adminUserIds = new Set(
        positions.memberPos
            .filter((link) => link.pos_id === 11)
            .map((link) => link.user_id),
    );

    const users = [];

    for (const link of positions.memberPos) {
        if (adminUserIds.has(link.user_id)) continue;

        const member = membersById.value.get(link.user_id);
        if (!member) continue;

        const prof = PROFESSIONAL_PREFIX[member.profession] || "";
        const middleInitial = member.middle_initial?.trim()
            ? `${member.middle_initial.trim()}.`
            : "";
        const fullName =
            `${prof} ${member.fname} ${middleInitial} ${member.lname}`.trim();

        users.push({
            ...member,
            name: fullName.toUpperCase(),
            title: positionNameById.value[link.pos_id] || "Unknown Position",
            unitId: link.unit_id,
            avatarUrl: member.avatar_url || "",
            assignmentId: `${link.user_id}-${link.pos_id}-${link.unit_id}`,
        });
    }

    return users;
});

const orgData = computed(() => {
    const users = chartUsers.value;

    const usersByUnit = users.reduce((acc, user) => {
        (acc[user.unitId] ||= []).push(user);
        return acc;
    }, {});

    const pduAll = usersByUnit[1] || [];
    const piuAll = usersByUnit[2] || [];
    const officeAll = usersByUnit[3] || [];

    const getHead = (unitUsers) =>
        unitUsers.find((u) => u.title === "Unit Head") || null;

    const consolidateMembers = (unitUsers) => {
        const grouped = new Map();

        for (const user of unitUsers) {
            if (user.title === "Unit Head") continue;

            const existing = grouped.get(user.id);
            if (!existing) {
                grouped.set(user.id, { ...user, titles: [user.title] });
                continue;
            }

            if (!existing.titles.includes(user.title)) {
                existing.titles.push(user.title);
            }
        }

        return Array.from(grouped.values()).map((user) => ({
            ...user,
            title: user.titles.join(" / "),
        }));
    };

    const hasTitle = (user, keyword) =>
        user.title?.toLowerCase().includes(keyword);

    const officeMembers = consolidateMembers(officeAll).filter(
        (u) => u.title !== "Director",
    );
    const officeHead =
        officeMembers.find((u) => u.name.includes("JOKO J. SACO")) ||
        officeMembers[0] ||
        null;
    const officeTeam = officeMembers.filter(
        (u) => !officeHead || u.id !== officeHead.id,
    );

    const director = users.find((u) => u.title === "Director") || {
        name: "Vacant",
        title: "Director",
    };

    const pduMembers = consolidateMembers(pduAll).filter(
        (u) => !hasTitle(u, "drafts"),
    );

    const pduSeniorDrafts = pduAll.find((u) => hasTitle(u, "senior")) || null;
    const pduJuniorDrafts = pduAll.filter((u) => hasTitle(u, "junior"));
    const piuManager =
        piuAll.find((u) => u.title === "Construction Manager") || null;
    const piuSiteEngineers = piuAll.filter((u) => hasTitle(u, "site engineer"));

    return {
        president: {
            name: "ROLYN C. DAGUIL, PhD",
            title: "University President",
            avatarUrl: "/images/pres.png",
        },
        vp: {
            name: "ALEXANDER T. DEMENTILLO, D.ENG.",
            title: "Vice President for Administration and Finance",
            avatarUrl: "/images/vpaf.webp",
        },
        divChief: {
            name: "AR. MAGICHAEL B. CLORIBEL",
            title: "Division Chief, DCFSSS",
            avatarUrl: director.avatarUrl,
        },

        director,

        pdu: {
            head: getHead(pduAll),
            members: pduMembers,
            seniorDrafts: pduSeniorDrafts,
            juniorDrafts: pduJuniorDrafts,
        },

        officeStaff: {
            head: officeHead,
            members: officeTeam,
        },

        piu: {
            head: getHead(piuAll),
            manager: piuManager,
            siteEngineers: piuSiteEngineers,
        },
    };
});

const MEMBER_SLOT_WIDTH = 90;
const UNIT_INNER_PADDING = 32;
const UNIT_MIN_WIDTH = 420;
const UNIT_GAP = 16;

const branchWidth = (count) => Math.max(count * MEMBER_SLOT_WIDTH - 10, 0);

const pduMemberBranchWidth = computed(() =>
    branchWidth(orgData.value.pdu.members.length),
);
const pduDraftBranchWidth = computed(() =>
    branchWidth(orgData.value.pdu.juniorDrafts.length),
);
const officeBranchWidth = computed(() =>
    branchWidth(orgData.value.officeStaff.members.length),
);
const piuBranchWidth = computed(() =>
    branchWidth(orgData.value.piu.siteEngineers.length),
);

const unitColWidth = computed(() =>
    Math.max(
        UNIT_MIN_WIDTH,
        pduMemberBranchWidth.value + UNIT_INNER_PADDING,
        pduDraftBranchWidth.value + UNIT_INNER_PADDING,
        officeBranchWidth.value + UNIT_INNER_PADDING,
        piuBranchWidth.value + UNIT_INNER_PADDING,
    ),
);

const orgChartWidth = computed(() => unitColWidth.value * 3 + UNIT_GAP * 2);
const topConnectorInset = computed(() => Math.round(unitColWidth.value / 2));

const chartContainerStyle = computed(() => ({
    minWidth: `${orgChartWidth.value}px`,
}));
const connectorRowStyle = computed(() => ({
    width: `${orgChartWidth.value}px`,
}));
const topConnectorStyle = computed(() => ({
    left: `${topConnectorInset.value}px`,
    right: `${topConnectorInset.value}px`,
}));
const topGridStyle = computed(() => ({
    gridTemplateColumns: `repeat(3, ${unitColWidth.value}px)`,
    columnGap: `${UNIT_GAP}px`,
}));
const unitGridStyle = computed(() => ({
    width: `${orgChartWidth.value}px`,
    gridTemplateColumns: `repeat(3, ${unitColWidth.value}px)`,
    columnGap: `${UNIT_GAP}px`,
}));
const unitColumnStyle = computed(() => ({ width: `${unitColWidth.value}px` }));

const pduMemberBranchStyle = computed(() => ({
    width: `${pduMemberBranchWidth.value}px`,
}));
const pduDraftBranchStyle = computed(() => ({
    width: `${pduDraftBranchWidth.value}px`,
}));
const officeBranchStyle = computed(() => ({
    width: `${officeBranchWidth.value}px`,
}));
const piuBranchStyle = computed(() => ({ width: `${piuBranchWidth.value}px` }));

const showManagement = ref(false);
const showUnitStructureModal = ref(false);
const unitStructureModalData = ref({ title: "", sections: [] });
const selectedProfile = ref(null);

const openUnitStructureModal = (unitKey) => {
    if (unitKey === "pdu") {
        unitStructureModalData.value = {
            title: "Planning and Design Unit Functional Structure",
            sections: [
                { heading: "Unit Head", items: [orgData.value.pdu.head] },
                {
                    heading: "Professional Staff",
                    items: orgData.value.pdu.members,
                },
                {
                    heading: "Drafting Staff",
                    items: [
                        ...(orgData.value.pdu.seniorDrafts
                            ? [orgData.value.pdu.seniorDrafts]
                            : []),
                        ...orgData.value.pdu.juniorDrafts,
                    ],
                },
            ],
        };
    } else if (unitKey === "office") {
        unitStructureModalData.value = {
            title: "Office Staff Functional Structure",
            sections: [
                ...(orgData.value.officeStaff.head
                    ? [
                          {
                              heading: "Unit Head",
                              items: [orgData.value.officeStaff.head],
                          },
                      ]
                    : []),
                {
                    heading: "Office Staff Members",
                    items: orgData.value.officeStaff.members,
                },
            ],
        };
    } else if (unitKey === "piu") {
        unitStructureModalData.value = {
            title: "Project Implementation Unit Functional Structure",
            sections: [
                { heading: "Unit Head", items: [orgData.value.piu.head] },
                {
                    heading: "Construction Management",
                    items: [orgData.value.piu.manager],
                },
                {
                    heading: "Site Engineers",
                    items: orgData.value.piu.siteEngineers,
                },
            ],
        };
    }
    showUnitStructureModal.value = true;
};

const closeUnitStructureModal = () => {
    showUnitStructureModal.value = false;
};

// Global sizes passed directly to the component
const sz = {
    lg: { w: "160px", av: "40px", nm: "8px", ti: "7px", p: "3px 6px" },
    md: { w: "130px", av: "36px", nm: "7px", ti: "6px", p: "2px 5px" },
    sm: { w: "80px", av: "28px", nm: "6px", ti: "5px", p: "2px 3px" },
};
</script>

<template>
    <div
        class="relative flex-1 h-full min-h-0 w-full overflow-hidden bg-[url('/images/csu-background.png')] bg-cover bg-center"
    >
        <div
            v-if="!showManagement"
            class="relative z-10 flex flex-col items-center w-full h-full"
        >
            <div
                class="sticky top-0 z-40 w-full flex justify-between items-center px-4 py-2 bg-white/80 border-b border-black/10 shadow-sm"
            >
                <div class="flex items-center gap-3">
                    <img
                        src="/images/csu_seal.png"
                        alt="CSU"
                        class="w-20 h-20 object-contain"
                        onerror="this.style.display = 'none'"
                    />
                    <div class="leading-tight">
                        <p
                            class="text-sm font-semibold text-[#1b5e3f] uppercase tracking-widest"
                        >
                            Caraga State
                        </p>
                        <p
                            class="text-lg font-black text-[#1b5e3f] uppercase tracking-widest"
                            style="font-family: Georgia, serif"
                        >
                            University
                        </p>
                    </div>
                </div>
                <button
                    v-if="role"
                    @click="showManagement = true"
                    class="flex justify-between item-center gap-2 text-white font-bold text-sm p-4 rounded-3xl shadow-lg bg-green-950 hover:bg-green-900 transition-colors cursor-pointer"
                >
                    <Icons :icon="'manage_membership'" />
                    <span class="hidden md:block">Manage Membership</span>
                </button>
            </div>

            <Loading
                v-if="chartLoading || loading"
                :message="'Loading organization chart...'"
            />

            <div v-else class="w-full flex-1 min-h-0 overflow-auto">
                <div
                    class="w-max min-w-full flex justify-center px-2 pt-3 pb-5"
                >
                    <div
                        class="relative transition-transform duration-300 ease-in-out origin-top-left"
                        :style="{ transform: `scale(${zoomLevel})` }"
                    >
                        <div
                            class="flex flex-col items-center justify-center"
                            :style="chartContainerStyle"
                        >
                            <OrgCard
                                :person="orgData.president"
                                :sz="sz.md"
                                @click="selectedProfile = orgData.president"
                            />
                            <VLine />

                            <OrgCard
                                :person="orgData.vp"
                                :sz="sz.lg"
                                @click="selectedProfile = orgData.vp"
                            />
                            <VLine />

                            <OrgCard
                                :person="orgData.divChief"
                                :sz="sz.md"
                                @click="selectedProfile = orgData.divChief"
                            />
                            <VLine />

                            <OrgCard
                                :person="orgData.director"
                                :sz="sz.md"
                                @click="selectedProfile = orgData.director"
                            />
                            <VLine />

                            <div :style="connectorRowStyle">
                                <div class="relative min-h-[14px]">
                                    <div
                                        class="absolute top-0 h-px bg-black"
                                        :style="topConnectorStyle"
                                    ></div>
                                    <div class="grid" :style="topGridStyle">
                                        <div class="flex justify-center">
                                            <div
                                                class="w-px h-[14px] bg-black"
                                            ></div>
                                        </div>
                                        <div class="flex justify-center">
                                            <div
                                                class="w-px h-[14px] bg-black"
                                            ></div>
                                        </div>
                                        <div class="flex justify-center">
                                            <div
                                                class="w-px h-[14px] bg-black"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="grid justify-items-center"
                                :style="unitGridStyle"
                            >
                                <div
                                    class="flex flex-col items-center"
                                    :style="unitColumnStyle"
                                >
                                    <VLine />
                                    <p
                                        class="unit-label text-[#386327] font-bold uppercase text-center leading-tight mb-1 mt-1 cursor-pointer hover:underline"
                                        @click="openUnitStructureModal('pdu')"
                                    >
                                        PLANNING AND DESIGN UNIT
                                    </p>
                                    <VLine />

                                    <OrgCard
                                        :person="orgData.pdu.head"
                                        :sz="sz.md"
                                        @click="
                                            selectedProfile = orgData.pdu.head
                                        "
                                    />
                                    <VLine />

                                    <div
                                        v-if="orgData.pdu.members.length"
                                        class="relative min-h-[14px]"
                                        :style="pduMemberBranchStyle"
                                    >
                                        <div
                                            class="absolute top-0 left-[40px] right-[40px] h-px bg-black"
                                        ></div>
                                        <div
                                            class="flex justify-center items-start gap-[10px]"
                                        >
                                            <div
                                                v-for="i in orgData.pdu.members
                                                    .length"
                                                :key="i"
                                                class="w-[80px] flex justify-center"
                                            >
                                                <div
                                                    class="w-px h-[14px] bg-black"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        v-if="orgData.pdu.members.length"
                                        class="flex justify-center items-start gap-[10px]"
                                        :style="pduMemberBranchStyle"
                                    >
                                        <OrgCard
                                            v-for="m in orgData.pdu.members"
                                            :key="m.name"
                                            :person="m"
                                            :sz="sz.sm"
                                            @click="selectedProfile = m"
                                        />
                                    </div>

                                    <VLine />

                                    <div class="flex flex-col items-center">
                                        <OrgCard
                                            :person="orgData.pdu.seniorDrafts"
                                            :sz="sz.sm"
                                            @click="
                                                selectedProfile =
                                                    orgData.pdu.seniorDrafts
                                            "
                                        />
                                        <VLine
                                            v-if="
                                                orgData.pdu.juniorDrafts.length
                                            "
                                        />

                                        <div
                                            v-if="
                                                orgData.pdu.juniorDrafts.length
                                            "
                                            class="relative min-h-[14px]"
                                            :style="pduDraftBranchStyle"
                                        >
                                            <div
                                                class="absolute top-0 left-[40px] right-[40px] h-px bg-black"
                                            ></div>
                                            <div
                                                class="flex justify-center items-start gap-[10px]"
                                            >
                                                <div
                                                    v-for="i in orgData.pdu
                                                        .juniorDrafts.length"
                                                    :key="i"
                                                    class="w-[80px] flex justify-center"
                                                >
                                                    <div
                                                        class="w-px h-[14px] bg-black"
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            v-if="
                                                orgData.pdu.juniorDrafts.length
                                            "
                                            class="flex justify-center items-start gap-[10px]"
                                            :style="pduDraftBranchStyle"
                                        >
                                            <OrgCard
                                                v-for="s in orgData.pdu
                                                    .juniorDrafts"
                                                :key="s.name"
                                                :person="s"
                                                :sz="sz.sm"
                                                @click="selectedProfile = s"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    class="flex flex-col items-center"
                                    :style="unitColumnStyle"
                                >
                                    <div class="w-px h-56 bg-black"></div>
                                    <p
                                        class="unit-label text-[#386327] font-bold uppercase text-center leading-tight mb-1 mt-1 cursor-pointer hover:underline"
                                        @click="
                                            openUnitStructureModal('office')
                                        "
                                    >
                                        OFFICE STAFF
                                    </p>
                                    <VLine />
                                    <OrgCard
                                        v-if="orgData.officeStaff.head"
                                        :person="orgData.officeStaff.head"
                                        :sz="sz.sm"
                                        @click="
                                            selectedProfile =
                                                orgData.officeStaff.head
                                        "
                                    />
                                    <VLine
                                        v-if="
                                            orgData.officeStaff.members.length
                                        "
                                        h="20px"
                                    />

                                    <div
                                        v-if="
                                            orgData.officeStaff.members.length
                                        "
                                        class="relative min-h-[14px]"
                                        :style="officeBranchStyle"
                                    >
                                        <div
                                            class="absolute top-0 left-[40px] right-[40px] h-px bg-black"
                                        ></div>
                                        <div
                                            class="flex justify-center items-start gap-[10px]"
                                        >
                                            <div
                                                v-for="i in orgData.officeStaff
                                                    .members.length"
                                                :key="i"
                                                class="w-[80px] flex justify-center"
                                            >
                                                <div
                                                    class="w-px h-[14px] bg-black"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        v-if="
                                            orgData.officeStaff.members.length
                                        "
                                        class="flex justify-center items-start gap-[10px]"
                                        :style="officeBranchStyle"
                                    >
                                        <OrgCard
                                            v-for="s in orgData.officeStaff
                                                .members"
                                            :key="s.name"
                                            :person="s"
                                            :sz="sz.sm"
                                            @click="selectedProfile = s"
                                        />
                                    </div>
                                </div>

                                <div
                                    class="flex flex-col items-center"
                                    :style="unitColumnStyle"
                                >
                                    <VLine />
                                    <p
                                        class="unit-label text-[#386327] font-bold uppercase text-center leading-tight mb-1 mt-1 cursor-pointer hover:underline"
                                        @click="openUnitStructureModal('piu')"
                                    >
                                        PROJECT IMPLEMENTATION UNIT
                                    </p>
                                    <VLine />

                                    <OrgCard
                                        :person="orgData.piu.head"
                                        :sz="sz.md"
                                        @click="
                                            selectedProfile = orgData.piu.head
                                        "
                                    />
                                    <VLine />

                                    <OrgCard
                                        :person="orgData.piu.manager"
                                        :sz="sz.sm"
                                        @click="
                                            selectedProfile =
                                                orgData.piu.manager
                                        "
                                    />
                                    <VLine
                                        v-if="orgData.piu.siteEngineers.length"
                                    />

                                    <div
                                        v-if="orgData.piu.siteEngineers.length"
                                        class="relative min-h-[14px]"
                                        :style="piuBranchStyle"
                                    >
                                        <div
                                            class="absolute top-0 left-[40px] right-[40px] h-px bg-black"
                                        ></div>
                                        <div
                                            class="flex justify-center items-start gap-[10px]"
                                        >
                                            <div
                                                v-for="i in orgData.piu
                                                    .siteEngineers.length"
                                                :key="i"
                                                class="w-[80px] flex justify-center"
                                            >
                                                <div
                                                    class="w-px h-[14px] bg-black"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        v-if="orgData.piu.siteEngineers.length"
                                        class="flex justify-center items-start gap-[10px]"
                                        :style="piuBranchStyle"
                                    >
                                        <OrgCard
                                            v-for="e in orgData.piu
                                                .siteEngineers"
                                            :key="e.name"
                                            :person="e"
                                            :sz="sz.sm"
                                            @click="selectedProfile = e"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-else
            class="relative z-10 flex h-full min-h-0 flex-col overflow-hidden p-3 sm:p-5 lg:p-8"
        >
            <div
                class="sticky top-0 z-20 mb-4 w-full border-b border-gray-200 bg-white py-2 sm:mb-5"
            >
                <div
                    class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <button
                        @click="showManagement = false"
                        class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-50 hover:text-gray-900 sm:px-4 sm:text-base"
                    >
                        <span class="text-base">←</span>
                        <span>Go back</span>
                    </button>

                    <p class="text-green-950 text-xl font-bold sm:text-2xl">
                        Manage Membership
                    </p>
                </div>
            </div>
            <div class="min-h-0 flex-1 overflow-auto pb-2">
                <ManageMembership class="mt-2 sm:mt-5" />
            </div>
        </div>

        <div
            v-if="showUnitStructureModal"
            class="fixed inset-0 z-[1200] flex items-center justify-center p-4"
        >
            <div
                class="absolute inset-0 bg-black/50"
                @click="closeUnitStructureModal"
            ></div>
            <div
                class="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
            >
                <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-lg font-extrabold text-[#1b5e3f]">
                        {{ unitStructureModalData.title }}
                    </h2>
                    <button
                        @click="closeUnitStructureModal"
                        class="rounded-full border border-gray-300 px-3 py-1 text-sm font-bold text-gray-700 hover:bg-gray-100"
                    >
                        Close
                    </button>
                </div>
                <div class="space-y-4">
                    <div
                        v-for="section in unitStructureModalData.sections"
                        :key="section.heading"
                        class="rounded-lg border border-gray-200 p-4"
                    >
                        <p
                            class="mb-2 text-sm font-bold uppercase tracking-wide text-[#386327]"
                        >
                            {{ section.heading }}
                        </p>
                        <div class="space-y-1">
                            <div
                                v-for="person in section.items"
                                :key="person.name"
                                class="text-sm text-gray-800"
                            >
                                <span class="font-semibold">{{
                                    person.name
                                }}</span>
                                <span class="text-gray-600">
                                    - {{ person.title }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Teleport to="body">
            <div
                v-if="selectedProfile"
                class="fixed inset-0 z-[1300] flex items-center justify-center p-4"
            >
                <div
                    class="absolute inset-0 bg-black/50"
                    @click="selectedProfile = null"
                ></div>
                <div
                    class="relative z-10 w-full max-w-[280px] rounded-xl bg-white p-6 shadow-2xl text-center"
                >
                    <div class="text-xs text-gray-400 mb-3">
                        Profile (click to view)
                    </div>
                    <div
                        class="w-20 h-20 rounded-full bg-[#D9D9D9] mx-auto mb-4 flex items-center justify-center shrink-0"
                    >
                        <img
                            v-if="selectedProfile?.avatarUrl"
                            :src="selectedProfile?.avatarUrl"
                            alt=""
                            class="rounded-full bg-cover bg-center no-repeat"
                        />
                        <svg
                            v-else
                            fill="#9ca3af"
                            viewBox="0 0 24 24"
                            class="w-1/2 h-1/2"
                        >
                            <path
                                d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                            />
                        </svg>
                    </div>
                    <p
                        class="text-[15px] font-bold text-black mb-1 font-['Hammersmith_One',sans-serif]"
                    >
                        {{ selectedProfile.name }}
                    </p>
                    <p
                        class="text-[13px] text-gray-600 mb-4 font-['Hammersmith_One',sans-serif]"
                    >
                        {{ selectedProfile.title }}
                    </p>
                    <div
                        class="bg-gray-100 rounded-lg min-h-[100px] mb-4 flex items-center justify-center text-gray-400 text-sm"
                    >
                        Additional information
                    </div>
                    <button
                        @click="selectedProfile = null"
                        class="bg-[#003300] hover:cursor-pointer text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-green-900 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Hammersmith+One&family=Lilita+One&display=swap");

.unit-label {
    font-family: "Lilita One", serif;
    font-size: 13px;
}
</style>
