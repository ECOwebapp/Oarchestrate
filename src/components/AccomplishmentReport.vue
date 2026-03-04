<script setup vapor>
defineProps(['show'])
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    @click.self="emit('close')">

    <!-- A4 page: 210mm × 297mm → at 96dpi scaled to fit screen -->
    <div class="relative bg-white overflow-hidden shadow-2xl"
      style="width: 794px; height: 1123px; max-height: 90vh; max-width: 95vw;">

      <!-- Close button -->
      <button
        class="absolute top-3 right-3 text-gray-400 text-3xl leading-none hover:text-gray-700 transition-colors cursor-pointer z-20"
        @click="emit('close')">×</button>

      <!-- CSU background watermark -->
      <img
        src="/images/csu.png"
        alt=""
        class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100%] opacity-10 pointer-events-none select-none"
      />

      <!-- Report content -->
      <div class="relative z-10 flex flex-col h-full px-14 py-12">

        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold tracking-wide text-gray-900">Accomplishment Report</h1>
        </div>

        <!-- Meta info -->
        <div class="flex justify-between text-sm text-gray-800 mb-2">
          <div class="space-y-1">
            <p><span class="font-semibold">Name:</span></p>
            <p><span class="font-semibold">Office:</span></p>
            <p><span class="font-semibold">Position:</span></p>
          </div>
          <div class="text-right">
            <p><span class="font-semibold">Date generated:</span></p>
          </div>
        </div>

        <hr class="border-gray-300 mb-6" />

        <!-- Tasks table placeholder -->
        <div class="flex-1">
          <!-- Table headers -->
          <table class="w-full text-xs text-gray-700 border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="border border-gray-300 px-3 py-2 text-left font-semibold">#</th>
                <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Task Name</th>
                <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Type</th>
                <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Date Given</th>
                <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Date Submitted</th>
                <th class="border border-gray-300 px-3 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              <!-- Empty rows as placeholder -->
              <tr v-for="n in 20" :key="n">
                <td class="border border-gray-200 px-3 py-2 text-gray-300">{{ n }}</td>
                <td class="border border-gray-200 px-3 py-2"></td>
                <td class="border border-gray-200 px-3 py-2"></td>
                <td class="border border-gray-200 px-3 py-2"></td>
                <td class="border border-gray-200 px-3 py-2"></td>
                <td class="border border-gray-200 px-3 py-2"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer signature area -->
        <div class="mt-8 flex justify-between text-xs text-gray-700">
          <div class="text-center w-48">
            <div class="border-t border-gray-400 pt-1 mt-10">Prepared by</div>
          </div>
          <div class="text-center w-48">
            <div class="border-t border-gray-400 pt-1 mt-10">Noted by</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
