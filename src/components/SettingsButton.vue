<script setup vapor>
import Icons from "./Icons.vue";
import { ref } from "vue";

const filterModal = ref(false);
</script>
<template>
    <div>
        <button
            @click.prevent="filterModal = !filterModal"
            class="flex items-center gap-2 font-bold h-11 px-4 rounded-2xl transition-all text-sm outline-2 outline-green-950 bg-white text-green-950 hover:bg-green-50 hover:cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <Icons :icon="'setting'" />
            <span class="hidden sm:block">Settings</span>
        </button>

        <Teleport to="body">
            <Transition name="modal">
                <div
                    v-if="filterModal"
                    class="fixed inset-0 z-150 flex items-center justify-center bg-black/50 px-4"
                    @click.self="filterModal = !filterModal"
                >
                    <div
                        class="bg-white w-full max-w-md max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                    >
                        <!-- Header -->
                        <div
                            class="flex items-center justify-between px-7 py-5 border-b border-gray-300"
                        >
                            <h2 class="text-xl font-bold text-gray-900">
                                Filters
                            </h2>

                            <div class="flex items-center gap-2">
                                <button
                                    @click="filterModal = !filterModal"
                                    class="hover:cursor-pointer text-gray-400 hover:text-gray-700 text-2xl leading-none"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <!-- Body -->
                        <div
                            class="flex items-center gap-5 overflow-y-auto flex-1 px-7 py-5"
                        >
                            <div class="flex flex-col gap-10">
                                <p>Filter:</p>
                                <p>Sort:</p>
                                <slot name="editName"></slot>
                            </div>

                            <div class="flex flex-col gap-6">
                                <slot name="filter"></slot>
                                <slot name="sort"></slot>
                                <slot name="edit"></slot>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>
