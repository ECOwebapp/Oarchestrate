<script setup vapor>
const props = defineProps(["hierarchyItems"]);
</script>

<template>
    <nav
        class="px-5 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-gray-200 bg-white"
        aria-label="Hierarchy"
    >
        <ol class="flex items-center flex-wrap gap-1.5">
            <template
                v-for="(item, index) in props.hierarchyItems"
                :key="`${item.label}-${index}`"
            >
                <li class="flex items-center gap-1.5 min-w-0">
                    <router-link
                        v-if="item.to && !item.current"
                        :to="item.to"
                        :title="item.title || item.label"
                        class="text-sm font-semibold text-gray-900 hover:text-gray-700 hover:bg-gray-100 px-2.5 py-1 rounded-md transition-colors truncate max-w-[180px] sm:max-w-[360px]"
                    >
                        {{ item.label }}
                    </router-link>
                    <span
                        v-else
                        :title="item.title || item.label"
                        class="text-sm px-2.5 py-1 truncate max-w-45 sm:max-w-90"
                        :class="
                            ([
                                item.current
                                    ? 'font-medium text-gray-600'
                                    : 'font-medium text-gray-700',
                            ],
                            item.label.includes('PPA') ? 'font-semibold' : '')
                        "
                    >
                        {{ item.label }}
                    </span>

                    <svg
                        v-if="index < props.hierarchyItems.length - 1"
                        class="w-3.5 h-3.5 text-gray-400 shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
                        />
                    </svg>
                </li>
            </template>
        </ol>
    </nav>
</template>
