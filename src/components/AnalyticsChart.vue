<script setup>
import { ref, computed } from 'vue'
import Icons from '@/components/Icons.vue'

const props = defineProps({
  expandedChart: { type: String, default: null },
  barRects: { type: Array, default: () => [] },
  barData: { type: Array, default: () => [] },
  pieSegments: { type: Array, default: () => [] },
  pieData: { type: Array, default: () => [] },
  linePolyline: { type: String, default: '' },
  linePoints: { type: Array, default: () => [] },
  lineRaw: { type: Array, default: () => [] },
  monthLabels: { type: Array, default: () => [] },
  areaSeries: { type: Array, default: () => [] },
  areaSeriesData: { type: Array, default: () => [] },
  barTickPos: { type: Array, default: () => [] },
  lineTickPos: { type: Array, default: () => [] },
  areaTickPos: { type: Array, default: () => [] },
})

// Area fills sorted so largest (lowest y peak) renders first (behind smaller series)
const areaFillOrder = computed(() =>
  [...props.areaSeries].sort((a, b) => {
    const aMin = Math.min(...a.pts.map(p => p.y))
    const bMin = Math.min(...b.pts.map(p => p.y))
    return aMin - bMin
  })
)

const emit = defineEmits(['close'])

// ── Tooltip state ──
const tooltip = ref({ show: false, x: 0, y: 0, content: '' })
const modalRef = ref(null)

function showTooltip(event, content) {
  tooltip.value = {
    show: true,
    x: event.clientX + 12,
    y: event.clientY - 8,
    content
  }
}
function hideTooltip() {
  tooltip.value.show = false
}
</script>

<template>
  <div v-if="expandedChart" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click.self="emit('close')">

    <!-- Tooltip (outside modal to avoid overflow-hidden clipping) -->
    <div v-if="tooltip.show"
      class="fixed z-[60] pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-pre-line"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', transform: 'translateY(-100%)' }">
      {{ tooltip.content }}
    </div>

    <div ref="modalRef" class="bg-white rounded-2xl shadow-2xl w-[80vw] h-[80vh] max-w-5xl mx-4 flex flex-col overflow-hidden relative">

      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
        <h2 class="text-sm font-bold text-gray-800">
          <span v-if="expandedChart === 'bar'">Completion Rate</span>
          <span v-else-if="expandedChart === 'pie'">Task Distribution</span>
          <span v-else-if="expandedChart === 'line'">Completed tasks trend monthly</span>
          <span v-else-if="expandedChart === 'area'">Pending & Revision Monthly Trend</span>
        </h2>
        <button class="cursor-pointer text-4xl text-gray-400 hover:text-gray-700 leading-none" @click="emit('close')">×</button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 min-h-0 p-6 flex items-center justify-center">

        <!-- Bar Chart -->
        <svg v-if="expandedChart === 'bar'" viewBox="0 0 500 245" class="w-full h-full">
          <line x1="40" y1="10" x2="40"  y2="200" stroke="#d1d5db" stroke-width="1" />
          <line x1="40" y1="200" x2="490" y2="200" stroke="#d1d5db" stroke-width="1" />
          <template v-for="t in barTickPos" :key="'bg'+t.v">
            <line v-if="t.y < 200" x1="40" :y1="t.y" x2="490" :y2="t.y" stroke="#f3f4f6" stroke-width="1" />
            <text x="35" :y="t.y + 4" text-anchor="end" font-size="9" fill="#9ca3af">{{ t.v }}</text>
          </template>
          <rect v-for="b in barRects" :key="b.label"
            :x="b.x" :y="b.y" :width="b.barW || 65" :height="b.height" :fill="b.color" rx="2"
            class="cursor-pointer transition-opacity duration-150 hover:opacity-80"
            @mouseenter="showTooltip($event, `${b.label}\nCount: ${b.count}\nRate: ${b.rate}%`)"
            @mousemove="showTooltip($event, `${b.label}\nCount: ${b.count}\nRate: ${b.rate}%`)"
            @mouseleave="hideTooltip" />
          <text v-for="b in barRects" :key="'cnt'+b.label"
            :x="b.cx || (b.x + 32)" :y="b.count > 0 ? b.y - 5 : 196" text-anchor="middle" font-size="9" font-weight="600" fill="#374151">{{ b.count }}</text>
          <text v-for="b in barRects" :key="'lbl'+b.label"
            :x="b.cx || (b.x + 32)" y="217" text-anchor="middle" font-size="9" fill="#6b7280">{{ b.label }}</text>
          <text x="265" y="234" text-anchor="middle" font-size="10" font-weight="bold" fill="#374151">Tasks</text>
        </svg>

        <!-- Pie Chart -->
        <div v-else-if="expandedChart === 'pie'" class="flex items-center justify-center gap-10 w-full h-full">
          <svg viewBox="0 0 200 200" class="h-full max-h-150">
            <path v-for="seg in pieSegments" :key="seg.label"
              :d="seg.path" :fill="seg.color" stroke="white" stroke-width="1.5"
              class="cursor-pointer transition-opacity duration-150 hover:opacity-80"
              @mouseenter="showTooltip($event, `${seg.label}\nCount: ${seg.count}\nShare: ${seg.pct}%`)"
              @mousemove="showTooltip($event, `${seg.label}\nCount: ${seg.count}\nShare: ${seg.pct}%`)"
              @mouseleave="hideTooltip" />
            <text v-for="seg in pieSegments" :key="'v'+seg.label"
              :x="seg.lx" :y="seg.ly - 4" text-anchor="middle" font-size="9" font-weight="bold" fill="white" class="pointer-events-none">{{ seg.count }}</text>
            <text v-for="seg in pieSegments" :key="'p'+seg.label"
              :x="seg.lx" :y="seg.ly + 6" text-anchor="middle" font-size="8" fill="white" class="pointer-events-none">({{ seg.pct }}%)</text>
          </svg>
          <div class="flex flex-col gap-4">
            <div v-for="d in pieData" :key="d.label" class="flex items-center gap-3 text-sm text-gray-700">
              <span class="w-4 h-4 rounded-sm flex-shrink-0" :style="{ background: d.color }"></span>
              {{ d.label }}
            </div>
          </div>
        </div>

        <!-- Line Chart -->
        <svg v-else-if="expandedChart === 'line'" viewBox="0 0 500 215" class="w-full h-full">
          <line x1="35" y1="10"  x2="35"  y2="185" stroke="#d1d5db" stroke-width="1" />
          <line x1="35" y1="185" x2="495" y2="185" stroke="#d1d5db" stroke-width="1" />
          <template v-for="t in lineTickPos" :key="'lg'+t.v">
            <line v-if="t.y < 185" x1="35" :y1="t.y" x2="495" :y2="t.y" stroke="#f3f4f6" stroke-width="1" />
            <text x="30" :y="t.y + 4" text-anchor="end" font-size="8" fill="#9ca3af">{{ t.v }}</text>
          </template>
          <polyline :points="linePolyline" fill="none" stroke="#16a34a" stroke-width="2" />
          <circle v-for="(p, i) in linePoints" :key="i"
            :cx="p.x" :cy="p.y" r="5" fill="#16a34a" stroke="#16a34a" stroke-width="2" fill-opacity="0.35"
            class="cursor-pointer transition-all duration-150 hover:r-[6]"
            @mouseenter="showTooltip($event, `${monthLabels[i]}\nCompleted: ${lineRaw[i]}`)"
            @mousemove="showTooltip($event, `${monthLabels[i]}\nCompleted: ${lineRaw[i]}`)"
            @mouseleave="hideTooltip" />
          <text v-for="(m, i) in monthLabels" :key="m"
            :x="35 + (i / 11) * 455" y="200" text-anchor="middle" font-size="8" fill="#6b7280">{{ m }}</text>
        </svg>

        <!-- Area Chart -->
        <div v-else-if="expandedChart === 'area'" class="flex flex-col w-full h-full">
          <svg viewBox="0 0 500 200" class="w-full flex-1 min-h-0">
            <line x1="35" y1="10"  x2="35"  y2="175" stroke="#d1d5db" stroke-width="1" />
            <line x1="35" y1="175" x2="495" y2="175" stroke="#d1d5db" stroke-width="1" />
            <template v-for="t in areaTickPos" :key="'ag'+t.v">
              <line v-if="t.y < 175" x1="35" :y1="t.y" x2="495" :y2="t.y" stroke="#f3f4f6" stroke-width="1" />
              <text x="30" :y="t.y + 4" text-anchor="end" font-size="8" fill="#9ca3af">{{ t.v }}</text>
            </template>
            <!-- Fills: largest first so smaller series stay visible on top -->
            <path v-for="s in areaFillOrder" :key="'a'+s.key" :d="s.areaPath" :fill="s.color" fill-opacity="0.22" />
            <!-- Lines: original order, always drawn above fills -->
            <path v-for="s in areaSeries" :key="'l'+s.key" :d="s.linePath" fill="none" :stroke="s.color" stroke-width="2" stroke-opacity="0.35" />
            <template v-for="s in areaSeries" :key="'d'+s.key">
              <circle v-for="(p, i) in s.pts" :key="i"
                :cx="p.x" :cy="p.y" r="5" fill="white" :stroke="s.color" stroke-width="1.5"
                class="cursor-pointer transition-all duration-150"
                @mouseenter="showTooltip($event, `${s.key}\n${monthLabels[i]}: ${areaSeriesData.find(a => a.key === s.key)?.data[i] ?? ''}`)"
                @mousemove="showTooltip($event, `${s.key}\n${monthLabels[i]}: ${areaSeriesData.find(a => a.key === s.key)?.data[i] ?? ''}`)"
                @mouseleave="hideTooltip" />
            </template>
            <text v-for="(m, i) in monthLabels" :key="m"
              :x="35 + (i / 11) * 455" y="190" text-anchor="middle" font-size="8" fill="#6b7280">{{ m }}</text>
          </svg>
          <div class="flex gap-6 justify-center flex-wrap text-sm text-gray-700 flex-shrink-0 pt-2">
            <div v-for="s in areaSeriesData" :key="s.key" class="flex items-center gap-2">
              <span class="w-6 h-3 rounded-sm flex-shrink-0" :style="{ background: s.color }"></span>
              {{ s.key }}
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
