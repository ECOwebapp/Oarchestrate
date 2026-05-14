<script setup vapor>
import { computed, ref, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore.js'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import autoTable from 'jspdf-autotable'
import { apiFetch } from '@/lib/api'

const props = defineProps({
  show: Boolean,
  month: { default: () => new Date().getMonth() + 1 },
  year: { default: () => new Date().getFullYear() },
  dateFrom: { type: String, default: '' },
  dateTo: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const auth = useAuthStore()
const currentUserUnitId = computed(() => {
  const positions = auth.positions || []
  // Prefer the active Unit Head assignment so report scope matches the user's headed unit.
  const pos = positions.find(p => Number(p.pos_id) === 4 && p.unit_id != null)
    || positions.find(p => p.unit_id != null)
  return pos?.unit_id ?? null
})

// allTasks: array of { unitName, unitId, tasks[] }
const unitGroups = ref([])

const loadAllTasks = async () => {
  if (!auth.userID) {
    unitGroups.value = []
    return
  }

  try{
    const response = await apiFetch('/report/load_all_tasks', { method: 'GET' })
    const result = await response.json()

    if(response.ok) unitGroups.value = result.data
    else throw new Error(result?.error)

  } catch(err) {
    console.log('Error fetching report: ', err.message)
    unitGroups.value = []
  }
}

watch(
  [() => props.show, () => auth.userID, () => auth.isDirector, () => (auth.positions || []).length],
  ([show, userId, isDirector, positionCount]) => {
    if (!show || !userId) return
    if (!isDirector && positionCount === 0) return
    loadAllTasks()
  },
  { immediate: true }
)

function isCanvasLikelyBlank(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return true

  const w = canvas.width
  const h = canvas.height
  const samplesX = 16
  const samplesY = 16
  let nonWhite = 0

  for (let y = 0; y < samplesY; y++) {
    for (let x = 0; x < samplesX; x++) {
      const px = Math.floor((x / (samplesX - 1)) * Math.max(0, w - 1))
      const py = Math.floor((y / (samplesY - 1)) * Math.max(0, h - 1))
      const [r, g, b, a] = ctx.getImageData(px, py, 1, 1).data
      const isTransparent = a === 0
      const isNearWhite = r > 245 && g > 245 && b > 245
      if (!isTransparent && !isNearWhite) nonWhite++
    }
  }

  return nonWhite < 6
}

function addContinuationMarkers(doc) {
  const totalPages = doc.internal.getNumberOfPages()
  if (totalPages <= 1) return

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  for (let i = 1; i < totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text('Continued on next page...', pageWidth / 2, pageHeight - 16, { align: 'center' })
  }
}

const loadImageDataUrl = (src) => new Promise((resolve) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    } catch {
      resolve(null)
    }
  }
  img.onerror = () => resolve(null)
  img.src = src
})

async function exportUnitPdfFallback() {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 32
  const logoData = await loadImageDataUrl('/images/csu_seal.png')

  if (logoData?.dataUrl && logoData?.width && logoData?.height) {
    const logoHeight = 32
    const logoWidth = logoHeight * (logoData.width / logoData.height)
    doc.addImage(logoData.dataUrl, 'PNG', pageWidth / 2 - logoWidth / 2, 8, logoWidth, logoHeight)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Caraga State University - Engineering and Construction Office', pageWidth / 2, 48, { align: 'center' })
  doc.setFontSize(16)
  doc.text('Unit Accomplishment Report', pageWidth / 2, 66, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(periodLabel.value, pageWidth / 2, 80, { align: 'center' })
  doc.setDrawColor(22, 101, 52)
  doc.setLineWidth(1)
  doc.line(margin, 88, pageWidth - margin, 88)

  const head = [['Unit', 'Tasks', 'Subtasks', 'Assigned Personnel', 'Start Date', 'Due Date', 'MOVs', 'Remarks']]
  const body = flatRows.value.map((row) => [
    row.showUnit ? row.unitName : '',
    row.showTask ? row.taskName : '',
    row.subtaskName || '',
    (row.assignedTo || []).join(', '),
    row.showTask ? row.startDate : '',
    row.showTask ? row.endDate : '',
    row.showTask ? (row.mov?.url || 'No file') : '',
    row.showTask ? (row.remarks === 'Approved' ? row.remarks : '') : '',
  ])

  autoTable(doc, {
    head,
    body,
    startY: 96,
    margin: { top: 96, right: margin, bottom: 90, left: margin },
    styles: { font: 'helvetica', fontSize: 7.2, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [20, 83, 45], textColor: [255, 255, 255], halign: 'center' },
    didDrawPage: () => {
      doc.setFontSize(9)
      doc.setTextColor(107, 114, 128)
      doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - margin, pageHeight - 14, { align: 'right' })
    },
  })

  const finalY = doc.lastAutoTable.finalY || 96
  const signatureBlockHeight = 62
  let sigY = finalY + 28
  if (sigY + signatureBlockHeight > pageHeight - 24) {
    doc.addPage()
    sigY = 80
  }
  doc.setTextColor(75, 85, 99)
  doc.setFontSize(10)
  doc.text('Prepared by', margin + 90, sigY, { align: 'center' })
  doc.text('Noted by', pageWidth - margin - 190, sigY, { align: 'center' })
  doc.line(margin + 20, sigY + 30, margin + 160, sigY + 30)
  doc.line(pageWidth - margin - 260, sigY + 30, pageWidth - margin - 120, sigY + 30)
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text('Signature over printed name', margin + 90, sigY + 44, { align: 'center' })
  doc.text('Signature over printed name', pageWidth - margin - 190, sigY + 44, { align: 'center' })

  const generated = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.setTextColor(156, 163, 175)
  doc.text(`System-generated on ${generated}. Do not alter.`, margin, pageHeight - 14)

  addContinuationMarkers(doc)

  const filename = `unit-accomplishment-report-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}

async function exportPdf() {
  const root = document.getElementById('unit-report-printable')
  if (!root) return

  const exportHiddenNodes = root.querySelectorAll('[data-export-ignore="true"]')
  const restoreHidden = []
  exportHiddenNodes.forEach((el) => {
    restoreHidden.push({ el, display: el.style.display })
    el.style.display = 'none'
  })

  const originalRootStyles = {
    maxHeight: root.style.maxHeight,
    overflow: root.style.overflow,
    height: root.style.height,
  }
  root.style.maxHeight = 'none'
  root.style.overflow = 'visible'
  root.style.height = 'auto'

  const scrollAreas = root.querySelectorAll('.overflow-auto, .overflow-y-auto')
  const restoreScrollStyles = []
  scrollAreas.forEach((el) => {
    restoreScrollStyles.push({
      el,
      overflow: el.style.overflow,
      maxHeight: el.style.maxHeight,
      height: el.style.height,
    })
    el.style.overflow = 'visible'
    el.style.maxHeight = 'none'
    el.style.height = 'auto'
  })

  await nextTick()

  try {
    const canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      foreignObjectRendering: true,
      backgroundColor: '#ffffff',
      windowWidth: root.scrollWidth,
      windowHeight: root.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    })

    if (isCanvasLikelyBlank(canvas)) {
      throw new Error('Canvas capture was blank')
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 18
    const pdfWidth = pageWidth - margin * 2
    const pdfPageHeight = pageHeight - margin * 2
    const scaledImgHeight = (canvas.height * pdfWidth) / canvas.width

    let heightLeft = scaledImgHeight
    let sourceY = 0
    let pageIndex = 0

    while (heightLeft > 0) {
      if (pageIndex > 0) doc.addPage()

      const sliceHeight = Math.min(pdfPageHeight, heightLeft)
      const sourceSliceHeight = Math.round((sliceHeight / scaledImgHeight) * canvas.height)

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = sourceSliceHeight
      const ctx = pageCanvas.getContext('2d')
      ctx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sourceSliceHeight,
        0,
        0,
        canvas.width,
        sourceSliceHeight
      )

      const pageData = pageCanvas.toDataURL('image/png')
      doc.addImage(pageData, 'PNG', margin, margin, pdfWidth, sliceHeight, undefined, 'FAST')

      sourceY += sourceSliceHeight
      heightLeft -= sliceHeight
      pageIndex += 1
    }

    addContinuationMarkers(doc)

    const filename = `unit-accomplishment-report-${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(filename)
  } catch (error) {
    console.warn('[AccomplishmentReport] PDF capture fallback:', error)
    await exportUnitPdfFallback()
  } finally {
    restoreHidden.forEach(({ el, display }) => { el.style.display = display })
    root.style.maxHeight = originalRootStyles.maxHeight
    root.style.overflow = originalRootStyles.overflow
    root.style.height = originalRootStyles.height
    restoreScrollStyles.forEach(({ el, overflow, maxHeight, height }) => {
      el.style.overflow = overflow
      el.style.maxHeight = maxHeight
      el.style.height = height
    })
  }
}

// ── Filtered by selected period ──────────────────────────
const programs = computed(() => {
  const mo = +props.month
  const yr = +props.year

  const inPeriod = (t) => {
    const check = (s) => {
      if (!s) return false
      const d = new Date(s)
      if (isNaN(d)) return false

      if (props.dateFrom && props.dateTo) {
        const from = new Date(props.dateFrom)
        const to = new Date(props.dateTo)
        to.setHours(23, 59, 59, 999)
        return d >= from && d <= to
      }

      return d.getFullYear() === yr && (mo === 0 || d.getMonth() + 1 === mo)
    }

    return check(t.rawStart) || check(t.rawEnd)
  }

  return unitGroups.value
    .map(g => {
      const tasks = g.tasks.filter(t => inPeriod(t))
      return { ...g, tasks, rowspan: tasks.length }
    })
    .filter(g => g.tasks.length > 0)
})

const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })

// Expand tasks into one row per subtask for rendering
const flatRows = computed(() => {
  const rows = []
  for (const grp of programs.value) {
    const unitRowspan = grp.tasks.reduce((sum, t) => sum + Math.max(1, (t.subtaskNames || []).length), 0)
    let unitRendered = false
    for (const task of grp.tasks) {
      const subs = (task.subtaskNames || []).length > 0 ? task.subtaskNames : ['']
      let taskRendered = false
      for (let si = 0; si < subs.length; si++) {
        rows.push({
          showUnit:     !unitRendered,
          unitRowspan,
          unitName:     grp.unitName,
          showTask:     !taskRendered,
          taskRowspan:  subs.length,
          taskName:     task.name,
          subtaskName:  subs[si],
          assignedTo:   task.assignedTo,
          startDate:    task.startDate,
          endDate:      task.endDate,
          mov:          task.mov,
          remarks:      task.remarks,
          isLastInUnit: false,
        })
        unitRendered = true
        taskRendered = true
      }
    }
    if (rows.length > 0) rows[rows.length - 1].isLastInUnit = true
  }
  return rows
})

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const periodLabel = computed(() => {
  if (props.dateFrom && props.dateTo) {
    const from = new Date(props.dateFrom)
    const to = new Date(props.dateTo)
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
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="emit('close')">

    <div id="unit-report-printable" class="relative flex max-h-[92vh] w-[calc(100vw-0.75rem)] max-w-[1420px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:w-[99vw]">

      <!-- Close -->
      <button
        data-export-ignore="true"
        class="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all cursor-pointer text-base leading-none print:hidden"
        @click="emit('close')">×</button>

      <!-- Print -->
      <button @click="exportPdf"
        data-export-ignore="true"
        class="absolute right-12 top-3 z-30 hidden items-center gap-1.5 rounded-full bg-green-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors cursor-pointer hover:bg-green-700 print:hidden sm:flex">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11"/><path d="M8 10l4 4 4-4"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></svg>
        Save as PDF
      </button>

      <!-- ── Header ── -->
      <div class="relative flex-shrink-0 border-b border-gray-100 px-4 pb-4 pt-5 sm:px-8 sm:pb-5 sm:pt-6">
        <img src="/images/csu.png" alt=""
          class="pointer-events-none absolute right-4 top-1/2 hidden h-16 -translate-y-1/2 select-none opacity-[0.06] sm:right-8 sm:block sm:h-20" />
        <div class="flex flex-col items-center">
          <img src="/images/csu_seal.png" alt="" class="w-12 h-12 object-contain mb-2"
            onerror="this.style.display='none'" />
          <p class="text-[10px] font-bold tracking-[0.15em] text-green-700 uppercase">Caraga State University</p>
          <h1 class="text-center text-lg font-bold text-gray-900 sm:text-xl">Unit Accomplishment Report</h1>
          <p class="mt-0.5 text-center text-[12px] tracking-wide text-gray-500 sm:text-[13px]">Engineering and Construction Office</p>
          <p class="text-[11px] text-green-800 font-semibold mt-1">{{ periodLabel }}</p>
        </div>
      </div>

      <!-- ── Table ── -->
      <div class="overflow-auto flex-1">
        <table class="w-full text-xs border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="bg-green-900 text-white text-[9px] uppercase tracking-normal">
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:9%">Unit</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:17%">Tasks</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:18%">Subtasks</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:14%">Assigned Personnel</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:8%">Start Date</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:8%">Due Date</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:14%">MOVs</th>
              <th class="px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:12%">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="flatRows.length === 0">
              <td colspan="8" class="text-center py-10 text-gray-400 text-sm italic">No tasks found for {{ periodLabel }}.</td>
            </tr>
            <tr v-for="(row, i) in flatRows" :key="i"
              :class="[row.isLastInUnit ? 'border-b-2 border-gray-400' : 'border-b border-gray-100', 'hover:bg-green-50/30 bg-white']">

              <!-- Unit -->
              <td v-if="row.showUnit" :rowspan="row.unitRowspan"
                class="border-r-2 border-gray-300 align-middle text-center bg-green-900/5 px-2 py-2">
                <span class="font-bold text-green-900 text-[10px] leading-tight">{{ row.unitName }}</span>
              </td>

              <!-- Task (spans subtask rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-3 py-2 text-gray-800 border-r border-gray-200 align-top font-semibold text-[10px]">
                {{ row.taskName }}
              </td>

              <!-- Subtask -->
              <td class="px-3 py-2 text-gray-700 border-r border-gray-200 align-top text-[10px]">{{ row.subtaskName }}</td>

              <!-- Assigned Personnel -->
              <td class="px-3 py-2 text-center border-r border-gray-200 align-top">
                <div class="flex flex-col gap-0.5 items-center w-full">
                  <span v-for="person in row.assignedTo" :key="person"
                    class="inline-block max-w-full px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-900 text-white leading-tight text-center whitespace-normal break-words">
                    {{ person }}
                  </span>
                </div>
              </td>

              <!-- Start Date (spans task rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-3 py-2 text-center text-gray-500 border-r border-gray-200 whitespace-nowrap align-middle text-[10px]">
                {{ row.startDate }}
              </td>

              <!-- Due Date (spans task rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-3 py-2 text-center text-gray-500 border-r border-gray-200 whitespace-nowrap align-middle text-[10px]">
                {{ row.endDate }}
              </td>

              <!-- MOVs (spans task rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-2 py-2 border-r border-gray-200 align-top">
                <a v-if="row.mov" :href="row.mov.url" target="_blank" rel="noopener"
                  class="text-[9px] text-blue-700 underline break-all hover:text-blue-900 transition-colors">
                  {{ row.mov.url }}
                </a>
                <span v-else class="text-gray-300 text-[9px]">No file</span>
              </td>

              <!-- Remarks (spans task rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-2 py-2 text-center text-[10px] text-gray-600 font-medium align-middle whitespace-nowrap">
                {{ row.remarks === 'Approved' ? row.remarks : '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Generated Notice ── -->

      <!-- ── Footer ── -->
      <div class="flex-shrink-0 border-t border-gray-100 bg-white px-4 pb-3 pt-5 sm:px-10">
        <div class="mb-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div class="text-center w-48">
            <div class="h-8 border-b border-gray-400 mb-1"></div>
            <p class="text-[11px] text-gray-500 font-medium">Prepared by</p>
            <p class="text-[10px] text-gray-400">Signature over printed name</p>
          </div>
          <div class="text-center w-48">
            <div class="h-8 border-b border-gray-400 mb-1"></div>
            <p class="text-[11px] text-gray-500 font-medium">Noted by</p>
            <p class="text-[10px] text-gray-400">Signature over printed name</p>
          </div>
        </div>
        <p class="text-[8px] text-gray-300/60 italic select-none pointer-events-none text-left">System-generated on {{ today }}. Do not alter.</p>
      </div>

    </div>
  </div>
</template>

<style>
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }

  body { visibility: hidden; }

  #unit-report-printable,
  #unit-report-printable * { visibility: visible; }

  #unit-report-printable {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    max-height: none !important;
    overflow: visible !important;
    box-shadow: none;
    border-radius: 0;
    padding: 8mm 10mm;
    font-family: Arial, sans-serif;
  }

  #unit-report-printable .overflow-auto {
    overflow: visible !important;
    max-height: none !important;
  }

  /* ── Table ── */
  #unit-report-printable table {
    border-collapse: collapse !important;
    width: 100% !important;
    table-layout: auto !important;
  }

  #unit-report-printable thead {
    display: table-header-group !important;
  }

  #unit-report-printable th,
  #unit-report-printable td {
    border: 1px solid #5a5a5a !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    white-space: normal !important;
    vertical-align: middle !important;
    font-size: 7pt !important;
    padding: 4px 5px !important;
    color: #111 !important;
    background: white !important;
  }

  /* Header row */
  #unit-report-printable thead th {
    white-space: nowrap !important;
    font-size: 7pt !important;
    padding: 5px 4px !important;
    background: #1a4731 !important;
    color: white !important;
    text-align: center !important;
    font-weight: bold !important;
    letter-spacing: 0 !important;
  }

  /* Unit name cell — horizontal, clean */
  #unit-report-printable td[rowspan] {
    writing-mode: horizontal-tb !important;
    transform: none !important;
    text-align: center !important;
    vertical-align: middle !important;
    font-weight: bold !important;
    font-size: 7.5pt !important;
    background: #e8f5e9 !important;
    color: #1a4731 !important;
  }

  #unit-report-printable td[rowspan] span {
    writing-mode: horizontal-tb !important;
    transform: none !important;
    white-space: normal !important;
  }

  /* Strip badge/pill styling — show plain text */
  #unit-report-printable td span,
  #unit-report-printable td a {
    background: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    color: #111 !important;
    font-size: 7pt !important;
    font-weight: normal !important;
    display: inline !important;
  }

  #unit-report-printable td a {
    text-decoration: underline !important;
    color: #1a4731 !important;
  }

  #unit-report-printable th:last-child,
  #unit-report-printable td:last-child {
    white-space: nowrap !important;
    word-break: normal !important;
    overflow-wrap: normal !important;
  }

  /* Even rows: light stripe */
  #unit-report-printable tbody tr:nth-child(even) td {
    background: #f9fafb !important;
  }

  /* Keep rows together */
  #unit-report-printable tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ── Sticky header → static in print ── */
  #unit-report-printable .sticky {
    position: static !important;
  }

  /* ── Footer signature area ── */
  #unit-report-printable .flex-shrink-0.border-t {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    padding: 6mm 0 0 0 !important;
    border-top: 1px solid #aaa !important;
    margin-top: 6mm !important;
  }

  #unit-report-printable .flex-shrink-0.border-t .flex {
    display: flex !important;
    justify-content: space-between !important;
  }

  #unit-report-printable .flex-shrink-0.border-t p {
    font-size: 7pt !important;
    color: #333 !important;
  }

  #unit-report-printable .flex-shrink-0.border-t .border-b {
    border-bottom: 1px solid #333 !important;
    margin-bottom: 3px !important;
  }

  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>

