<script setup vapor>
import Icons from "../Icons.vue";
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { useGenderStore } from "@/stores/gender";
import { storeToRefs } from "pinia";
import AddressEdit from "./AddressEdit.vue";
import { useAddressStore } from "@/stores/address";

const auth = useAuthStore();
const genders = useGenderStore();
const { gender } = storeToRefs(genders);

const fileInput = ref(null);
const errors = reactive({});
const imagePreview = ref(null);
const currentAvatar = ref(null);
const uploadError = ref(""); // separate error just for avatar
const imageFile = ref(null); // holds the actual File object
const addressInfo = ref(null);

const saving = ref(false);
const saveSuccess = ref(false);
const saveError = ref("");

defineExpose({ saveSuccess, saveError });

const currentForm = ref({});
const fillCurrentForm = (form) => {
    currentForm.value = {
        ...form,
        address: {
            regionCode: form.regionCode,
            provinceCode: form.provinceCode,
            cityCode: form.cityCode,
            barangayCode: form.barangayCode,
        },
    };
};
const form = reactive({
    fname: "",
    middle_initial: "",
    lname: "",
    birthdate: "",
    gender_id: null,
    regionCode: "",
    provinceCode: "",
    cityCode: "",
    barangayCode: "",
});

onMounted(async () => {
    form.fname = auth.profile.fname || "";
    form.middle_initial = auth.profile.middle_initial || "";
    form.lname = auth.profile.lname || "";
    form.birthdate = auth.profile.birthdate || "";
    form.gender_id = auth.profile.gender_id || null;
    form.regionCode = auth.profile.region_code || "";
    form.provinceCode = auth.profile.province_code || "";
    form.cityCode = auth.profile.city_code || "";
    form.barangayCode = auth.profile.barangay_code || "";
    if (auth.profile.avatar_url) {
        const base = auth.profile.avatar_url.split("?")[0];
        currentAvatar.value = `${base}?t=${Date.now()}`;
    }
    fillCurrentForm(form);
});

// ── Image selection (only previews — does NOT upload yet) ──
const handleImageUpload = (e) => {
    uploadError.value = "";
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        uploadError.value = "Invalid file type. Only JPG, PNG, WEBP allowed.";
        return;
    }
    if (file.size > 2 * 1024 * 1024) {
        uploadError.value = "File must be under 2 MB.";
        return;
    }

    // Store the file — this is what gets uploaded on Save
    imageFile.value = file;
    console.log(
        "[avatar] File staged for upload:",
        file.name,
        file.type,
        file.size,
    );

    const reader = new FileReader();
    reader.onload = (ev) => {
        imagePreview.value = ev.target.result;
    };
    reader.readAsDataURL(file);
};

const triggerUpload = () => fileInput.value.click();

const clearError = (field) => {
    delete errors[field];
};

const getDelta = (original, updated) => {
    const delta = {};
    original = JSON.parse(JSON.stringify(original));
    updated = JSON.parse(JSON.stringify(updated));
    Object.keys(updated).forEach((key) => {
        // Only add to delta if the value has actually changed

        // Checks if the current instance is an object and
        // dive deepr to compare
        if (
            updated[key] &&
            typeof updated[key] === "object" &&
            original[key] &&
            typeof original[key] === "object" &&
            !Array.isArray(updated[key])
        ) {
            const recursion = getDelta(original[key], updated[key]);
            if (Object.keys(recursion).length > 0) delta[key] = recursion;
        } else if (updated[key] !== original[key]) {
            delta[key] = updated[key];
        }
    });
    return delta;
};

const handleSave = async () => {
    saving.value = true;
    saveSuccess.value = false;
    saveError.value = "";
    uploadError.value = "";

    const userId = auth.userID;
    if (!userId) {
        saving.value = false;
        return;
    }

    console.log("[save] Starting save for user:", userId);
    console.log("[save] imageFile staged?", !!imageFile.value);

    try {
        const avatar = ref(null);
        if (imagePreview.value && imagePreview.value !== currentAvatar.value) {
            const ext = imageFile.value.name.split(".").pop().toLowerCase();
            const filePath = `${userId}/avatar.${ext}`;

            avatar.value =
                {
                    file: imageFile.value ? imagePreview.value : null,
                    path: filePath || null,
                } || null;
        }

        const rawPayload = Object.fromEntries(
            Object.entries({
                fname: form.fname?.trim(),
                lname: form.lname?.trim(),
                middle_initial: form.middle_initial?.trim() || null,
                birthdate: form.birthdate || null,
                gender_id: Number(form.gender_id) || null,
                avatar: avatar.value || null,
                address: {
                    region_code: form.regionCode,
                    province_code: form.provinceCode,
                    city_code: form.cityCode,
                    barangay_code: form.barangayCode,
                    address: addressInfo.value.fullAddress,
                },
            }).filter(
                ([_, value]) =>
                    value !== null && value !== "" && !Number.isNaN(value),
            ),
        );

        const profilePayload = getDelta(currentForm.value, rawPayload);
        if (Object.keys(profilePayload).length === 0) {
            console.log("No changes detected.");
            return;
        } else {
            const response = await auth.editProfile(profilePayload, "personal");
            console.log("Profile: ", response);
        }

        imageFile.value = null; // clear staged file after successful save
        saveSuccess.value = true;
        setTimeout(() => (saveSuccess.value = false), 3000);
    } catch (err) {
        console.error("[save] Error:", err);
        saveError.value = err.message || "Something went wrong.";
    } finally {
        fillCurrentForm(form);
        saving.value = false;
    }
};
</script>

<template>
    <div class="flex flex-col min-h-0">
    <div class="flex flex-col gap-4 overflow-x-hidden pb-6 pr-0.5 sm:pb-8 lg:pb-8">
            <div
                class="grid min-w-0 grid-cols-1 gap-3 overflow-x-hidden
                    sm:gap-4
                    xl:grid-cols-[minmax(260px,28%)_minmax(0,1fr)]"
            >
                <!-- Avatar Card -->
                <div
                    class="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-linear-to-b from-slate-50 to-white p-4 pt-5 shadow-sm"
                >
                    <div
                        class="relative overflow-hidden rounded-full border-4 border-emerald-100 bg-gray-200 shadow-[0_10px_30px_rgba(2,132,199,0.15)]
                               w-[clamp(6.5rem,22vw,14rem)] h-[clamp(6.5rem,22vw,14rem)]"
                    >
                        <img
                            v-if="imagePreview || currentAvatar"
                            :src="imagePreview || auth.avatarUrl"
                            alt="Profile"
                            class="w-full h-full object-cover"
                        />
                        <div
                            v-else
                            class="w-full h-full flex items-center justify-center text-gray-400"
                        >
                            <Icons
                                icon="profile"
                                class="h-[clamp(2.75rem,7vw,5rem)] w-[clamp(2.75rem,7vw,5rem)] text-gray-400"
                            />
                        </div>
                        <div
                            v-if="imageFile"
                            class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                        >
                            Unsaved
                        </div>
                    </div>

                    <input
                        ref="fileInput"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        class="hidden"
                        @change="handleImageUpload"
                    />
                    <button
                        class="w-full max-w-full rounded-full border border-emerald-200 bg-white px-5 py-1.5 text-sm font-semibold text-emerald-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md cursor-pointer sm:max-w-[210px]"
                        @click="triggerUpload"
                    >
                        Upload Image
                    </button>

                    <p v-if="uploadError" class="text-red-500 text-xs text-center">
                        {{ uploadError }}
                    </p>

                    <ul
                        class="w-full max-w-full list-inside list-disc space-y-1 text-[11px] leading-snug text-rose-500 sm:max-w-[240px]"
                    >
                        <li>Max file size is 2 MB</li>
                        <li>Only JPG, PNG, and WEBP files are accepted</li>
                        <li>Image must not violate the rules of the institution</li>
                    </ul>
                </div>

                <!-- Form Card -->
                <div
                    class="min-w-0 overflow-x-hidden rounded-2xl border border-slate-200 bg-white shadow-sm
                           p-3 sm:p-4 lg:p-4"
                >
                    <!-- Last Name, First Name, M.I. -->
                    <div
                        class="mb-3 grid grid-cols-1 gap-2.5
                               sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]
                               xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_84px]"
                    >
                        <div class="min-w-0">
                            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Last name
                            </label>
                            <input
                                v-model="form.lname"
                                type="text"
                                placeholder="Last name"
                                class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[13px] shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                        <div class="min-w-0">
                            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                First name
                            </label>
                            <input
                                v-model="form.fname"
                                type="text"
                                placeholder="First name"
                                class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[13px] shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                        <div class="min-w-0 sm:col-span-2 md:col-span-1">
                            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                M.I.
                            </label>
                            <input
                                v-model="form.middle_initial"
                                type="text"
                                maxlength="3"
                                placeholder="M.I."
                                class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[13px] shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100
                                       sm:w-24 md:w-full"
                            />
                        </div>
                    </div>

                    <!-- Address + Birthdate + Gender -->
                    <div class="flex flex-col gap-2.5">
                        <div class="flex-1">
                            <AddressEdit
                                :form="form"
                                :errors="errors"
                                :clear-error="clearError"
                                ref="addressInfo"
                            />
                        </div>

                        <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            <div class="min-w-0">
                                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Birthdate
                                </label>
                                <input
                                    v-model="form.birthdate"
                                    type="date"
                                    class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[13px] shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                                />
                            </div>
                            <div class="min-w-0">
                                <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Gender
                                </label>
                                <select
                                    v-model="form.gender_id"
                                    class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-[13px] text-gray-700 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer"
                                >
                                    <option :selected="!form.gender_id" disabled :value="null">
                                        Choose
                                    </option>
                                    <option v-for="g in gender" :key="g.id" :value="g.id">
                                        {{ g.type }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons (inside scroll area, with bottom breathing room) -->
            <div
                class="mt-4 flex w-full flex-col-reverse gap-2.5 sm:flex-row sm:justify-end mb-2"
            >
                <button
                    @click="auth.fetchUserData(auth.user)"
                    :disabled="saving"
                    class="w-full rounded-full border border-rose-300 bg-white px-6 py-2.5 text-sm font-semibold text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-sm cursor-pointer disabled:opacity-50 sm:w-auto sm:min-w-[120px]"
                >
                    Reset
                </button>
                <button
                    @click="handleSave"
                    :disabled="saving"
                    class="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(4,120,87,0.25)] transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-600 hover:shadow-[0_10px_24px_rgba(4,120,87,0.32)] cursor-pointer disabled:opacity-60 sm:w-auto sm:min-w-[120px]"
                >
                    <svg
                        v-if="saving"
                        class="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round" />
                    </svg>
                    {{ saving ? "Saving…" : "Save" }}
                </button>
            </div>
        </div>
    </div>
</template>