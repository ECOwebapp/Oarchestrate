<script setup vapor>
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
})

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
          <span v-else-if="expandedChart === 'area'">Tasks completion by type monthly trend</span>
        </h2>
        <button class="cursor-pointer text-4xl text-gray-400 hover:text-gray-700 leading-none" @click="emit('close')">×</button>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 min-h-0 p-6 flex items-center justify-center">

        <!-- Bar Chart -->
        <svg v-if="expandedChart === 'bar'" viewBox="0 0 500 245" class="w-full h-full">
          <line x1="40" y1="10" x2="40"  y2="200" stroke="#d1d5db" stroke-width="1" />
          <line x1="40" y1="200" x2="490" y2="200" stroke="#d1d5db" stroke-width="1" />
          <line x1="40" y1="153" x2="490" y2="153" stroke="#f3f4f6" stroke-width="1" />
          <line x1="40" y1="105" x2="490" y2="105" stroke="#f3f4f6" stroke-width="1" />
          <line x1="40" y1="58"  x2="490" y2="58"  stroke="#f3f4f6" stroke-width="1" />
          <line x1="40" y1="10"  x2="490" y2="10"  stroke="#f3f4f6" stroke-width="1" />
          <text x="35" y="204" text-anchor="end" font-size="9" fill="#9ca3af">0</text>
          <text x="35" y="157" text-anchor="end" font-size="9" fill="#9ca3af">25</text>
          <text x="35" y="109" text-anchor="end" font-size="9" fill="#9ca3af">50</text>
          <text x="35" y="62"  text-anchor="end" font-size="9" fill="#9ca3af">75</text>
          <text x="35" y="14"  text-anchor="end" font-size="9" fill="#9ca3af">100</text>
          <rect v-for="b in barRects" :key="b.label"
            :x="b.x" :y="b.y" width="65" :height="b.height" :fill="b.color" rx="2"
            class="cursor-pointer transition-opacity duration-150 hover:opacity-80"
            @mouseenter="showTooltip($event, `${b.label}\nValue: ${b.value}\nRate: ${b.value}%`)"
            @mousemove="showTooltip($event, `${b.label}\nValue: ${b.value}\nRate: ${b.value}%`)"
            @mouseleave="hideTooltip" />
          <text v-for="b in barRects" :key="'lbl'+b.label"
            :x="b.x + 32" y="217" text-anchor="middle" font-size="9" fill="#6b7280">{{ b.label }}</text>
          <text x="265" y="234" text-anchor="middle" font-size="10" font-weight="bold" fill="#374151">Tasks</text>
        </svg>

        <!-- Pie Chart -->
        <div v-else-if="expandedChart === 'pie'" class="flex items-center justify-center gap-10 w-full h-full">
          <svg viewBox="0 0 200 200" class="h-full max-h-150">
            <path v-for="seg in pieSegments" :key="seg.label"
              :d="seg.path" :fill="seg.color" stroke="white" stroke-width="1.5"
              class="cursor-pointer transition-opacity duration-150 hover:opacity-80"
              @mouseenter="showTooltip($event, `${seg.label}\nCount: ${seg.value}\nShare: ${seg.value}%`)"
              @mousemove="showTooltip($event, `${seg.label}\nCount: ${seg.value}\nShare: ${seg.value}%`)"
              @mouseleave="hideTooltip" />
            <text v-for="seg in pieSegments" :key="'v'+seg.label"
              :x="seg.lx" :y="seg.ly - 4" text-anchor="middle" font-size="9" font-weight="bold" fill="white" class="pointer-events-none">{{ seg.value }}</text>
            <text v-for="seg in pieSegments" :key="'p'+seg.label"
              :x="seg.lx" :y="seg.ly + 6" text-anchor="middle" font-size="8" fill="white" class="pointer-events-none">({{ seg.value }}%)</text>
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
          <line x1="35" y1="145" x2="495" y2="145" stroke="#f3f4f6" stroke-width="1" />
          <line x1="35" y1="106" x2="495" y2="106" stroke="#f3f4f6" stroke-width="1" />
          <line x1="35" y1="66"  x2="495" y2="66"  stroke="#f3f4f6" stroke-width="1" />
          <line x1="35" y1="26"  x2="495" y2="26"  stroke="#f3f4f6" stroke-width="1" />
          <text x="30" y="189" text-anchor="end" font-size="8" fill="#9ca3af">0</text>
          <text x="30" y="149" text-anchor="end" font-size="8" fill="#9ca3af">250</text>
          <text x="30" y="110" text-anchor="end" font-size="8" fill="#9ca3af">500</text>
          <text x="30" y="70"  text-anchor="end" font-size="8" fill="#9ca3af">750</text>
          <text x="30" y="30"  text-anchor="end" font-size="8" fill="#9ca3af">1000</text>
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
            <line x1="35" y1="138" x2="495" y2="138" stroke="#f3f4f6" stroke-width="1" />
            <line x1="35" y1="100" x2="495" y2="100" stroke="#f3f4f6" stroke-width="1" />
            <line x1="35" y1="63"  x2="495" y2="63"  stroke="#f3f4f6" stroke-width="1" />
            <line x1="35" y1="25"  x2="495" y2="25"  stroke="#f3f4f6" stroke-width="1" />
            <text x="30" y="178" text-anchor="end" font-size="8" fill="#9ca3af">0</text>
            <text x="30" y="141" text-anchor="end" font-size="8" fill="#9ca3af">250</text>
            <text x="30" y="103" text-anchor="end" font-size="8" fill="#9ca3af">500</text>
            <text x="30" y="66"  text-anchor="end" font-size="8" fill="#9ca3af">750</text>
            <text x="30" y="28"  text-anchor="end" font-size="8" fill="#9ca3af">1000</text>
            <path v-for="s in areaSeries" :key="'a'+s.key" :d="s.areaPath" :fill="s.color" fill-opacity="0.22" />
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
