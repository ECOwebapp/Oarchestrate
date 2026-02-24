<script setup vapor>
import { computed } from 'vue'
import SvgIcon from '@jamescoyle/vue-icon';
import {
    mdiMonitorDashboard,
    mdiFormatListBulleted,
    mdiDraw,
    mdiAccountGroup,
    mdiPoll,
    mdiAccountCircleOutline,
    mdiLogout
} from '@mdi/js';

const { icon } = defineProps(['icon'])
const nav = {
    dashboard: mdiMonitorDashboard,
    tasks: mdiFormatListBulleted,
    design: mdiDraw,
    organization: mdiAccountGroup,
    analytics: mdiPoll,
    profile: mdiAccountCircleOutline,
    logout: mdiLogout
}

// Computed property that maps the nav array based on icon prop input
const path = computed(() => nav[icon] || null);
</script>

<template>
    <svg-icon type="mdi" :path="path" />
</template>