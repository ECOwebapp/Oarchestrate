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
const positionLabel = computed(() => {
  const positions = auth.positions || []
  if (!positions.length) return 'Staff'
  if (positions.some(p => Number(p.pos_id) === 1)) return 'Director'
  if (positions.some(p => Number(p.pos_id) === 4)) return 'Unit Head'
  return positions.find(p => p.pos_name)?.pos_name || 'Staff'
})

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
  ownTasks.value = (data || []).map(t => ({
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
    if (isNaN(from) || isNaN(to)) return 'Invalid period'

    const sameMonthYear =
      from.getFullYear() === to.getFullYear() &&
      from.getMonth() === to.getMonth()

    if (sameMonthYear) {
      const mo = from.toLocaleString('en-PH', { month: 'long' })
      const yr = from.getFullYear()
      return `${mo} ${from.getDate()}-${to.getDate()}, ${yr}`
    }

    const fromLabel = from.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    const toLabel = to.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${fromLabel} - ${toLabel}`
  }
  const mo = +props.month
  const yr = +props.year
  return mo === 0 ? `Year ${yr}` : `${MONTHS[mo - 1]} ${yr}`
})

// Derive full name: prefer passed prop, fall back to auth store
const reportName = computed(() => props.userName || auth.fullName || '—')
const emptyMessage = computed(() => {
  if (approvedTasksInPeriod.value.length === 0) {
    return 'No tasks were found for this period.'
  }
  return ''
})

const approvedTasksInPeriod = computed(() => {

  const mo = +props.month
  const yr = +props.year

  const inPeriod = (dateStr) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    if (isNaN(d)) return false
    if (props.dateFrom && props.dateTo) {
      const from = new Date(props.dateFrom)
      const to = new Date(props.dateTo)
      to.setHours(23, 59, 59, 999)
      return d >= from && d <= to
    }
    return d.getFullYear() === yr && (mo === 0 || d.getMonth() + 1 === mo)
  }

  return ownTasks.value.filter(t => t.director && (inPeriod(t.startDate) || inPeriod(t.endDate)))
})

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
    if (t.director) return 'Approved'
    if (t.revisionComment) return 'For Revision'
    if (t.outputLink && !t.director) return 'Submitted'
    return 'Pending'
  }

  const rows = approvedTasksInPeriod.value
    .map((t, i) => ({
      date:    fmt(t.startDate || t.from),
      ppa:     t.name || '',
      activity:t.description || t.type || t.name || '',
      no:      i + 1,
      remarks: remarkOf(t),
      link:    t.outputLink || null,
    }))

  // Pad to at least 12 rows so the table doesn't look empty
  while (rows.length < 12) {
    rows.push({ date: '', ppa: '', activity: '', no: '', remarks: '', link: null })
  }
  return rows
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="emit('close')">

    <div id="indiv-report-printable" class="relative flex max-h-[92vh] w-[calc(100vw-0.75rem)] max-w-[1100px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:w-[98vw]">

      <!-- Close -->
      <button
        class="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all cursor-pointer text-base leading-none print:hidden"
        @click="emit('close')">×</button>

      <!-- Print -->
      <button @click="printReport"
        class="absolute right-12 top-3 z-30 hidden items-center gap-1.5 rounded-full bg-green-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors cursor-pointer hover:bg-green-700 print:hidden sm:flex">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>

      <!-- ── Header ── -->
      <div class="relative flex-shrink-0 border-b border-gray-100 px-4 pb-4 pt-5 sm:px-8 sm:pb-5 sm:pt-6">
        <img src="/images/csu.png" alt=""
          class="pointer-events-none absolute right-4 top-1/2 hidden h-16 -translate-y-1/2 select-none opacity-[0.06] sm:right-8 sm:block sm:h-20" />
        <div class="flex flex-col items-center">
          <img src="/images/csu_seal.png" alt="" class="w-12 h-12 object-contain mb-2"
            onerror="this.style.display='none'" />
          <p class="text-[10px] font-bold tracking-[0.15em] text-green-700 uppercase">Caraga State University</p>
          <h1 class="text-center text-lg font-bold text-gray-900 sm:text-xl">ACCOMPLISHMENT REPORT</h1>
          <p class="mt-0.5 text-center text-[12px] tracking-wide text-gray-500 sm:text-[13px]">Engineering and Construction Office</p>
          <p class="text-[11px] text-green-800 font-semibold mt-1">{{ periodLabel }}</p>
        </div>
      </div>

      <!-- ── Content ── -->
      <div class="flex-1 overflow-auto px-4 py-5 sm:px-8 sm:py-6">
        <p v-if="emptyMessage" class="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          {{ emptyMessage }}
        </p>
        <table class="w-full border-collapse text-[10px] table-fixed">
          <thead>   
            <tr class="bg-green-800 text-white text-[9px] uppercase tracking-normal">
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:5%">No.</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:10%">Date</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:24%">PPAs</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:30%">Activity</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:10%">Remarks</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:21%">Drive Link</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in reportRows" :key="i" class="h-8">
              <td class="border border-gray-300 px-2 py-1 text-center text-gray-600">{{ row.no }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 whitespace-nowrap">{{ row.date }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 break-words">{{ row.ppa }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 break-words">{{ row.activity }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center text-gray-600">{{ row.remarks }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center">
                <span v-if="row.link" class="text-[9px] text-gray-700 break-all">{{ row.link }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Footer -->
        <div class="mt-8 grid grid-cols-1 gap-6 text-xs text-gray-600 sm:grid-cols-3 sm:gap-4">
          <!-- Prepared by -->
          <div>
            <p class="mb-6 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Prepared by:</p>
            <div class="border-t border-gray-400 pt-1">
              <p class="font-bold text-gray-800 uppercase text-[11px]">{{ reportName }}</p>
              <p class="text-gray-500">{{ positionLabel }}</p>
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
