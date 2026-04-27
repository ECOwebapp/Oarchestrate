<script setup vapor>
import { useAuthStore } from "@/stores/useAuthStore";
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { useCounterStore } from "../stores/counter";
import NavInner from "./NavInner.vue";
import { storeToRefs } from "pinia";

const route = useRoute();
const authStore = useAuthStore();
const counterStore = useCounterStore();

const expanded = ref(false);
const { mobileOpen } = storeToRefs(counterStore);
const closeDrawer = () => {
    mobileOpen.value = false;
};

const formattedPositions = computed(() => {
    return (
        authStore.positions.map((p) => p.pos_name).join(" / ") ||
        "No Position Assigned"
    );
});

const formattedUnits = computed(() => {
    // 1. Get an array of all unit names
    const unitNames = authStore.positions.map((p) => p.unit_name);

    // 2. Create a Set to remove duplicates
    const uniqueUnits = [...new Set(unitNames)];

    // 3. Join them (if only one unique unit exists, no '/' will be added)
    return uniqueUnits.join(" / ") || "No Unit Assigned";
});

const navNames = [
    "Dashboard",
    "Projects",
    "Insertions",
    "Design",
    "Organization",
    "Analytics",
    "Profile",
];

const getPath = (name) => `/${name.toLowerCase()}/`;
const isActive = (name) => {
    const children = ["Tasks", "Subtasks", "Projects"].includes(route.name);
    if (name === "Projects") return children;
    return route.name === name;
};
const version = "0.1 alpha";
</script>

<template>
    <div class="h-full">
        <!-- ══ MOBILE: Backdrop ══ -->
        <Transition name="overlay">
            <div
                v-if="mobileOpen"
                class="xl:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                @click="closeDrawer"
            />
        </Transition>

        <!-- ══ MOBILE: Drawer ══ -->
        <Transition name="drawer">
            <nav
                v-if="mobileOpen"
                class="xl:hidden fixed left-0 top-0 bottom-0 z-50 w-68 flex flex-col drop-shadow-2xl bg-[url('/images/csu-background.png')] bg-center bg-cover no-repeat"
            >
                <NavInner
                    :nav-names="navNames"
                    :get-path="getPath"
                    :is-active="isActive"
                    :auth-store="authStore"
                    :expanded="true"
                    :version="version"
                    @logout="async () => await authStore.logout()"
                    :formatted-positions="formattedPositions"
                    :formatted-units="formattedUnits"
                    @navigate="closeDrawer"
                />
            </nav>
        </Transition>

        <!-- ══ DESKTOP: Collapsible sidebar ══ -->
        <nav
            class="hidden xl:flex flex-col h-full drop-shadow-xl transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] overflow-hidden bg-[url('/images/csu.png')] bg-center bg-cover no-repeat"
            :class="expanded ? 'w-60' : 'w-[68px]'"
            @mouseenter="expanded = true"
            @mouseleave="expanded = false"
        >
            <NavInner
                :nav-names="navNames"
                :get-path="getPath"
                :is-active="isActive"
                :auth-store="authStore"
                :expanded="expanded"
                :version="version"
                :formatted-positions="formattedPositions"
                :formatted-units="formattedUnits"
                @logout="async () => await authStore.logout()"
            />
        </nav>
    </div>
</template>

<style scoped>
nav.hidden {
    box-shadow: 4px 0 28px rgba(0, 0, 0, 0.3);
}

.drawer-enter-active {
    animation: drawerIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.drawer-leave-active {
    animation: drawerOut 0.22s ease both;
}

@keyframes drawerIn {
    from {
        transform: translateX(-100%);
    }

    to {
        transform: translateX(0);
    }
}

@keyframes drawerOut {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(-100%);
    }
}

.overlay-enter-active {
    animation: fadeIn 0.2s ease both;
}

.overlay-leave-active {
    animation: fadeOut 0.2s ease both;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes navIn {
    from {
        opacity: 0;
        transform: translateX(-10px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
