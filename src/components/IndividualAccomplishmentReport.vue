<script setup>
import { computed, ref, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient.js'
import { useAuthStore } from '@/stores/useAuthStore.js'

const props = defineProps({
  show: Boolean,
  month:    { default: () => new Date().getMonth() + 1 },
  year:     { default: () => new Date().getFullYear() },
  dateFrom: { type: String, default: '' },
  dateTo:   { type: String, default: '' },
  userName: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const auth  = useAuthStore()

// Fetch the logged-in user's own approved tasks directly — independent of
// what the store has loaded (e.g. director's store excludes already-approved tasks)
const ownTasks = ref([])

const loadOwnTasks = async () => {
  const uid = auth.userID
  if (!uid) return
  const { data, error } = await supabase
    .from('task')
    .select(`
      id, assignee,
      task_profile ( title, description, task_type_ref:task_type(task_type) ),
      task_approval ( unit_head, director, revision_comment ),
      task_duration ( created, deadline ),
      task_output   ( link )
    `)
    .is('parent_id', null)
    .eq('assignee', uid)
  ownTasks.value = (data || [])
    .filter(t => t.task_approval?.unit_head || t.task_approval?.director)
    .map(t => ({
    assignee:   t.assignee,
    name:       t.task_profile?.title       || '',
    description:t.task_profile?.description || '',
    type:       t.task_profile?.task_type_ref?.task_type || '',
    unitHead:   !!t.task_approval?.unit_head,
    director:   !!t.task_approval?.director,
    startDate:  t.task_duration?.created    || null,
    endDate:    t.task_duration?.deadline   || null,
    outputLink: t.task_output?.link         || null,
  }))
}

watch(() => props.show, (val) => { if (val) loadOwnTasks() }, { immediate: true })

function printReport() {
  const prev = document.title
  document.title = ' '
  setTimeout(() => {
    window.print()
    document.title = prev
  }, 50)
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const today  = new Date()

const periodLabel = computed(() => {
  if (props.dateFrom && props.dateTo) {
    const from = new Date(props.dateFrom)
    const to   = new Date(props.dateTo)
    const mo   = from.toLocaleString('en-PH', { month: 'long' })
    const yr   = from.getFullYear()
    return `${mo} ${from.getDate()}–${to.getDate()}, ${yr}`
  }
  const mo = +props.month
  const yr = +props.year
  return mo === 0 ? `Year ${yr}` : `${MONTHS[mo - 1]} ${yr}`
})

// Derive full name: prefer passed prop, fall back to auth store
const reportName = computed(() => props.userName || auth.fullName || '—')

// Build rows from real Supabase tasks belonging to the current user,
// filtered to the selected month/year
const reportRows = computed(() => {
  const mo = +props.month
  const yr = +props.year

  const inPeriod = (dateStr) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    if (isNaN(d)) return false
    if (props.dateFrom && props.dateTo) {
      const from = new Date(props.dateFrom)
      const to   = new Date(props.dateTo)
      to.setHours(23, 59, 59, 999)
      return d >= from && d <= to
    }
    return d.getFullYear() === yr && (mo === 0 || d.getMonth() + 1 === mo)
  }

  const FMT = { month: 'short', day: 'numeric', year: 'numeric' }
  const fmt = (s) => { const d = new Date(s); return isNaN(d) ? '' : d.toLocaleDateString('en-PH', FMT) }

  const remarkOf = (t) => {
    if (t.director || t.unitHead) return 'Approved'
    if (t.revision)  return 'For Revision'
    return 'Pending'
  }

  const rows = ownTasks.value
    .filter(t => (inPeriod(t.startDate) || inPeriod(t.endDate)))
    .map((t, i) => ({
      date:    fmt(t.startDate || t.from),
      ppa:     '',
      daed:    t.name || '',
      no:      i + 1,
      output:  t.description || t.name || '',
      remarks: remarkOf(t),
      link:    t.outputLink || null,
    }))

  // Pad to at least 12 rows so the table doesn't look empty
  while (rows.length < 12) {
    rows.push({ date: '', ppa: '', daed: '', no: '', output: '', remarks: '', link: null })
  }
  return rows
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="emit('close')">

    <div id="indiv-report-printable" class="relative bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden"
      style="width: 1100px; max-width: 98vw; max-height: 92vh;">

      <!-- Close -->
      <button
        class="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all cursor-pointer text-base leading-none print:hidden"
        @click="emit('close')">×</button>

      <!-- Print -->
      <button @click="printReport"
        class="absolute top-3 right-12 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-900 text-white text-[11px] font-semibold hover:bg-green-700 transition-colors cursor-pointer print:hidden">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>

      <!-- ── Header ── -->
      <div class="relative flex-shrink-0 px-8 pt-6 pb-5 border-b border-gray-100">
        <img src="/images/csu.png" alt=""
          class="absolute right-8 top-1/2 -translate-y-1/2 h-20 opacity-[0.06] pointer-events-none select-none" />
        <div class="flex flex-col items-center">
          <img src="/images/csu_seal.png" alt="" class="w-12 h-12 object-contain mb-2"
            onerror="this.style.display='none'" />
          <p class="text-[10px] font-bold tracking-[0.15em] text-green-700 uppercase">Caraga State University</p>
          <h1 class="text-xl font-bold text-gray-900">ACCOMPLISHMENT REPORT</h1>
          <p class="text-[13px] text-gray-500 tracking-wide mt-0.5">Engineering and Construction Office</p>
          <p class="text-[11px] text-green-800 font-semibold mt-1">{{ periodLabel }}</p>
        </div>
      </div>

      <!-- ── Content ── -->
      <div class="overflow-auto flex-1 px-8 py-6">
        <table class="w-full border-collapse text-[10px] table-fixed">
          <thead>   
            <tr class="bg-green-800 text-white text-[9px] uppercase tracking-normal">
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:10%">Date</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:12%">PPAs</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:14%">DAEDs</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:5%">No.</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:28%">Output</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:10%">Remarks</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:21%">Drive Link</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in reportRows" :key="i" class="h-8">
              <td class="border border-gray-300 px-2 py-1 text-gray-600 whitespace-nowrap">{{ row.date }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 break-words">{{ row.ppa }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 break-words">{{ row.daed }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center text-gray-600">{{ row.no }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600">
                <span class="line-clamp-4 break-words">{{ row.output }}</span>
              </td>
              <td class="border border-gray-300 px-2 py-1 text-center text-gray-600">{{ row.remarks }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center">
                <span v-if="row.link" class="text-[9px] text-gray-700 break-all">{{ row.link }}</span>
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
              <p class="font-bold text-gray-800 uppercase text-[11px]">{{ reportName }}</p>
              <p class="text-gray-500">{{ auth.positionLabel || 'Staff' }}</p>
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

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  body { visibility: hidden; }

  #indiv-report-printable,
  #indiv-report-printable * { visibility: visible; }

  #indiv-report-printable {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    max-height: none !important;
    overflow: visible !important;
    box-shadow: none;
    border-radius: 0;
    padding: 12mm 10mm;
  }

  #indiv-report-printable .overflow-auto {
    overflow: visible !important;
    max-height: none !important;
  }

  #indiv-report-printable table {
    border-collapse: collapse !important;
    width: 100% !important;
    table-layout: fixed !important;
  }

  /* Repeat header row on every printed page */
  #indiv-report-printable thead {
    display: table-header-group !important;
  }

  /* Keep footer pinned to bottom of last page */
  #indiv-report-printable tfoot {
    display: table-footer-group !important;
  }

  #indiv-report-printable th,
  #indiv-report-printable td {
    border: 1px solid #aaa !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    white-space: normal !important;
    vertical-align: top !important;
    font-size: 8pt !important;
    padding: 3px 5px !important;
  }

  #indiv-report-printable thead th {
    white-space: nowrap !important;
    font-size: 7pt !important;
    padding: 3px 3px !important;
  }

  /* Remove line-clamp in print so full text shows */
  #indiv-report-printable .line-clamp-4 {
    display: block !important;
    -webkit-line-clamp: unset !important;
    line-clamp: unset !important;
    overflow: visible !important;
    max-height: none !important;
  }

  /* Allow rows to break across pages but try to keep each row together */
  #indiv-report-printable tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* Signature block should never be cut across pages */
  #indiv-report-printable .mt-8 {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    break-before: auto !important;
  }

  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>
