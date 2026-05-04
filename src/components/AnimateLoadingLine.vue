<script setup vapor>
const props = defineProps(["loading"]);
</script>
<template>
    <div class="left-0 h-1 w-full overflow-hidden z-50">
        <!-- The Moving Line -->
        <div
            :class="
                props.loading
                    ? 'h-full bg-green-700 w-1/2 animate-loading-line opacity-90'
                    : ''
            "
        />
    </div>
</template>
