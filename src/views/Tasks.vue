<script setup>
import AddTask from '@/components/AddTask.vue'
import ChartTasks from '@/components/ChartTasks.vue'
import GridTasks from '@/components/GridTasks.vue'
import Icons from '@/components/Icons.vue'
import TableTasks from '@/components/TableTasks.vue'
import { taskStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, onMounted, ref } from 'vue'

const store    = taskStore()
const auth     = useAuthStore()
const state    = ref('Grid View')
const addTask  = ref(false)
const search   = ref('')
const filter   = ref('All')
const sortBy   = ref('Recently Assigned')

// Debug role and unit information
const getRoleType = () => {
  if (auth.isDirector) return 'Director'
  if (auth.isUnitHead) return 'Unit Head'
  if (auth.isMember) return 'Member'
  if (auth.isAdmin) return 'Admin'
  return 'Unknown'
}

console.log('=== TASKS VIEW DEBUG ===')
console.log('Role ID:', auth.roleId)
console.log('Role Type:', getRoleType())
console.log('Unit ID:', auth.unitId)
console.log('Unit Name:', auth.unitName)
console.log('User ID:', auth.userID)
console.log('Total Tasks Loaded:', store.tasks.length)

// Additional logging for unit heads
if (auth.isUnitHead) {
  console.log('=== UNIT HEAD TASKS VIEW ===')
  const unitTasks = store.tasks.filter(t => {
    // Check if task assignee is in the same unit
    return store.unitMembers.some(m => m.id === t.assignee)
  })
  console.log('Tasks from unit members:', unitTasks.length)
  console.log('Unit members count:', store.unitMembers.length)
  console.log('=============================')
}
console.log('========================')

onMounted(() => store.fetchTasks())

const filterOpts = computed(() => {
  const base = ['All', 'Regular', 'Insertion', 'Urgent', 'Revision']
  if (auth.isDirector || auth.isUnitHead) base.push('Pending', 'Approved')
  return base
})

const sortOpts = ['Recently Assigned', 'Date Due', 'Name A→Z', 'Urgent First']

const filtered = computed(() => {
  let list = store.tasks
  const q = search.value.toLowerCase()
  if (q) list = list.filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.assigneeName?.toLowerCase().includes(q)
  )
  if (filter.value !== 'All') {
    const f = filter.value.toLowerCase()
    list = list.filter(t => {
      if (f === 'urgent')   return t.urgent
      if (f === 'revision') return t.revision
      if (f === 'regular')  return t.type?.toLowerCase() === 'regular'
      if (f === 'insertion')return t.type?.toLowerCase() === 'insertion'
      if (f === 'pending')  return !t.director
      if (f === 'approved') return t.director
      return true
    })
  }
  if (sortBy.value === 'Date Due')
    list = [...list].sort((a,b) => new Date(a.to) - new Date(b.to))
  else if (sortBy.value === 'Name A→Z')
    list = [...list].sort((a,b) => a.name.localeCompare(b.name))
  else if (sortBy.value === 'Urgent First')
    list = [...list].sort((a,b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))
  else
    list = [...list].sort((a,b) => new Date(b.from) - new Date(a.from))
  return list
})
</script>

<template>
  <div class="flex flex-col h-full min-h-0">

    <!-- ── Toolbar ── -->
    <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-10 py-4 flex-shrink-0">

      <!-- Add Task (director + unit head) -->
      <button v-if="auth.isDirector || auth.isUnitHead || auth.isMember"
        @click="addTask = true"
        class="flex items-center gap-2 bg-green-950 text-white font-bold h-11 px-5 rounded-2xl
               hover:bg-green-800 active:scale-95 transition-all text-sm flex-shrink-0">
        <Icons :icon="'add'" />
        <span class="hidden sm:inline">Add Task</span>
      </button>

      <!-- Search -->
      <div class="flex items-center rounded-2xl bg-white border border-gray-300 px-3
                  focus-within:border-green-800 focus-within:ring-2 focus-within:ring-green-800/20
                  transition-all flex-1 min-w-0 h-11">
        <Icons :icon="'search'" class="text-gray-400 flex-shrink-0" />
        <input v-model="search" type="text" placeholder="Search tasks…"
          class="ml-2 flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
      </div>

      <!-- Filter -->
      <select v-model="filter"
        class="h-11 px-3 rounded-2xl border border-gray-300 text-sm text-gray-700
               focus:outline-none focus:border-green-800 bg-white flex-shrink-0">
        <option v-for="o in filterOpts" :key="o" :value="o">{{ o }}</option>
      </select>

      <!-- Sort -->
      <select v-model="sortBy"
        class="h-11 px-3 rounded-2xl border border-gray-300 text-sm text-gray-700
               focus:outline-none focus:border-green-800 bg-white flex-shrink-0">
        <option v-for="o in sortOpts" :key="o" :value="o">{{ o }}</option>
      </select>

      <!-- Count -->
      <span class="text-xs text-gray-500 flex-shrink-0 hidden sm:block">
        {{ filtered.length }} task{{ filtered.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- ── View ── -->
    <div class="flex-1 overflow-auto bg-white mx-4 sm:mx-6 lg:mx-10 rounded-xl shadow-md min-h-0">
      <GridTasks  v-if="state === 'Grid View'"  :tasks="filtered" />
      <TableTasks v-else-if="state === 'Table View'" :tasks="filtered" />
      <ChartTasks v-else-if="state === 'Chart View'" :tasks="filtered" />
    </div>

    <!-- ── View toggle ── -->
    <div class="flex justify-center gap-3 py-3 flex-shrink-0">
      <button v-for="btn in ['Grid View','Table View','Chart View']" :key="btn"
        @click="state = btn"
        class="text-sm font-bold h-10 px-5 rounded-xl cursor-pointer transition-all"
        :class="state === btn
          ? 'bg-green-950 text-white'
          : 'outline outline-2 outline-green-950 text-green-950 bg-white hover:bg-green-950 hover:text-white'">
        {{ btn }}
      </button>
    </div>

  </div>

  <!-- ── Add Task Modal ── -->
  <Transition name="modal">
    <div v-if="addTask"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="addTask = false">
      <AddTask @close="addTask = false; store.fetchTasks()" />
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active { animation: modalIn  0.25s cubic-bezier(.16,1,.3,1) both }
.modal-leave-active { animation: modalOut 0.15s ease both }
@keyframes modalIn  { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
@keyframes modalOut { from { opacity:1 } to { opacity:0; transform:scale(0.96) } }
</style>