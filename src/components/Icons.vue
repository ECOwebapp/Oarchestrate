<script setup vapor>
import {
    mdiAccount,
    mdiAccountMultiplePlus,
    mdiAccountCircleOutline,
    mdiAccountGroup,
    mdiAlertCircle,
    mdiCheck,
    mdiCheckCircle,
    mdiClose,
    mdiDraw,
    mdiFileDocumentOutline,
    mdiFormatListBulleted,
    mdiFullscreen,
    mdiInformation,
    mdiLink,
    mdiLoading,
    mdiLogout,
    mdiMagnify,
    mdiMenuDown,
    mdiMonitorDashboard,
    mdiPaperclip,
    mdiPlus,
    mdiPoll,
    mdiRefresh,
    mdiChevronRight,
    mdiAccountEdit,
    mdiContacts,
    mdiBriefcase,
    mdiDeleteOutline,
    mdiPencil,
    mdiNoteMultipleOutline,
    mdiCogOutline,
} from "@mdi/js";
import { computed } from "vue";

const props = defineProps(["icon", "iconClass"]);
const icons = {
    dashboard: mdiMonitorDashboard,
    projects: mdiFormatListBulleted,
    design: mdiDraw,
    insertions: mdiNoteMultipleOutline,
    organization: mdiAccountGroup,
    analytics: mdiPoll,
    profile: mdiAccountCircleOutline,
    logout: mdiLogout,
    add: mdiPlus,
    search: mdiMagnify,
    close: mdiClose,
    account: mdiAccountCircleOutline,
    file: mdiFileDocumentOutline,
    attachment: mdiPaperclip,
    fullscreen: mdiFullscreen,
    user: mdiAccount,
    link: mdiLink,
    check: mdiCheck,
    checkCircle: mdiCheckCircle,
    alert: mdiAlertCircle,
    info: mdiInformation,
    resubmit: mdiRefresh,
    down: mdiMenuDown,
    spin: mdiLoading,
    chevronRight: mdiChevronRight,
    personal: mdiAccountEdit,
    contact: mdiContacts,
    work: mdiBriefcase,
    deleteOutline: mdiDeleteOutline,
    edit: mdiPencil,
    manage_membership: mdiAccountMultiplePlus,
    setting: mdiCogOutline,
};

// Computed property that maps the nav array based on icon prop input
const path = computed(() => icons[props.icon] || null);
</script>

<template>
    <svg
        v-if="path"
        viewBox="0 0 24 24"
        :class="iconClass || 'w-6 h-6 fill-current'"
        fill="currentColor"
    >
        <path :d="path" />
    </svg>
</template>
