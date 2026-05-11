<script setup vapor>
import { computed } from "vue";
import SettingsButton from "../SettingsButton.vue";
import SearchBar from "../SearchBar.vue";
import Icons from "../Icons.vue";

const search = defineModel("search");
const filter = defineModel("filter");
const sortBy = defineModel("sort");
const edit = defineModel("edit");
const props = defineProps([
    "isMobile",
    "selectionMode",
    "canDelete",
    "isDirector",
    "isDisabled",
    "isDeletable",
    "selectedCount",
    "selected",
    "optionList",
    "placeholderText",
    "visibleEditToggle",
]);
const emit = defineEmits([
    "add",
    "toggle-single",
    "toggle-select",
    "toggle-all",
    "delete-modal",
    "reload",
]);

console.log(props.visibleEditToggle);

const allVisibleSelected = computed(() => props.selected?.allVisibleSelected);
const someSelected = computed(() => props.selected?.someSelected);
const filterOpts = computed(() => props.optionList?.filterOpts);
const sortOpts = computed(() => props.optionList.sortOpts);
</script>

<template>
    <div>
        <div
            v-if="props.isMobile"
            class="flex flex-wrap items-center gap-3 px-6 pt-4 shrink-0"
        >
            <SearchBar
                v-model="search"
                :placeholder="`Search ${props.placeholderText}s...`"
            />
        </div>

        <div
            class="flex flex-wrap sm:justify-start justify-end items-center gap-3 px-4 sm:px-6 lg:px-10 py-4 shrink-0"
        >
            <!-- Add Task -->
            <button
                v-if="
                    (!props.selectionMode && props.isDirector) ||
                    props.placeholderText === 'Insertion'
                "
                @click="emit('add')"
                class="flex items-center gap-2 bg-green-950 text-white font-bold h-11 px-5 rounded-2xl hover:bg-green-800 active:scale-95 transition-all text-sm shrink-0 hover:cursor-pointer"
            >
                <Icons :icon="'add'" />
                <span class="hidden sm:inline"
                    >Add {{ props.placeholderText }}</span
                >
            </button>

            <!-- Select toggle — Director & Unit Head only -->
            <button
                v-if="props.canDelete"
                @click="emit('toggle-select')"
                class="flex items-center gap-2 font-bold h-11 px-5 rounded-2xl transition-all text-sm shrink-0 hover:cursor-pointer"
                :class="
                    props.selectionMode
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'outline-2 outline-green-950 text-green-950 bg-white hover:bg-green-50'
                "
            >
                <svg
                    v-if="!props.selectionMode"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    />
                </svg>
                <svg
                    v-else
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    />
                </svg>
                <span class="hidden sm:inline">{{
                    props.selectionMode ? "Cancel" : "Select"
                }}</span>
            </button>

            <!-- Select All — only in selection mode -->
            <button
                v-if="props.selectionMode"
                @click="emit('toggle-all')"
                :disabled="props.isDisabled"
                class="flex items-center gap-2 font-bold h-11 px-4 rounded-2xl transition-all text-sm outline-2 outline-green-950 bg-white text-green-950 hover:bg-green-50 hover:cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <div
                    class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                    :class="
                        allVisibleSelected
                            ? 'bg-green-700 border-green-700'
                            : someSelected
                              ? 'bg-green-200 border-green-700'
                              : 'border-gray-400'
                    "
                >
                    <svg
                        v-if="allVisibleSelected"
                        class="w-2.5 h-2.5 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                        />
                    </svg>
                    <svg
                        v-else-if="someSelected"
                        class="w-2.5 h-2.5 text-green-800"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M19 13H5v-2h14v2z" />
                    </svg>
                </div>
                <span v-if="props.selectedCount < 1" class="hidden sm:inline"
                    >Select All</span
                >

                <div v-else class="flex items-center gap-1.5">
                    <span>{{ props.selectedCount }}</span>
                    <span class="hidden sm:inline">selected</span>
                </div>
            </button>

            <!-- Delete button — visible only when ≥1 deletable task is selected -->
            <Transition name="fade-slide">
                <button
                    v-if="props.isDeletable"
                    @click="emit('delete-modal')"
                    class="flex items-center gap-2 h-11 px-5 rounded-2xl font-bold text-sm transition-all bg-red-700 text-white hover:bg-red-800 hover:cursor-pointer active:scale-95 shrink-0"
                >
                    <svg
                        class="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                        />
                    </svg>
                    <span class="hidden sm:inline">Delete</span>
                </button>
            </Transition>

            <!-- Search -->
            <SearchBar
                v-if="!props.isMobile"
                v-model="search"
                :placeholder="`Search ${props.placeholderText}s...`"
            />

            <SettingsButton>
                <template v-slot:filter>
                    <select
                        v-model="filter"
                        class="h-11 px-4 rounded-xl border border-gray-300 font-bold text-sm text-gray-700 focus:outline-none focus:border-green-800 bg-white shrink-0"
                    >
                        <option v-for="o in filterOpts" :key="o" :value="o">
                            {{ o }}
                        </option>
                    </select>
                </template>

                <template v-slot:sort>
                    <!-- Sort -->
                    <select
                        v-model="sortBy"
                        class="h-11 px-4 rounded-xl border border-gray-300 font-bold text-sm text-gray-700 focus:outline-none focus:border-green-800 bg-white shrink-0"
                    >
                        <option v-for="o in sortOpts" :key="o" :value="o">
                            {{ o }}
                        </option>
                    </select>
                </template>
                <template v-if="props.visibleEditToggle" v-slot:editName
                    ><p>Edit Mode:</p></template
                >
                <template v-if="props.visibleEditToggle" v-slot:edit
                    ><label
                        class="relative inline-flex items-center cursor-pointer"
                    >
                        <input
                            v-model="edit"
                            type="checkbox"
                            class="sr-only peer"
                        />
                        <div
                            class="w-14 h-7 bg-green-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6.5 after:transition-all peer-checked:bg-red-600"
                        />
                    </label>
                </template>
            </SettingsButton>

            <button
                @click="emit('reload')"
                class="flex items-center gap-2 bg-green-950 text-white font-bold h-11 px-5 rounded-2xl hover:bg-green-800 active:scale-95 transition-all text-sm shrink-0 hover:cursor-pointer"
            >
                <Icons :icon="'resubmit'" />
                <span class="hidden sm:inline">Refresh</span>
            </button>

            <!-- Count -->
            <!-- <span class="text-xs text-gray-500 shrink-0 hidden sm:block">
                {{ filtered.length }} PPA{{
                    filtered.length !== 1 ? "s" : ""
                }}
            </span> -->
        </div>
    </div>
</template>
