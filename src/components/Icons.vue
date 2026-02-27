<script setup vapor>
import { computed } from 'vue'
import {
    mdiMonitorDashboard,
    mdiFormatListBulleted,
    mdiDraw,
    mdiAccountGroup,
    mdiPoll,
    mdiAccountCircleOutline,
    mdiLogout,
    mdiPlus,
    mdiMagnify,
    mdiClose,
    mdiFileDocumentOutline,
    mdiPaperclip,
    mdiFullscreen
} from '@mdi/js';

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
    fullscreen: mdiFullscreen
}

// Computed property that maps the nav array based on icon prop input
const path = computed(() => nav[props.icon] || null);
</script>

<template>
    <svg v-if="path" viewBox="0 0 24 24" class="w-6 h-6 fill-current">
        <path :d="path" />
    </svg>
</template>