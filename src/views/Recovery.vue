<script setup vapor>
import { reactive, ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
    email: "",
    token: null,
    password: "",
    confirmPassword: "",
});

const loading = ref(false);
const errors = reactive({});
const showPending = ref(false);
const pendingReason = ref("");
const showPassword = ref(false);
const showConfirm = ref(false);
const steps = (() => {
    const currentStep = ref(1);
    return {
        isCurrent: (step) => step === currentStep.value,
        nextStep: () => currentStep.value++,
    };
})();

const clearError = (field) => {
    delete errors[field];
};

const validate = (() => {
    let e = {};
    const email = () => {
        if (!form.email.trim()) e.email = "Email is required";
        else if (!/^[a-zA-Z0-9._%+-]+@carsu\.edu\.ph$/.test(form.email))
            e.email = "Only accepts CarSU email";
        Object.keys(errors).forEach((k) => delete errors[k]);
        Object.assign(errors, e);
        return Object.keys(e).length === 0;
    };

    const password = () => {
        if (!form.password) e.password = "Required";
        else if (form.password.length < 8) e.password = "Min. 8 characters";
        else if (!/[A-Z]/.test(form.password))
            e.password = "Must include an uppercase letter";
        else if (!/[0-9]/.test(form.password))
            e.password = "Must include a number";
        else if (form.password !== form.confirmPassword)
            e.confirmPassword = "Passwords do not match";
        Object.keys(errors).forEach((k) => delete errors[k]);
        Object.assign(errors, e);
        return Object.keys(e).length === 0;
    };

    return { email, password };
})();

const passwordStrength = computed(() => {
    const p = form.password;
    if (!p) return { label: "", pct: 0, color: "#e5e7eb" };
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 2) return { label: "Weak", pct: 33, color: "#ef4444" };
    if (s <= 3) return { label: "Fair", pct: 66, color: "#ca8a04" };
    return { label: "Strong", pct: 100, color: "#15803d" };
});

const requestOtp = async () => {
    try {
        loading.value = true;
        if (!form.token && validate.email()) {
            // Reconstruct internal email from ID number (same formula used at registration)
            const { status, message } = await auth.forgotPass.requestOTP(
                form.email,
            );

            pendingReason.value = message || "";
            if (status === 200) steps.nextStep();
            showPending.value = true;
            return;
        } else if (validate.password()) {
            const { status, message } = await auth.forgotPass.verifyOTP(form);
            pendingReason.value = message || "";
            showPending.value = true;
            if (status === 200) modal.success();
        }
    } catch (e) {
        console.error("Login error:", e);
        errors.general = "Something went wrong. Please try again.";
    } finally {
        loading.value = false;
    }
};

const modal = (() => {
    const isSuccess = ref(false);
    return {
        successStat: isSuccess.value,
        success: () => (isSuccess.value = true),
        handleClose: () => {
            if (isSuccess.value) {
                router.replace({ name: "Login" });
            } else {
                // Assuming showPending is a ref defined elsewhere in your setup
                showPending.value = false;
            }
        },
    };
})();
</script>

<template>
    <div
        class="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
    >
        <!-- Background -->
        <div
            class="absolute inset-0 bg-cover bg-center bg-[url('/images/csu_admin_building.png')]"
        ></div>
        <div class="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

        <!-- Login card -->
        <div
            class="relative z-10 w-full max-w-md mx-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl px-10 py-10"
        >
            <!-- Logo -->
            <div class="flex justify-center mb-5">
                <img
                    src="../../public/images/csu_seal.png"
                    class="w-32 h-32 object-contain drop-shadow"
                />
            </div>

            <!-- Title -->
            <h1
                class="text-center text-3xl font-bold text-gray-800 tracking-wide mb-2"
                style="
                    font-family: &quot;Georgia&quot;, serif;
                    letter-spacing: 0.04em;
                "
            >
                Oarchestrate
            </h1>
            <p
                class="text-center text-xs text-gray-400 tracking-widest uppercase"
            >
                Caraga State University · ECO
            </p>
            <h2 class="text-md text-center font-bold text-gray-800 mt-8 mb-4">
                Reset Password
            </h2>

            <!-- General error -->
            <div
                v-if="errors.general"
                class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3"
            >
                {{ errors.general }}
            </div>

            <!-- Form -->
            <div class="space-y-4">
                <!-- ID Number -->
                <div v-show="steps.isCurrent(1)">
                    <input
                        v-model="form.email"
                        type="email"
                        placeholder="CarSU email"
                        @input="clearError('email')"
                        @keydown.enter="requestOtp"
                        :class="[
                            'w-full px-4 py-3 rounded-lg border text-gray-700 bg-white transition placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent',
                            errors.email ? 'border-red-400' : 'border-gray-300',
                        ]"
                    />
                    <p
                        :class="[
                            'text-xs mt-1',
                            errors.mail ? 'text-red-500' : 'text-gray-600',
                        ]"
                    >
                        {{
                            errors.email ||
                            "Enter your carsu email to send the One-Time Pin (OTP)."
                        }}
                    </p>
                </div>

                <div v-show="steps.isCurrent(2)" class="flex flex-col gap-2">
                    <div>
                        <input
                            v-model="form.token"
                            type="text"
                            placeholder="Enter the token"
                            @input="clearError('token')"
                            @keydown.enter="$refs.newPass.focus()"
                            :class="[
                                'w-full px-4 py-3 rounded-lg border text-gray-700 bg-white transition placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent',
                                errors.token
                                    ? 'border-red-400'
                                    : 'border-gray-300',
                            ]"
                        />
                        <p
                            v-if="errors.token"
                            class="text-red-500 text-xs mt-1"
                        >
                            {{ errors.token }}
                        </p>
                    </div>
                    <div class="relative">
                        <input
                            v-model="form.password"
                            ref="newPass"
                            placeholder="Password"
                            :type="showPassword ? 'text' : 'password'"
                            @keydown.enter="$refs.confirmPass.focus()"
                            @input="clearError('password')"
                            :class="[
                                'w-full px-4 py-3 pr-11 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent',
                                errors.password
                                    ? 'border-red-400'
                                    : 'border-gray-300',
                            ]"
                        />
                        <button
                            @click="showPassword = !showPassword"
                            type="button"
                            class="hover:cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                            <svg
                                v-if="!showPassword"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                class="w-5 h-5"
                            >
                                <path
                                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <svg
                                v-else
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="1.8"
                                class="w-5 h-5"
                            >
                                <path
                                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                                />
                                <path
                                    d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                                />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        </button>
                    </div>
                    <div>
                        <div
                            v-if="form.password"
                            class="hover:cursor-pointer flex items-center gap-2 mt-1.5"
                        >
                            <div
                                class="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden"
                            >
                                <div
                                    class="h-full rounded-full transition-all duration-300"
                                    :style="{
                                        width: passwordStrength.pct + '%',
                                        background: passwordStrength.color,
                                    }"
                                ></div>
                            </div>
                            <span
                                class="text-xs font-semibold"
                                :style="{ color: passwordStrength.color }"
                            >
                                {{ passwordStrength.label }}
                            </span>
                        </div>
                        <p
                            v-if="errors.password"
                            class="text-red-500 text-xs mt-1"
                        >
                            {{ errors.password }}
                        </p>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                        <div class="relative">
                            <input
                                v-model="form.confirmPassword"
                                placeholder="Confirm Password"
                                ref="confirmPass"
                                :type="showConfirm ? 'text' : 'password'"
                                :class="[
                                    'w-full px-4 py-3 pr-11 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent',
                                    errors.confirmPassword
                                        ? 'border-red-400'
                                        : 'border-gray-300',
                                ]"
                                @input="clearError('confirmPassword')"
                            />
                            <button
                                @click="showConfirm = !showConfirm"
                                type="button"
                                class="hover:cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                <svg
                                    v-if="!showConfirm"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    class="w-5 h-5"
                                >
                                    <path
                                        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                    />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                <svg
                                    v-else
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    class="w-5 h-5"
                                >
                                    <path
                                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                                    />
                                    <path
                                        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                                    />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            </button>
                        </div>
                        <p
                            v-if="errors.confirmPassword"
                            class="text-red-500 text-xs mt-1"
                        >
                            {{ errors.confirmPassword }}
                        </p>
                    </div>
                </div>

                <!-- Create account -->
                <p class="text-center text-sm text-gray-500">
                    Don't have an account yet?
                    <RouterLink
                        to="/register"
                        class="text-green-800 font-semibold hover:underline"
                    >
                        Create account.
                    </RouterLink>
                </p>

                <!-- Sign In button -->
                <button
                    type="button"
                    @click="requestOtp"
                    :disabled="loading"
                    class="w-full hover:cursor-pointer py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
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
                    <span>{{ loading ? "Loading…" : "Next" }}</span>
                </button>
            </div>
        </div>

        <!-- ── Pending Approval Modal ── -->
        <Transition name="modal">
            <div
                v-if="showPending"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            >
                <div
                    class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
                >
                    <!-- Animated clock icon -->
                    <div class="w-20 h-20 mx-auto mb-5">
                        <svg
                            viewBox="0 0 80 80"
                            fill="none"
                            class="w-full h-full"
                        >
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                stroke="#15803d"
                                stroke-width="3"
                                stroke-dasharray="226"
                                stroke-dashoffset="226"
                                style="animation: drawCircle 0.6s ease forwards"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                fill="#f0fdf4"
                                style="animation: fadeFill 0.3s ease 0.3s both"
                            />
                            <path
                                d="M40 24v18l10 6"
                                stroke="#15803d"
                                stroke-width="3.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-dasharray="40"
                                stroke-dashoffset="40"
                                style="
                                    animation: drawCheck 0.4s ease 0.55s
                                        forwards;
                                "
                            />
                        </svg>
                    </div>

                    <h2
                        class="text-2xl font-bold text-gray-800 mb-2"
                        style="font-family: &quot;Georgia&quot;, serif"
                    >
                        Reset Password
                    </h2>

                    <!-- Info box -->
                    <div
                        class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left text-sm space-y-2"
                    >
                        {{ pendingReason }}
                    </div>

                    <button
                        @click="modal.handleClose"
                        class="hover:cursor-pointer w-full py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
input::placeholder {
    color: #9ca3af;
}

@keyframes drawCircle {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes drawCheck {
    to {
        stroke-dashoffset: 0;
    }
}

@keyframes fadeFill {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.modal-enter-active {
    animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-leave-active {
    animation: modalOut 0.2s ease;
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: scale(0.93);
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
        transform: scale(0.95);
    }
}
</style>
