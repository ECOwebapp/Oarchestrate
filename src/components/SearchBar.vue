<script setup vapor>
import Icons from "./Icons.vue";

const search = defineModel();
const props = defineProps(["placeholder"]);
</script>

<template>
    <div
        class="flex items-center rounded-2xl bg-white border border-gray-300 px-3 focus-within:border-green-800 focus-within:ring-2 focus-within:ring-green-800/20 transition-all flex-1 min-w-0 h-11"
    >
        <Icons :icon="'search'" class="text-gray-400 shrink-0" />
        <input
            v-model="search"
            type="text"
            :placeholder="props.placeholder"
            class="ml-2 flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
    </div>
</template>
