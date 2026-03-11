    <script setup>
    import { ref, computed, onMounted } from 'vue'
    import Icons from '@/components/Icons.vue'
    import AnalyticsChart from '@/components/AnalyticsChart.vue'
    import AccomplishmentReport from '@/components/AccomplishmentReport.vue'
    import IndividualAccomplishmentReport from '@/components/IndividualAccomplishmentReport.vue'
    import ReportPicker from '@/components/ReportPicker.vue'
    import { taskStore as useTaskStore } from '@/stores/tasks.js'
    import { useAuthStore } from '@/stores/useAuthStore.js'

    const store    = useTaskStore()
    const auth     = useAuthStore()

    onMounted(() => store.fetchTasks())

    const expandedChart = ref(null)
    const openModal = (key) => { expandedChart.value = key }
    const closeModal = () => { expandedChart.value = null }

    const showReport = ref(false)
    const showIndividualReport = ref(false)
    const showUnitPicker = ref(false)
    const showIndividualPicker = ref(false)
    const unitMonth = ref(new Date().getMonth() + 1)
    const unitYear  = ref(new Date().getFullYear())
    const indivMonth   = ref(new Date().getMonth() + 1)
    const indivYear    = ref(new Date().getFullYear())
    const indivDateFrom = ref('')
    const indivDateTo   = ref('')

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // ── Helpers ────────────────────────────────────────────────
    // Use the deadline (user-set) to bucket tasks, fall back to creation date
    const taskMonth = (t) => {
      const d = t.endDate || t.to || t.startDate || t.from
      return d ? new Date(d).getMonth() : -1
    }
    const taskYear = (t) => {
      const d = t.endDate || t.to || t.startDate || t.from
      return d ? new Date(d).getFullYear() : -1
    }
    const statusOf = (t) => {
      if (t.director || t.unitHead) return 'Approved'
      if (t.revision)  return 'Revision'
      return 'Pending'
    }

    // ── Bar Chart: counts per status ───────────────────────────
    const STATUS_COLORS = { Approved: '#16a34a', Pending: '#eab308', Revision: '#ea580c' }
    const barCounts = computed(() => {
      const counts = { Approved: 0, Pending: 0, Revision: 0 }
      store.tasks.forEach(t => { const s = statusOf(t); if (s in counts) counts[s]++ })
      return counts
    })
    const barTicks   = computed(() => niceTicks(Math.max(...Object.values(barCounts.value), 0)))
    const barTickTop = computed(() => barTicks.value[barTicks.value.length - 1] || 1)
    const barTickPos = computed(() =>
      barTicks.value.map(v => ({ v, y: Math.round(200 - (v / barTickTop.value) * 190) }))
    )
    const barData = computed(() =>
      Object.entries(barCounts.value).map(([label, count]) => ({
        label, count, color: STATUS_COLORS[label],
      }))
    )
    // chart area y: 10–200, height 190
    const barRects = computed(() => {
      const total = barData.value.reduce((sum, d) => sum + d.count, 0) || 1
      const n = barData.value.length
      const chartW = 450   // x: 40–490
      const barW   = Math.min(65, Math.floor(chartW / n * 0.55))
      const slot   = chartW / n
      return barData.value.map((d, i) => {
        const h = (d.count / barTickTop.value) * 190
        const cx = 40 + slot * i + slot / 2
        return { ...d, x: cx - barW / 2, cx, barW, y: 200 - h, height: h, rate: Math.round((d.count / total) * 100) }
      })
    })

    // ── Pie Chart: raw counts ──────────────────────────────────
    const pieHasData = computed(() => store.tasks.length > 0)
    const pieData = computed(() => {
      const counts = { Approved: 0, Pending: 0, Revision: 0 }
      store.tasks.forEach(t => { const s = statusOf(t); if (s in counts) counts[s]++ })
      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
      return Object.entries(counts).map(([label, count]) => ({
        label,
        count,
        pct: Math.round((count / total) * 100),
        color: STATUS_COLORS[label],
      }))
    })
    const pieSegments = computed(() => {
      let start = -Math.PI / 2
      const total = pieData.value.reduce((a, d) => a + d.pct, 0) || 1
      return pieData.value.map(d => {
        // When one segment is 100%, SVG arc can't draw a full circle — use a circle element flag instead
        const pct   = d.pct / total
        const isFull = pct >= 0.9999
        const angle = pct * 2 * Math.PI
        const end   = start + (isFull ? angle - 0.0001 : angle)
        const cx = 100, cy = 100, r = 80
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
        const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
        const mid = start + angle / 2
        const lx  = cx + 54 * Math.cos(mid)
        const ly  = cy + 54 * Math.sin(mid)
        const path = isFull
          ? null  // signal to use <circle> instead
          : `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`
        start = start + angle
        return { ...d, path, lx, ly, isFull, r, cx, cy }
      })
    })

    // ── Chart axis helper ──────────────────────────────────────
    const niceTicks = (maxVal, n = 4) => {
      if (maxVal <= 0) return [0, 1, 2, 3, 4]
      if (maxVal <= n) return Array.from({ length: n + 1 }, (_, i) => i)
      const rough = maxVal / n
      const exp   = Math.pow(10, Math.floor(Math.log10(rough)))
      const step  = Math.ceil(rough / exp) * exp
      return Array.from({ length: n + 1 }, (_, i) => i * step)
    }

    // ── Line Chart: completed tasks per month ──────────────────
    const lineRaw = computed(() => {
      const counts = Array(12).fill(0)
      const yr = new Date().getFullYear()
      store.tasks.filter(t => t.director && taskYear(t) === yr)
        .forEach(t => { const m = taskMonth(t); if (m >= 0) counts[m]++ })
      return counts
    })
    const lineTicks   = computed(() => niceTicks(Math.max(...lineRaw.value, 0)))
    const lineTickTop = computed(() => lineTicks.value[lineTicks.value.length - 1] || 1)
    const lineTickPos = computed(() =>
      lineTicks.value.map(v => ({ v, y: Math.round(185 - (v / lineTickTop.value) * 175) }))
    )
    const linePoints  = computed(() =>
      lineRaw.value.map((v, i) => ({
        x: 35 + (i / 11) * 455,
        y: 185 - (v / lineTickTop.value) * 175,
      }))
    )
    const linePolyline = computed(() => linePoints.value.map(p => `${p.x},${p.y}`).join(' '))

    // ── Area Chart: per-status counts by month ─────────────────
    const areaSeriesData = computed(() => {
      const yr  = new Date().getFullYear()
      const def = { Pending: '#eab308', Revision: '#ea580c' }
      const buckets = {}
      Object.keys(def).forEach(k => { buckets[k] = Array(12).fill(0) })
      store.tasks.filter(t => taskYear(t) === yr).forEach(t => {
        const m = taskMonth(t); if (m < 0) return
        const s = statusOf(t); if (s in buckets) buckets[s][m]++
      })
      return Object.entries(def).map(([key, color]) => ({ key, color, data: buckets[key] }))
    })
    const areaYMax    = computed(() => Math.max(...areaSeriesData.value.flatMap(s => s.data), 0))
    const areaTicks   = computed(() => niceTicks(areaYMax.value))
    const areaTickTop = computed(() => areaTicks.value[areaTicks.value.length - 1] || 1)
    const areaTickPos = computed(() =>
      areaTicks.value.map(v => ({ v, y: Math.round(175 - (v / areaTickTop.value) * 165) }))
    )
    const areaSeries  = computed(() =>
      areaSeriesData.value.map(s => {
        const top = areaTickTop.value
        const pts = s.data.map((v, i) => ({
          x: 35 + (i / 11) * 455,
          y: 175 - (v / top) * 165,
        }))
        const areaPath = `M35,175 ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L490,175 Z`
        const linePath = `M${pts[0].x},${pts[0].y} ` + pts.slice(1).map(p => `L${p.x},${p.y}`).join(' ')
        return { ...s, pts, areaPath, linePath }
      })
    )
    </script>

    <template>
    <div class="flex w-full h-full bg-gray-50 p-4 gap-4 overflow-auto">

        <!-- ── Left: Accomplishment Report Generator ── -->
        <div class="w-52 flex-shrink-0 bg-white rounded-xl shadow-sm p-5 flex flex-col gap-4">
        <div>
            <h2 class="text-base font-extrabold text-gray-900 leading-snug mb-3">
            Accomplishment<br />Report Generator
            </h2>
            <p class="text-xs text-gray-600 leading-relaxed">
            The Accomplishment Report is a track record that contains all tasks you performed.
            This is the proof of your activity within the organisation.
            </p>
        </div>

        <div>
            <p class="text-xs font-semibold text-gray-700 mb-1">Note:</p>
            <ul class="text-xs text-gray-600 space-y-2 list-disc list-outside pl-4">
            <li>Tasks that are tagged as Pending will not appear in your Accomplishment Report.</li>
            <li>It doesn't include the signature of your Division Chief.</li>
            </ul>
        </div>

        <div class="mt-auto flex flex-col gap-2">
            <button
            class="w-full py-2.5 px-3 bg-green-950 text-white text-xs font-semibold rounded-lg hover:bg-green-800 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            @click="showUnitPicker = true">
            <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Unit Report
            </button>
            <button
            class="w-full py-2.5 px-3 bg-white text-green-950 text-xs font-semibold rounded-lg border-2 border-green-950 hover:bg-green-50 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            @click="showIndividualPicker = true">
            <svg class="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Individual Report
            </button>
        </div>
        </div>

        <!-- ── Right: 2×2 Chart Grid ── -->
        <div class="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0">

        <!-- Bar Chart: Completion Rate -->
        <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col relative">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-xs font-semibold text-gray-700">Completion Rate</h3>
              <button class="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer" @click="openModal('bar')">
                <Icons icon="fullscreen" class="w-4 h-4" />
              </button>
            </div>
            <div class="flex-1 min-h-0">
            <svg viewBox="0 0 500 245" class="w-full h-full">
                <!-- Axes -->
                <line x1="40" y1="10" x2="40"  y2="200" stroke="#d1d5db" stroke-width="1" />
                <line x1="40" y1="200" x2="490" y2="200" stroke="#d1d5db" stroke-width="1" />
                <!-- Grid lines (dynamic) -->
                <line v-for="t in barTickPos.slice(1)" :key="'bg'+t.v" x1="40" :y1="t.y" x2="490" :y2="t.y" stroke="#f3f4f6" stroke-width="1" />
                <!-- Y labels (dynamic) -->
                <text v-for="t in barTickPos" :key="'by'+t.v" x="35" :y="t.y + 3" text-anchor="end" font-size="9" fill="#9ca3af">{{ t.v }}</text>
                <!-- Bars -->
                <rect v-for="b in barRects" :key="b.label"
                :x="b.x" :y="b.y" :width="b.barW" :height="b.height" :fill="b.color" rx="2" />
                <!-- Count label above each bar -->
                <text v-for="b in barRects" :key="'cnt'+b.label"
                :x="b.cx" :y="b.count > 0 ? b.y - 5 : 196" text-anchor="middle" font-size="9" font-weight="600" fill="#374151">{{ b.count }}</text>
                <!-- X labels -->
                <text v-for="b in barRects" :key="'lbl'+b.label"
                :x="b.cx" y="217" text-anchor="middle" font-size="9" fill="#6b7280">{{ b.label }}</text>
                <!-- X axis title -->
                <text x="265" y="234" text-anchor="middle" font-size="10" font-weight="bold" fill="#374151">Tasks</text>
            </svg>
            </div>
        </div>

        <!-- Pie Chart: Task Distribution -->
        <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col relative">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-xs font-semibold text-gray-700">Task Distribution</h3>
              <button class="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer" @click="openModal('pie')">
                <Icons icon="fullscreen" class="w-4 h-4" />
              </button>
            </div>
            <div class="flex-1 flex items-center justify-center gap-6 min-h-0">
            <svg viewBox="0 0 200 200" class="h-full max-h-52 flex-shrink-0">
                <!-- Empty state: gray circle with 0% -->
                <circle v-if="!pieHasData" cx="100" cy="100" r="80" fill="#e5e7eb" />
                <text v-if="!pieHasData" x="100" y="107" text-anchor="middle" font-size="14" fill="#9ca3af">0%</text>
                <!-- Real segments -->
                <template v-for="seg in pieSegments" :key="seg.label">
                  <circle v-if="seg.isFull" :cx="seg.cx" :cy="seg.cy" :r="seg.r" :fill="seg.color" />
                  <path v-else :d="seg.path" :fill="seg.color" stroke="white" stroke-width="1.5" />
                </template>
                <template v-for="seg in pieSegments" :key="'v'+seg.label">
                  <text v-if="seg.count > 0"
                    :x="seg.lx" :y="seg.ly - 4" text-anchor="middle" font-size="9" font-weight="bold" fill="white" class="pointer-events-none">
                  {{ seg.count }}
                  </text>
                </template>
                <template v-for="seg in pieSegments" :key="'p'+seg.label">
                  <text v-if="seg.count > 0"
                    :x="seg.lx" :y="seg.ly + 6" text-anchor="middle" font-size="8" fill="white" class="pointer-events-none">
                  ({{ seg.pct }}%)
                  </text>
                </template>
            </svg>
            <div class="flex flex-col gap-2.5">
                <div v-for="d in pieData" :key="d.label" class="flex items-center gap-2 text-xs text-gray-700">
                <span class="w-3 h-3 rounded-sm flex-shrink-0" :style="{ background: d.color }"></span>
                {{ d.label }}
                </div>
            </div>
            </div>
        </div>

        <!-- Line Chart: Completed tasks trend monthly -->
        <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col relative">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-xs font-semibold text-gray-700">Completed tasks trend monthly</h3>
              <button class="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer" @click="openModal('line')">
                <Icons icon="fullscreen" class="w-4 h-4" />
              </button>
            </div>
            <div class="flex-1 min-h-0">
            <svg viewBox="0 0 500 215" class="w-full h-full">
                <!-- Axes -->
                <line x1="35" y1="10"  x2="35"  y2="185" stroke="#d1d5db" stroke-width="1" />
                <line x1="35" y1="185" x2="495" y2="185" stroke="#d1d5db" stroke-width="1" />
                <!-- Grid lines (dynamic) -->
                <line v-for="t in lineTickPos.slice(1)" :key="'lg'+t.v" x1="35" :y1="t.y" x2="495" :y2="t.y" stroke="#f3f4f6" stroke-width="1" />
                <!-- Y labels (dynamic) -->
                <text v-for="t in lineTickPos" :key="'ly'+t.v" x="30" :y="t.y + 3" text-anchor="end" font-size="8" fill="#9ca3af">{{ t.v }}</text>
                <!-- Line -->
                <polyline :points="linePolyline" fill="none" stroke="#16a34a" stroke-width="2" />
                <!-- Dots -->
                <circle v-for="(p, i) in linePoints" :key="i"
                :cx="p.x" :cy="p.y" r="3" fill="#16a34a" stroke="#16a34a" stroke-width="2" fill-opacity="0.35" />
                <!-- X labels -->
                <text v-for="(m, i) in monthLabels" :key="m"
                :x="35 + (i / 11) * 455" y="200" text-anchor="middle" font-size="8" fill="#6b7280">{{ m }}</text>
            </svg>
            </div>
        </div>

        <!-- Area Chart: Pending & Revision Monthly Trend -->
        <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col relative">
            <div class="flex items-center justify-between mb-1">
              <h3 class="text-xs font-semibold text-gray-700">Pending & Revision Monthly Trend</h3>
              <button class="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer" @click="openModal('area')">
                <Icons icon="fullscreen" class="w-4 h-4" />
              </button>
            </div>
            <div class="flex-1 min-h-0">
            <svg viewBox="0 0 500 200" class="w-full h-full">
                <!-- Axes -->
                <line x1="35" y1="10"  x2="35"  y2="175" stroke="#d1d5db" stroke-width="1" />
                <line x1="35" y1="175" x2="495" y2="175" stroke="#d1d5db" stroke-width="1" />
                <!-- Grid lines (dynamic) -->
                <line v-for="t in areaTickPos.slice(1)" :key="'ag'+t.v" x1="35" :y1="t.y" x2="495" :y2="t.y" stroke="#f3f4f6" stroke-width="1" />
                <!-- Y labels (dynamic) -->
                <text v-for="t in areaTickPos" :key="'ay'+t.v" x="30" :y="t.y + 3" text-anchor="end" font-size="8" fill="#9ca3af">{{ t.v }}</text>
                <!-- Area fills -->
                <path v-for="s in areaSeries" :key="'a'+s.key"
                :d="s.areaPath" :fill="s.color" fill-opacity="0.22" />
                <!-- Lines on top -->
                <path v-for="s in areaSeries" :key="'l'+s.key"
                :d="s.linePath" fill="none" :stroke="s.color" stroke-width="2" stroke-opacity="0.35" />
                <!-- Dots -->
                <template v-for="s in areaSeries" :key="'d'+s.key">
                <circle v-for="(p, i) in s.pts" :key="i"
                    :cx="p.x" :cy="p.y" r="3" fill="white" :stroke="s.color" stroke-width="1.5" stroke-opacity="0.35" />
                </template>
                <!-- X labels -->
                <text v-for="(m, i) in monthLabels" :key="m"
                :x="35 + (i / 11) * 455" y="190" text-anchor="middle" font-size="8" fill="#6b7280">{{ m }}</text>
            </svg>
            </div>
            <!-- Legend -->
            <div class="flex gap-4 justify-center flex-wrap text-xs text-gray-700 flex-shrink-0 mt-1 pb-1">
            <div v-for="s in areaSeriesData" :key="s.key" class="flex items-center gap-1.5">
                <span class="w-5 h-2.5 rounded-sm flex-shrink-0" :style="{ background: s.color }"></span>
                {{ s.key }}
            </div>
            </div>
        </div>

        </div>
    </div>

    <!-- ── Accomplishment Report Modals ── -->
    <ReportPicker v-if="showUnitPicker" title="Generate Unit Report"
        @cancel="showUnitPicker = false"
        @generate="({ month, year }) => { unitMonth = month; unitYear = year; showUnitPicker = false; showReport = true }" />
    <ReportPicker v-if="showIndividualPicker" title="Generate Individual Report" :payroll="true"
        @cancel="showIndividualPicker = false"
        @generate="({ dateFrom, dateTo, month, year }) => { indivDateFrom = dateFrom; indivDateTo = dateTo; indivMonth = month; indivYear = year; showIndividualPicker = false; showIndividualReport = true }" />
    <AccomplishmentReport :show="showReport" :month="unitMonth" :year="unitYear" @close="showReport = false" />
    <IndividualAccomplishmentReport :show="showIndividualReport" :month="indivMonth" :year="indivYear" :dateFrom="indivDateFrom" :dateTo="indivDateTo" :userName="auth.fullName" @close="showIndividualReport = false" />

    <!-- ── Expanded Chart View (component) ── -->
    <AnalyticsChart
        :expandedChart="expandedChart"
        :barRects="barRects"
        :barData="barData"
        :pieSegments="pieSegments"
        :pieData="pieData"
        :linePolyline="linePolyline"
        :linePoints="linePoints"
        :lineRaw="lineRaw"
        :monthLabels="monthLabels"
        :areaSeries="areaSeries"
        :areaSeriesData="areaSeriesData"
        :barTickPos="barTickPos"
        :lineTickPos="lineTickPos"
        :areaTickPos="areaTickPos"
        @close="closeModal"
    />

    </template>
