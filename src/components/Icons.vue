<script setup>
import {
    mdiAccount,
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
    mdiRefresh
} from '@mdi/js';
import { computed } from 'vue';

const props = defineProps(['icon'])
const nav = {
    dashboard: mdiMonitorDashboard,
    tasks: mdiFormatListBulleted,
    design: mdiDraw,
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
    refresh: mdiRefresh,
    resubmit: mdiRefresh,
    down: mdiMenuDown,
    spin: mdiLoading
}

// Computed property that maps the nav array based on icon prop input
const path = computed(() => nav[props.icon] || null);
</script>

<template>
    <svg v-if="path" viewBox="0 0 24 24" class="w-6 h-6 fill-current">
        <path :d="path" />
    </svg>
</template>