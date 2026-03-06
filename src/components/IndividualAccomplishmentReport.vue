<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  month: { default: () => new Date().getMonth() + 1 },
  year:  { default: () => new Date().getFullYear() },
})
const emit = defineEmits(['close'])

const sampleRows = [
  { date: 'Feb 16, 2026', ppa: 'Green Campus Development Plan', daed: 'Finalization of Highlights (1st Draft)', no: 1, output: 'Review of ECOSMART writeshop outputs', remarks: 'Completed', link: 'https://drive.google.com' },
  { date: 'Feb 17, 2026', ppa: 'Green Campus Development Plan', daed: 'Finalization of Highlights (1st Draft)', no: 2, output: 'Consolidation of writeshop outputs', remarks: 'Approved', link: 'https://drive.google.com' },
  { date: 'Feb 18, 2026', ppa: 'Green Campus Development Plan', daed: 'Policy Brief Development', no: 3, output: 'Draft Policy Brief v1', remarks: 'For Revision', link: 'https://drive.google.com' },
  { date: 'Feb 19, 2026', ppa: 'Green Campus Development Plan', daed: 'Writeshop Conduct', no: 4, output: 'Venue and logistics coordination plan', remarks: 'Approved', link: 'https://drive.google.com' },
  { date: 'Feb 20, 2026', ppa: 'Smart Campus Development Plan', daed: 'Finalization of Highlights (1st Draft)', no: 5, output: 'Review of ECOSMART writeshop outputs', remarks: 'Approved', link: 'https://drive.google.com' },
  { date: 'Feb 21, 2026', ppa: 'Smart Campus Development Plan', daed: 'Finalization of Highlights (1st Draft)', no: 6, output: 'Consolidation of writeshop outputs', remarks: 'Approved', link: null },
  { date: 'Feb 24, 2026', ppa: 'Smart Campus Development Plan', daed: 'Policy Brief Development', no: 7, output: 'Draft Policy Brief v1', remarks: 'Approved', link: 'https://drive.google.com' },
  { date: 'Feb 25, 2026', ppa: 'Smart Campus Development Plan', daed: 'Policy Brief Development', no: 8, output: 'Internal Review and Revision', remarks: 'For Approval', link: null },
  { date: 'Feb 26, 2026', ppa: 'Green Campus Development Plan', daed: 'Finalization of Highlights (1st Draft)', no: 9, output: 'Formatting and Structuring of the Highlight', remarks: 'For Revision', link: null },
  { date: 'Feb 27, 2026', ppa: 'Green Campus Development Plan', daed: 'Writeshop Conduct', no: 10, output: 'Facilitation of writeshop', remarks: 'For Approval', link: null },
  { date: '', ppa: '', daed: '', no: '', output: '', remarks: '', link: null },
  { date: '', ppa: '', daed: '', no: '', output: '', remarks: '', link: null },
]

const today = new Date()
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const periodLabel = computed(() => {
  const mo = +props.month
  const yr = +props.year
  return mo === 0 ? `Year ${yr}` : `${MONTHS[mo - 1]} ${yr}`
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="emit('close')">

    <div class="relative bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden"
      style="width: 1100px; max-width: 98vw; max-height: 92vh;">

      <!-- Top accent bar -->
      <div class="h-1 w-full bg-gradient-to-r from-green-900 to-emerald-500 flex-shrink-0"></div>

      <!-- Close -->
      <button
        class="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all cursor-pointer text-base leading-none"
        @click="emit('close')">×</button>

      <!-- ── Header ── -->
      <div class="relative flex-shrink-0 px-8 pt-6 pb-5 border-b border-gray-100">
        <img src="/images/csu.png" alt=""
          class="absolute right-8 top-1/2 -translate-y-1/2 h-20 opacity-[0.06] pointer-events-none select-none" />
        <div class="flex flex-col items-center">
          <img src="/images/csu_seal.png" alt="" class="w-12 h-12 object-contain mb-2"
            onerror="this.style.display='none'" />
          <p class="text-[10px] font-bold tracking-[0.15em] text-green-700 uppercase">Caraga State University</p>
          <h1 class="text-xl font-bold text-gray-900">Individual Accomplishment Report</h1>
          <p class="text-[13px] text-gray-500 tracking-wide mt-0.5">Engineering and Construction Office</p>
          <p class="text-[11px] text-green-800 font-semibold mt-1">{{ periodLabel }}</p>
        </div>
      </div>

      <!-- ── Content ── -->
      <div class="overflow-auto flex-1 px-8 py-6">
        <table class="w-full border-collapse text-xs">
          <thead>   
            <tr class="bg-green-800 text-white text-[11px] uppercase tracking-wide">
              <th class="border border-green-700 px-3 py-2 font-semibold text-center w-24">Date</th>
              <th class="border border-green-700 px-3 py-2 font-semibold text-center w-40">PPAs</th>
              <th class="border border-green-700 px-3 py-2 font-semibold text-center w-40">DAEDs</th>
              <th class="border border-green-700 px-3 py-2 font-semibold text-center w-10">No.</th>
              <th class="border border-green-700 px-3 py-2 font-semibold text-center">Output</th>
              <th class="border border-green-700 px-3 py-2 font-semibold text-center w-32">Remarks</th>
              <th class="border border-green-700 px-3 py-2 font-semibold text-center w-48">Drive Link</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in sampleRows" :key="i" class="h-8">
              <td class="border border-gray-300 px-2 py-1 text-gray-600 whitespace-nowrap">{{ row.date }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600">{{ row.ppa }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600">{{ row.daed }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center text-gray-600">{{ row.no }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600">{{ row.output }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center text-gray-600">{{ row.remarks }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center">
                <span v-if="row.link" class="text-[10px] text-gray-700 break-all">{{ row.link }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Footer -->
        <div class="mt-8 grid grid-cols-3 gap-4 text-xs text-gray-600">
          <!-- Prepared by -->
          <div>
            <p class="mb-6 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Prepared by:</p>
            <div class="border-t border-gray-400 pt-1">
              <p class="font-bold text-gray-800 uppercase text-[11px]">Jacky Barneso</p>
              <p class="text-gray-500">University Architect</p>
            </div>
          </div>

          <!-- Recommending Approval -->
          <div>
            <p class="mb-6 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Recommending Approval:</p>
            <div class="border-t border-gray-400 pt-1">
              <p class="font-bold text-gray-800 uppercase text-[11px]">Ar. Derwin T. Gumban</p>
              <p class="text-gray-500">Head, Planning and Design Unit</p>
            </div>
          </div>

          <!-- Approved by -->
          <div>
            <p class="mb-6 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Approved by:</p>
            <div class="border-t border-gray-400 pt-1">
              <p class="font-bold text-gray-800 uppercase text-[11px]">AR. Magichael B. Cloribel</p>
              <p class="text-gray-500">Director, Engineering & Construction Office</p>
            </div>
          </div>
        </div>
        <p class="text-[9px] text-gray-300 italic mt-4 select-none pointer-events-none">System-generated on {{ today.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) }}. Do not alter.</p>

      </div>
    </div>
  </div>
</template>
