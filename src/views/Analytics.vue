    <script setup>
    import { ref, computed } from 'vue'
    import Icons from '@/components/Icons.vue'
    import AnalyticsChart from '@/components/AnalyticsChart.vue'
    import AccomplishmentReport from '@/components/AccomplishmentReport.vue'

    const expandedChart = ref(null)
    const openModal = (key) => { expandedChart.value = key }
    const closeModal = () => { expandedChart.value = null }

    const showReport = ref(false)

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // ── Bar Chart ──────────────────────────────────────────────
    const barData = [
    { label: 'Approved',  value: 50,  color: '#16a34a' },
    { label: 'Pending',   value: 25,  color: '#eab308' },
    { label: 'Completed', value: 80,  color: '#7b1c1c' },
    { label: 'Revision',  value: 100, color: '#ea580c' },
    ]
    // chart area y: 10–200, height 190, max 100
    const barRects = computed(() =>
    barData.map((d, i) => {
        const h = (d.value / 100) * 190
        return { ...d, x: 65 + i * 110, y: 200 - h, height: h }
    })
    )

    // ── Pie Chart ──────────────────────────────────────────────
    const pieData = [
    { label: 'Approved',  value: 40, color: '#16a34a' },
    { label: 'Pending',   value: 20, color: '#eab308' },
    { label: 'Completed', value: 30, color: '#ea580c' },
    { label: 'Revision',  value: 10, color: '#7b1c1c' },
    ]
    const pieSegments = computed(() => {
    let start = -Math.PI / 2
    return pieData.map(d => {
        const angle = (d.value / 100) * 2 * Math.PI
        const end   = start + angle
        const cx = 100, cy = 100, r = 80
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
        const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end)
        const mid = start + angle / 2
        const lx  = cx + 54 * Math.cos(mid)
        const ly  = cy + 54 * Math.sin(mid)
        const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${angle > Math.PI ? 1 : 0} 1 ${x2},${y2} Z`
        start = end
        return { ...d, path, lx, ly }
    })
    })

    // ── Line Chart ─────────────────────────────────────────────
    const lineRaw = [750, 700, 720, 650, 700, 900, 950, 850, 800, 1000, 750, 800]
    // chart area: x 35–490, y 10–185, max 1100
    const linePoints = computed(() =>
    lineRaw.map((v, i) => ({
        x: 35 + (i / 11) * 455,
        y: 185 - (v / 1100) * 175,
    }))
    )
    const linePolyline = computed(() => linePoints.value.map(p => `${p.x},${p.y}`).join(' '))

    // ── Area Chart ─────────────────────────────────────────────
    const areaSeriesData = [
    { key: 'Approved',  color: '#16a34a', data: [600, 550, 700, 800, 750, 900, 850, 700, 650, 800, 750, 900] },
    { key: 'Pending',   color: '#eab308', data: [300, 250, 200, 350, 400, 300, 350, 280, 300, 400, 350, 300] },
    { key: 'Completed', color: '#ea580c', data: [500, 600, 650, 700, 800, 750, 700, 800, 750, 900, 850, 800] },
    { key: 'Revision',  color: '#7b1c1c', data: [200, 300, 250, 400, 350, 450, 400, 350, 500, 600, 550, 700] },
    ]
    // chart area: x 35–490, y 10–175, max 1100
    const areaSeries = computed(() =>
    areaSeriesData.map(s => {
        const pts = s.data.map((v, i) => ({
        x: 35 + (i / 11) * 455,
        y: 175 - (v / 1100) * 165,
        }))
        const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
        const areaPath = `M35,175 ` + pts.map(p => `L${p.x},${p.y}`).join(' ') + ` L490,175 Z`
        const linePath = `M${pts[0].x},${pts[0].y} ` + pts.slice(1).map(p => `L${p.x},${p.y}`).join(' ')
        return { ...s, pts, polyline, areaPath, linePath }
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

        <div class="mt-auto">
            <button
            class="w-full py-2.5 bg-green-950 text-white text-sm font-bold rounded-lg hover:bg-green-800 transition-colors cursor-pointer"
            @click="showReport = true">
            Generate Report
            </button>
        </div>
        </div>

        <!-- ── Right: 2×2 Chart Grid ── -->
        <div class="flex-1 grid grid-cols-2 grid-rows-2 gap-4 min-h-0">

        <!-- Bar Chart: Completion Rate -->
        <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col relative">
            <h3 class="text-xs font-semibold text-gray-700 mb-1">Completion Rate</h3>
            <div class="flex-1 min-h-0">
            <svg viewBox="0 0 500 245" class="w-full h-full">
                <!-- Axes -->
                <line x1="40" y1="10" x2="40"  y2="200" stroke="#d1d5db" stroke-width="1" />
                <line x1="40" y1="200" x2="490" y2="200" stroke="#d1d5db" stroke-width="1" />
                <!-- Grid lines at 25, 50, 75, 100 -->
                <line x1="40" y1="153" x2="490" y2="153" stroke="#f3f4f6" stroke-width="1" />
                <line x1="40" y1="105" x2="490" y2="105" stroke="#f3f4f6" stroke-width="1" />
                <line x1="40" y1="58"  x2="490" y2="58"  stroke="#f3f4f6" stroke-width="1" />
                <line x1="40" y1="10"  x2="490" y2="10"  stroke="#f3f4f6" stroke-width="1" />
                <!-- Y labels -->
                <text x="35" y="204" text-anchor="end" font-size="9" fill="#9ca3af">0</text>
                <text x="35" y="157" text-anchor="end" font-size="9" fill="#9ca3af">25</text>
                <text x="35" y="109" text-anchor="end" font-size="9" fill="#9ca3af">50</text>
                <text x="35" y="62"  text-anchor="end" font-size="9" fill="#9ca3af">75</text>
                <text x="35" y="14"  text-anchor="end" font-size="9" fill="#9ca3af">100</text>
                <!-- Bars -->
                <rect v-for="b in barRects" :key="b.label"
                :x="b.x" :y="b.y" width="65" :height="b.height" :fill="b.color" rx="2" />
                <!-- X labels -->
                <text v-for="b in barRects" :key="'lbl'+b.label"
                :x="b.x + 32" y="217" text-anchor="middle" font-size="9" fill="#6b7280">{{ b.label }}</text>
                <!-- X axis title -->
                <text x="265" y="234" text-anchor="middle" font-size="10" font-weight="bold" fill="#374151">Tasks</text>
            </svg>
            </div>
            <button class="absolute bottom-3 right-3 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer" @click="openModal('bar')">
            <Icons icon="fullscreen" class="w-4 h-4" />
            </button>
        </div>

        <!-- Pie Chart: Task Distribution -->
        <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col relative">
            <h3 class="text-xs font-semibold text-gray-700 mb-1">Task Distribution</h3>
            <div class="flex-1 flex items-center justify-center gap-6 min-h-0">
            <svg viewBox="0 0 200 200" class="h-full max-h-52 flex-shrink-0">
                <path v-for="seg in pieSegments" :key="seg.label"
                :d="seg.path" :fill="seg.color" stroke="white" stroke-width="1.5" />
                <text v-for="seg in pieSegments" :key="'v'+seg.label"
                :x="seg.lx" :y="seg.ly - 4" text-anchor="middle" font-size="9" font-weight="bold" fill="white">
                {{ seg.value }}
                </text>
                <text v-for="seg in pieSegments" :key="'p'+seg.label"
                :x="seg.lx" :y="seg.ly + 6" text-anchor="middle" font-size="8" fill="white">
                ({{ seg.value }}%)
                </text>
            </svg>
            <div class="flex flex-col gap-2.5">
                <div v-for="d in pieData" :key="d.label" class="flex items-center gap-2 text-xs text-gray-700">
                <span class="w-3 h-3 rounded-sm flex-shrink-0" :style="{ background: d.color }"></span>
                {{ d.label }}
                </div>
            </div>
            </div>
            <button class="absolute bottom-3 right-3 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer" @click="openModal('pie')">
            <Icons icon="fullscreen" class="w-4 h-4" />
            </button>
        </div>

        <!-- Line Chart: Completed tasks trend monthly -->
        <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col relative">
            <h3 class="text-xs font-semibold text-gray-700 mb-1">Completed tasks trend monthly</h3>
            <div class="flex-1 min-h-0">
            <svg viewBox="0 0 500 215" class="w-full h-full">
                <!-- Axes -->
                <line x1="35" y1="10"  x2="35"  y2="185" stroke="#d1d5db" stroke-width="1" />
                <line x1="35" y1="185" x2="495" y2="185" stroke="#d1d5db" stroke-width="1" />
                <!-- Grid lines -->
                <line x1="35" y1="145" x2="495" y2="145" stroke="#f3f4f6" stroke-width="1" />
                <line x1="35" y1="106" x2="495" y2="106" stroke="#f3f4f6" stroke-width="1" />
                <line x1="35" y1="66"  x2="495" y2="66"  stroke="#f3f4f6" stroke-width="1" />
                <line x1="35" y1="26"  x2="495" y2="26"  stroke="#f3f4f6" stroke-width="1" />
                <!-- Y labels -->
                <text x="30" y="189" text-anchor="end" font-size="8" fill="#9ca3af">0</text>
                <text x="30" y="149" text-anchor="end" font-size="8" fill="#9ca3af">250</text>
                <text x="30" y="110" text-anchor="end" font-size="8" fill="#9ca3af">500</text>
                <text x="30" y="70"  text-anchor="end" font-size="8" fill="#9ca3af">750</text>
                <text x="30" y="30"  text-anchor="end" font-size="8" fill="#9ca3af">1000</text>
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
            <button class="absolute bottom-3 right-3 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer" @click="openModal('line')">
            <Icons icon="fullscreen" class="w-4 h-4" />
            </button>
        </div>

        <!-- Area Chart: Tasks completion by type monthly trend -->
        <div class="bg-white rounded-xl shadow-sm p-4 flex flex-col relative">
            <h3 class="text-xs font-semibold text-gray-700 mb-1">Tasks completion by type monthly trend</h3>
            <div class="flex-1 min-h-0">
            <svg viewBox="0 0 500 200" class="w-full h-full">
                <!-- Axes -->
                <line x1="35" y1="10"  x2="35"  y2="175" stroke="#d1d5db" stroke-width="1" />
                <line x1="35" y1="175" x2="495" y2="175" stroke="#d1d5db" stroke-width="1" />
                <!-- Grid lines -->
                <line x1="35" y1="138" x2="495" y2="138" stroke="#f3f4f6" stroke-width="1" />
                <line x1="35" y1="100" x2="495" y2="100" stroke="#f3f4f6" stroke-width="1" />
                <line x1="35" y1="63"  x2="495" y2="63"  stroke="#f3f4f6" stroke-width="1" />
                <line x1="35" y1="25"  x2="495" y2="25"  stroke="#f3f4f6" stroke-width="1" />
                <!-- Y labels -->
                <text x="30" y="178" text-anchor="end" font-size="8" fill="#9ca3af">0</text>
                <text x="30" y="141" text-anchor="end" font-size="8" fill="#9ca3af">250</text>
                <text x="30" y="103" text-anchor="end" font-size="8" fill="#9ca3af">500</text>
                <text x="30" y="66"  text-anchor="end" font-size="8" fill="#9ca3af">750</text>
                <text x="30" y="28"  text-anchor="end" font-size="8" fill="#9ca3af">1000</text>
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
            <button class="absolute bottom-7 right-3 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer" @click="openModal('area')">
            <Icons icon="fullscreen" class="w-4 h-4" />
            </button>
        </div>

        </div>
    </div>

    <!-- ── Accomplishment Report Modal ── -->
    <AccomplishmentReport :show="showReport" @close="showReport = false" />

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
        @close="closeModal"
    />

    </template>
