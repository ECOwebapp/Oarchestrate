<template>
  <Teleport to="body">

    <!-- ─── Loading fullscreen overlay ─── -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-all duration-500"
      leave-to-class="opacity-0 scale-105"
    >
      <div
        v-if="isLoading"
        class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#061a09] overflow-hidden"
      >
        <!-- Dot grid texture -->
        <div
          class="absolute inset-0 pointer-events-none opacity-[0.06]"
          style="background-image: radial-gradient(rgba(0,200,0,0.8) 1px, transparent 1px); background-size: 28px 28px;"
        ></div>

        <!-- Centre glow -->
        <div
          class="absolute w-[600px] h-[600px] rounded-full pointer-events-none animate-pulse"
          style="background: radial-gradient(ellipse, rgba(22,163,74,0.22) 0%, transparent 70%);
                 top: 50%; left: 50%; transform: translate(-50%, -50%);"
        ></div>

        <!-- Logo video / SVG fallback -->
        <div
          class="relative z-10 flex items-center justify-center mb-10"
          style="width: clamp(160px, 24vw, 260px); aspect-ratio: 1;"
        >
          <video
            v-if="!videoError"
            ref="videoRef"
            class="w-full h-full object-contain rounded-[20px]"
            style="filter: drop-shadow(0 0 48px rgba(22,163,74,0.42));"
            autoplay loop muted playsinline
            src="/images/CSU-LOGO-ANIMATION.mp4"
            @error="videoError = true"
          ></video>
          <div v-else class="flex items-center justify-center w-full h-full animate-pulse">
            <svg viewBox="0 0 24 24" fill="white" width="72" height="72">
              <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z"/>
            </svg>
          </div>
        </div>

        <!-- Progress bar -->
        <div
          class="z-10 flex flex-col items-center gap-3 mb-7"
          style="width: clamp(200px, 38vw, 340px);"
        >
          <div class="w-full h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
            <div
              class="h-full rounded-full transition-[width] duration-300 ease-out lm-shimmer"
              style="background: linear-gradient(90deg, #16a34a, #4ade80, #facc15); background-size: 200% 100%;"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
          <span class="font-body text-[11px] font-bold tracking-[0.16em] uppercase text-white/30">
            {{ progressLabel }}
          </span>
        </div>

        <!-- Brand name -->
        <div class="z-10 flex flex-col items-center gap-1">
          <span
            class="font-display font-extrabold text-white/90 tracking-tight"
            style="font-size: clamp(14px, 2vw, 19px);"
          >CSU Oarchestrate</span>
          <span class="font-body text-[10.5px] font-semibold text-white/20 tracking-wide text-center">
            Engineering &amp; Construction Office · Task Management System
          </span>
        </div>
      </div>
    </Transition>

    <!-- ─── Timeout / error modal ─── -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showError"
        class="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-green-950/80 backdrop-blur-xl"
      >
        <Transition
          appear
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95 translate-y-3"
        >
          <div
            v-if="showError"
            class="relative bg-white rounded-[28px] px-9 py-10 max-w-md w-full shadow-2xl
                   flex flex-col items-center text-center overflow-hidden"
          >
            <!-- Gradient accent bar -->
            <div
              class="absolute top-0 left-0 right-0 h-[3px] rounded-t-[28px]"
              style="background: linear-gradient(90deg, #16a34a, #facc15, #ea580c);"
            ></div>

            <!-- Warning icon -->
            <div
              class="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5
                     text-amber-600 border border-amber-200 lm-icon-pulse"
              style="background: linear-gradient(135deg, #fff7ed, #fef9c3);"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="28" height="28">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              </svg>
            </div>

            <h2 class="font-display font-black text-[22px] text-green-950 tracking-tight mb-2">
              Connection Problem
            </h2>
            <p class="font-body text-[13.5px] text-stone-500 leading-relaxed mb-4 max-w-xs">
              The system is taking longer than expected to load.
              This may be due to a slow or lost network connection.
            </p>

            <!-- Error detail chip -->
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 mb-7">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 lm-blink"></span>
              <span class="font-body text-[11px] font-bold text-green-700">{{ errorMessage }}</span>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-2.5 w-full mb-4">
              <button
                @click="onRefresh"
                class="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl
                       font-body text-[13px] font-bold text-white
                       transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-300/40"
                style="background: linear-gradient(135deg, #15803d, #16a34a);"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="15" height="15">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 .49-3.77"/>
                </svg>
                Refresh Page
              </button>
              <button
                @click="onRetry"
                class="px-5 py-3 rounded-2xl font-body text-[13px] font-bold text-stone-600
                       bg-white border border-stone-200
                       transition-all duration-200 hover:bg-stone-50 hover:border-stone-300 hover:-translate-y-0.5"
              >
                Try Again
              </button>
            </div>

            <p class="font-body text-[11px] text-stone-400">
              If the problem persists, please contact your system administrator.
            </p>
          </div>
        </Transition>
      </div>
    </Transition>

  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

// ── Internal state ─────────────────────────────────────────────
const isLoading    = ref(true)
const showError    = ref(false)
const videoError   = ref(false)
const progress     = ref(0)
const errorMessage = ref('Request timed out after 15 seconds.')
const videoRef     = ref(null)

let timeoutHandle  = null
let progressHandle = null

// ── Progress label ──────────────────────────────────────────────
const progressLabel = computed(() => {
  if (progress.value < 30) return 'Initializing…'
  if (progress.value < 60) return 'Loading resources…'
  if (progress.value < 85) return 'Fetching data…'
  if (progress.value < 99) return 'Almost ready…'
  return 'Done!'
})

// ── Helpers ─────────────────────────────────────────────────────
function animateProgress(target, durationMs) {
  clearInterval(progressHandle)
  const start = progress.value
  const steps = 60
  const delta = (target - start) / steps
  let cur = 0
  progressHandle = setInterval(() => {
    cur++
    progress.value = Math.min(target, start + delta * cur)
    if (cur >= steps) clearInterval(progressHandle)
  }, durationMs / steps)
}

function finish() {
  animateProgress(100, 400)
  setTimeout(() => { isLoading.value = false }, 600)
}

function startLoad() {
  progress.value  = 0
  showError.value = false
  isLoading.value = true
  animateProgress(75, 2000)

  timeoutHandle = setTimeout(() => {
    errorMessage.value = 'Request timed out after 15 seconds.'
    showError.value    = true
  }, 15_000)

  Promise.all([document.fonts.ready, new Promise(r => setTimeout(r, 2400))])
    .then(() => { clearTimeout(timeoutHandle); finish() })
    .catch(err => {
      clearTimeout(timeoutHandle)
      errorMessage.value = err?.message ?? 'An unexpected error occurred.'
      showError.value    = true
    })
}

// ── Button handlers ─────────────────────────────────────────────
function onRefresh() { window.location.reload() }
function onRetry()   { startLoad() }

// ── Lifecycle ───────────────────────────────────────────────────
onMounted(startLoad)
onUnmounted(() => {
  clearTimeout(timeoutHandle)
  clearInterval(progressHandle)
})
</script>

<style scoped>
/* Progress bar shimmer */
@keyframes lm-shimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
.lm-shimmer { animation: lm-shimmer 2s linear infinite; }

/* Error icon pulse ring */
@keyframes lm-icon-pulse {
  0%, 100% { box-shadow: 0 0 0 0   rgba(217, 119, 6, 0.2); }
  50%       { box-shadow: 0 0 0 10px rgba(217, 119, 6, 0);   }
}
.lm-icon-pulse { animation: lm-icon-pulse 2s ease-in-out infinite; }

/* Red dot blink */
@keyframes lm-blink {
  0%, 100% { opacity: 1;   }
  50%       { opacity: 0.2; }
}
.lm-blink { animation: lm-blink 1.4s ease-in-out infinite; }
</style>