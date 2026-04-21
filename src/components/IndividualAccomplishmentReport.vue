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
  userName: { type: String, default: '' },
})
const emit = defineEmits(['close'])

const auth = useAuthStore()
const showRecommendingApproval = computed(() => !auth.isUnitHead)
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
  try {
    const response = await apiFetch('/report/load_own_tasks', { method: 'GET' })
    const result = await response.json()

    if (response.ok) ownTasks.value = result.data
    else throw new Error(result?.error)
  } catch (err) {
    console.log('Error fetching report: ', err.message)
    ownTasks.value = []
  }
}

watch(() => props.show, (val) => {
  if (val) {
    loadOwnTasks()
    if (showRecommendingApproval.value) {
      loadUnitHead()
    }
  }
}, { immediate: true })

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

async function exportIndividualPdfFallback() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 32
  const logoData = await loadImageDataUrl('/images/csu_seal.png')

  if (logoData?.dataUrl && logoData?.width && logoData?.height) {
    const logoHeight = 28
    const logoWidth = logoHeight * (logoData.width / logoData.height)
    doc.addImage(logoData.dataUrl, 'PNG', pageWidth / 2 - logoWidth / 2, 8, logoWidth, logoHeight)
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Caraga State University - Engineering and Construction Office', pageWidth / 2, 46, { align: 'center' })
  doc.setFontSize(15)
  doc.text('ACCOMPLISHMENT REPORT', pageWidth / 2, 64, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(periodLabel.value, pageWidth / 2, 78, { align: 'center' })
  doc.setDrawColor(22, 101, 52)
  doc.setLineWidth(1)
  doc.line(margin, 86, pageWidth - margin, 86)

  const head = [['No.', 'Date', 'PPAs', 'Activity', 'Description', 'Remarks', 'Drive Link']]
  const body = reportRows.value
    .filter((r) => r.no !== '')
    .map((row) => [row.no, row.date, row.ppa, row.activity, row.description, row.remarks, row.link])

  autoTable(doc, {
    head,
    body,
    startY: 94,
    margin: { top: 94, right: margin, bottom: 108, left: margin },
    styles: { font: 'helvetica', fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
    headStyles: { fillColor: [20, 83, 45], textColor: [255, 255, 255], halign: 'center' },
  })

  const finalY = doc.lastAutoTable.finalY || 94
  let sigY = finalY + 26
  if (sigY > pageHeight - 120) {
    doc.addPage()
    sigY = 80
  }

  doc.setTextColor(75, 85, 99)
  doc.setFontSize(9)

  doc.text('Prepared by:', margin, sigY)
  doc.line(margin, sigY + 26, margin + 155, sigY + 26)
  doc.setFont('helvetica', 'bold')
  doc.text((reportName.value || '—').toUpperCase(), margin + 2, sigY + 38)
  doc.setFont('helvetica', 'normal')
  doc.text(positionLabel.value || 'Staff', margin + 2, sigY + 50)

  if (showRecommendingApproval.value) {
    const rx = pageWidth / 2 - 88
    doc.text('Recommending Approval:', rx, sigY)
    doc.line(rx, sigY + 26, rx + 170, sigY + 26)
    doc.setFont('helvetica', 'bold')
    doc.text(unitHeadInfo.value.name || '—', rx + 2, sigY + 38)
    doc.setFont('helvetica', 'normal')
    doc.text(unitHeadInfo.value.title || 'Unit Head', rx + 2, sigY + 50)
  }

  const ax = pageWidth - margin - 170
  doc.text('Approved by:', ax, sigY)
  doc.line(ax, sigY + 26, ax + 160, sigY + 26)
  doc.setFont('helvetica', 'bold')
  doc.text('AR. MAGICHAEL B. CLORIBEL', ax + 2, sigY + 38)
  doc.setFont('helvetica', 'normal')
  doc.text('Director, Engineering & Construction Office', ax + 2, sigY + 50)

  const generated = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text(`System-generated on ${generated}. Do not alter.`, margin, pageHeight - 14)

  addContinuationMarkers(doc)

  const filename = `individual-accomplishment-report-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}

async function exportPdf() {
  const root = document.getElementById('indiv-report-printable')
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

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
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

    const filename = `individual-accomplishment-report-${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(filename)
  } catch (error) {
    console.warn('[IndividualAccomplishmentReport] PDF capture fallback:', error)
    await exportIndividualPdfFallback()
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const today = new Date()

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

// Derive full name: prefer passed prop, fall back to auth store
const reportName = computed(() => props.userName || auth.fullName || '—')
const emptyMessage = computed(() => {
  if (approvedTasksInPeriod.value.length === 0) {
    return 'No tasks were found for this period.'
  }
  return ''
})

// Fetch unit head for the user's unit
const userUnitId = computed(() => {
  const positions = auth.positions || []
  const pos = positions.find(p => p.unit_id != null)
  return pos?.unit_id ?? null
})

const userUnitName = computed(() => {
  const positions = auth.positions || []
  const pos = positions.find(p => p.unit_id != null)
  return pos?.unit_name || ''
})

const unitHeadInfo = ref({ name: '', title: '' })

const loadUnitHead = async () => {
  const unitId = userUnitId.value
  if (!unitId) {
    unitHeadInfo.value = { name: '', title: '' }
    return
  }

  try {
    const response = await apiFetch(`/report/load_unit_head?unitId=${unitId}`, { method: 'GET' })
    const result = await response.json()

    if (response.ok) {
      unitHeadInfo.value = {
        name: result.data,
        title: userUnitName.value ? `Unit Head, ${userUnitName.value}` : 'Unit Head'
      }
    } else throw new Error(result?.error)

  } catch (err) {
    console.log('Error fetching Unit Head: ', err.message)
    unitHeadInfo.value = { name: '', title: '' }
  }
}

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
      const to = new Date(props.dateTo)
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

  const rows = []

  approvedTasksInPeriod.value.forEach((t) => {
    const activities = (t.subtaskNames && t.subtaskNames.length) ? t.subtaskNames : ['']
    activities.forEach((subtaskName) => {
      rows.push({
        date: fmt(t.startDate || t.from),
        ppa: t.name || '',
        activity: subtaskName || '',
        description: t.description || '',
        no: '',
        remarks: remarkOf(t),
        link: t.outputLink || '',
      })
    })
  })

  rows.forEach((row, i) => {
    row.no = i + 1
  })

  // Pad to at least 12 rows so the table doesn't look empty
  while (rows.length < 12) {
    rows.push({ date: '', ppa: '', activity: '', description: '', no: '', remarks: '', link: '' })
  }
  return rows
})

const normalizeOutputLink = (value) => {
  if (!value) return ''
  return /^https?:\/\//i.test(value) ? value : `https://${value}`
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="emit('close')">

    <div id="indiv-report-printable"
      class="relative flex max-h-[92vh] w-[calc(100vw-0.75rem)] max-w-[1100px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:w-[98vw]">

      <!-- Close -->
      <button data-export-ignore="true"
        class="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all cursor-pointer text-base leading-none print:hidden"
        @click="emit('close')">×</button>

      <!-- Print -->
      <button @click="exportPdf" data-export-ignore="true"
        class="absolute right-12 top-3 z-30 hidden items-center gap-1.5 rounded-full bg-green-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors cursor-pointer hover:bg-green-700 print:hidden sm:flex">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3v11" />
          <path d="M8 10l4 4 4-4" />
          <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
        </svg>
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
          <h1 class="text-center text-lg font-bold text-gray-900 sm:text-xl">ACCOMPLISHMENT REPORT</h1>
          <p class="mt-0.5 text-center text-[12px] tracking-wide text-gray-500 sm:text-[13px]">Engineering and
            Construction Office</p>
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
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap"
                style="width:5%">No.</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap"
                style="width:10%">Date</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap"
                style="width:20%">PPAs</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap"
                style="width:14%">Activity</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap"
                style="width:22%">Description</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap"
                style="width:12%">Remarks</th>
              <th class="border border-green-700 px-1 py-1.5 font-semibold text-center whitespace-nowrap"
                style="width:17%">Drive Link</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in reportRows" :key="i" class="h-8">
              <td class="border border-gray-300 px-2 py-1 text-center text-gray-600">{{ row.no }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 whitespace-nowrap">{{ row.date }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 break-words">{{ row.ppa }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 break-words">{{ row.activity }}</td>
              <td class="border border-gray-300 px-2 py-1 text-gray-600 break-words">{{ row.description }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center text-gray-600">{{ row.remarks }}</td>
              <td class="border border-gray-300 px-2 py-1 text-center">
                <a v-if="row.link" :href="normalizeOutputLink(row.link)" target="_blank" rel="noopener noreferrer"
                  class="text-[9px] text-green-800 underline break-all hover:text-green-700">
                  {{ row.link }}
                </a>
                <span v-else class="text-[9px] text-gray-300">—</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Footer -->
        <div class="mt-8 grid grid-cols-1 gap-6 text-xs text-gray-600 sm:grid-cols-3 sm:items-start sm:gap-4">
          <!-- Prepared by -->
          <div class="sm:min-w-[220px] sm:max-w-[260px]">
            <p class="mb-6 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Prepared by:</p>
            <div class="border-t border-gray-400 pt-1">
              <p class="font-bold text-gray-800 uppercase text-[11px]">{{ reportName }}</p>
              <p class="text-gray-500">{{ positionLabel }}</p>
            </div>
          </div>

          <!-- Recommending Approval (hide when current user is Unit Head) -->
          <div v-if="showRecommendingApproval" class="sm:max-w-[260px] sm:mx-auto sm:justify-self-center sm:text-left">
            <p class="mb-6 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Recommending Approval:</p>
            <div class="border-t border-gray-400 pt-1 w-full">
              <p class="font-bold text-gray-800 uppercase text-[11px]">{{ unitHeadInfo.name || '—' }}</p>
              <p class="text-gray-500">{{ unitHeadInfo.title || 'Unit Head' }}</p>
            </div>
          </div>
          <div v-else class="hidden sm:block"></div>

          <!-- Approved by -->
          <div class="sm:min-w-[220px] sm:max-w-[260px] sm:justify-self-end sm:text-left">
            <p class="mb-6 text-gray-400 font-semibold uppercase tracking-wide text-[10px]">Approved by:</p>
            <div class="border-t border-gray-400 pt-1">
              <p class="font-bold text-gray-800 uppercase text-[11px]">AR. Magichael B. Cloribel</p>
              <p class="text-gray-500">Director, Engineering & Construction Office</p>
            </div>
          </div>
        </div>
        <p class="text-[9px] text-gray-300 italic mt-4 select-none pointer-events-none">System-generated on {{
          today.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) }}. Do not alter.</p>

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

  body {
    visibility: hidden;
  }

  #indiv-report-printable,
  #indiv-report-printable * {
    visibility: visible;
  }

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

  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
