<script setup vapor>
import { useAuthStore } from "@/stores/useAuthStore";
import { onMounted, reactive, ref, computed, watch } from "vue";
import Icons from "@/components/Icons.vue";
import { useUnitStore } from "@/stores/unit";
import PersonalInformation from "@/components/Profile/PersonalInformation.vue";
import ContactInformation from "@/components/Profile/ContactInformation.vue";
import WorkInformation from "@/components/Profile/WorkInformation.vue";
import ChangePassword from "@/components/Profile/ChangePassword.vue";
import { useAddressStore } from "@/stores/address";
import { useGenderStore } from "@/stores/gender";

const auth = useAuthStore();

// ── State ──
const loading = ref(true);

const loadingDropdowns = ref(true);
const units = useUnitStore();
const addressStore = useAddressStore();
const genders = useGenderStore();
const saveDialog = ref(null);

const resolveExposedValue = (value) => {
    if (value && typeof value === "object" && "value" in value) {
        return value.value;
    }
    return value;
};

const saveSuccessVisible = computed(() => {
    return Boolean(resolveExposedValue(saveDialog.value?.saveSuccess));
});

const showSaveModal = ref(false);

watch(saveSuccessVisible, (isSuccess, wasSuccess) => {
    // Open modal only when save transitions from not-success to success.
    if (isSuccess && !wasSuccess) {
        showSaveModal.value = true;
    }
});

const saveErrorMessage = computed(() => {
    const value = resolveExposedValue(saveDialog.value?.saveError);
    return typeof value === "string" ? value : "";
});

const activeSectionLabel = computed(() => {
    const section = infoTabs.find((tab) => tab.key === infoSection.value);
    return section?.key === "password" ? "password" : "profile";
});

const closeSaveModal = () => {
    showSaveModal.value = false;

    const dialog = saveDialog.value;
    if (!dialog || dialog.saveSuccess === undefined) return;

    const exposed = dialog.saveSuccess;
    if (exposed && typeof exposed === "object" && "value" in exposed) {
        exposed.value = false;
        return;
    }

    dialog.saveSuccess = false;
};

const infoSection = ref("personal");

const infoTabs = [
    { key: "personal", label: "Personal Information", icon: "personal" },
    { key: "contact", label: "Contact Information", icon: "contact" },
    { key: "work", label: "Work Information", icon: "work" },
    { key: "password", label: "Change Password", icon: "profile" },
];

const form = reactive({
    fname: "",
    middle_initial: "",
    lname: "",
    birthdate: "",
    genderId: "",
    phone: "",
    address: "",
});

onMounted(async () => {
    loading.value = true;
    try {
        // Run everything at once and wait for all to finish
        await Promise.all([
            units.fetchUnit(),
            genders.fetchGender(),
            addressStore.fetchUserAddress(auth.userID),
        ]);
    } finally {
        loadingDropdowns.value = false;
        loading.value = false;
    }
});
</script>

<template>
    <div
        class="profile-view relative flex h-full min-h-0 flex-col items-center overflow-hidden bg-slate-100 px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8"
    >
        <div
            class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,95,70,0.15),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.12),_transparent_48%)]"
        ></div>
        <div
            class="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-white/55 to-transparent"
        ></div>

        <!-- Loading skeleton -->
        <div
            v-if="loading"
            class="relative z-10 flex w-full max-w-[1200px] gap-6 items-start animate-pulse"
        >
            <div
                class="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 space-y-5"
            >
                <div class="flex gap-4">
                    <div class="flex-1 h-10 rounded-lg bg-gray-200"></div>
                    <div class="flex-1 h-10 rounded-lg bg-gray-200"></div>
                    <div class="w-20 h-10 rounded-lg bg-gray-200"></div>
                </div>
                <div class="flex gap-4">
                    <div class="flex-1 h-10 rounded-lg bg-gray-200"></div>
                    <div class="w-52 h-10 rounded-lg bg-gray-200"></div>
                </div>
                <div class="flex gap-4">
                    <div class="w-44 h-10 rounded-lg bg-gray-200"></div>
                    <div class="flex-1 h-10 rounded-lg bg-gray-200"></div>
                    <div class="w-44 h-10 rounded-lg bg-gray-200"></div>
                </div>
                <div class="h-36 rounded-lg bg-gray-200"></div>
            </div>
        </div>

        <!-- Main content -->
        <div
            v-else
            class="profile-shell relative z-10 flex w-full max-w-[1200px] min-h-0 flex-1 flex-col gap-5 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_26px_65px_rgba(15,23,42,0.12)] backdrop-blur-md sm:p-6 md:flex-row md:p-7 lg:p-8"
        >
            <!-- Navbar -->
            <div class="w-full md:w-64 md:shrink-0 lg:w-72">
                <ul
                    class="flex w-full flex-row gap-1 border-b border-slate-200 pb-3 sm:gap-2 sm:pb-4 md:flex-col md:border-b-0 md:border-r md:pr-5 md:pb-0"
                >
                    <li
                        class="group flex flex-1 items-center justify-center gap-2 rounded-2xl p-2.5 text-sm font-semibold transition-all duration-200 hover:cursor-pointer sm:flex-initial sm:justify-start sm:p-4 md:w-full"
                        :class="
                            infoSection === section.key
                                ? 'bg-linear-to-r from-emerald-950 via-green-900 to-green-800 text-white shadow-[0_10px_30px_rgba(6,78,59,0.28)]'
                                : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900'
                        "
                        v-for="section in infoTabs"
                        :key="section.key"
                        @click="infoSection = section.key"
                    >
                        <span
                            class="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-current transition-colors group-hover:bg-white/40"
                        >
                            <Icons :icon="section.icon" />
                        </span>
                        <span
                            class="flex-1 px-2 text-xs hidden sm:block lg:text-sm"
                            >{{ section.label }}</span
                        >
                        <span
                            class="transition-transform duration-200 group-hover:translate-x-0.5 hidden sm:inline-flex"
                        >
                            <Icons :icon="'chevronRight'" />
                        </span>
                    </li>
                </ul>
            </div>

            <div
                class="min-w-0 flex-1 min-h-0 overflow-x-hidden overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/80 p-4 shadow-inner shadow-slate-200/40 sm:p-6 lg:p-7"
            >
                <!-- Feedback banners -->
                <Transition name="fade">
                    <div
                        v-if="saveErrorMessage"
                        class="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3"
                    >
                        {{ saveErrorMessage }}
                    </div>
                </Transition>

                <!-- Left: Avatar + Upload -->
                <PersonalInformation
                    v-if="infoSection === 'personal'"
                    ref="saveDialog"
                />

                <!-- Contact Number, Email, Gender -->
                <ContactInformation
                    v-else-if="infoSection === 'contact'"
                    ref="saveDialog"
                />

                <!-- Unit -->
                <WorkInformation
                    v-else-if="infoSection === 'work'"
                    :loading-dropdowns="loadingDropdowns"
                />

                <!-- Change Password -->
                <ChangePassword
                    v-else-if="infoSection === 'password'"
                    ref="saveDialog"
                    @saved="showSaveModal = true"
                />
            </div>
        </div>

        <Teleport to="body">
            <Transition name="fade">
                <div
                    v-if="showSaveModal"
                    class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[1px]"
                    @click.self="closeSaveModal"
                >
                    <div
                        class="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_50px_rgba(15,23,42,0.25)]"
                    >
                        <div
                            class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2.2"
                                class="h-6 w-6"
                            >
                                <path
                                    d="M5 12l5 5L20 7"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                        </div>

                        <h3
                            class="text-center text-lg font-bold text-slate-900"
                        >
                            Saved Successfully
                        </h3>
                        <p class="mt-1 text-center text-sm text-slate-600">
                            {{
                                activeSectionLabel === "password"
                                    ? "Your password has been updated."
                                    : "Your profile details have been updated."
                            }}
                        </p>

                        <div class="mt-5 flex justify-center">
                            <button
                                type="button"
                                class="rounded-full bg-emerald-700 px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                                @click="closeSaveModal"
                            >
                                OK
                            </button>
                        </div>

                        <button
                            type="button"
                            class="absolute right-4 top-4 text-slate-400 transition-colors hover:text-slate-600"
                            @click="closeSaveModal"
                            aria-label="Close modal"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                class="h-4 w-4"
                            >
                                <path
                                    d="M6 6l12 12M18 6L6 18"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style scoped>
.profile-view::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background-image:
        linear-gradient(to right, rgba(15, 23, 42, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.35),
        transparent 75%
    );
}

.profile-shell {
    animation: shellIn 0.45s ease-out;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@keyframes shellIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
