<script setup vapor>
import { ref, onMounted, onUnmounted } from "vue";

const isMobile = ref(window.innerWidth < 1024);
const checkViewport = () => (isMobile.value = window.innerWidth < 1024);

onMounted(() => window.addEventListener("resize", checkViewport));
onUnmounted(() => window.removeEventListener("resize", checkViewport));
</script>

<template>
    <div
        class="w-full rounded-xl gap-5 lg:gap-0 bg-white p-4 shadow-sm sm:p-5 lg:h-full lg:w-64 flex lg:flex-col flex-row lg:overflow-hidden"
    >
        <div class="lg:shrink-0">
            <h2
                class="text-base md:text-center uppercase font-black text-gray-900 leading-snug mb-3"
            >
                Accomplishment Report Generator
            </h2>
            <p class="text-sm text-gray-600 leading-relaxed text-justify">
                The Accomplishment Report is a track record that contains all
                tasks you performed. This is the proof of your activity within
                the organisation.
            </p>

            <div v-if="isMobile">
                <slot />
            </div>
        </div>

        <div class="lg:flex-1 lg:mt-5 overflow-y-auto lg:overflow-hidden">
            <p class="text-sm font-semibold text-gray-700 mb-1">Note:</p>
            <ul
                class="text-xs sm:text-sm text-justify text-gray-600 space-y-2 list-disc list-outside pl-4"
            >
                <ul class="list-disc list-outside pl-4">
                    <li><b>Approved:</b> approved by Director</li>
                    <li><b>Submitted:</b> waiting for Director approval</li>
                    <li><b>Pending:</b> not yet submitted</li>
                    <li><b>Revision:</b> returned for changes</li>
                </ul>
                <li>
                    Individual Report shows only your own approved tasks.
                    Directors should use Unit Report to review Submitted,
                    Pending, and Revision items across units.
                </li>
                <li>
                    It doesn't include the signature of your Division Chief.
                </li>
            </ul>
        </div>
        <div v-if="!isMobile">
            <slot />
        </div>
    </div>
</template>
