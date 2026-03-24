<script setup vapor>
import { ref, onMounted, onUnmounted, h } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import ManageMembership from '@/components/ManageMembership.vue'
import OrgCard from '@/components/OrgCard.vue' // Adjust path as needed

const role = useAuthStore().isDirector
const zoomLevel = ref(1)

const handleWheel = (event) => {
  if (event.ctrlKey) {
    event.preventDefault()
    const zoomSpeed = 0.05
    if (event.deltaY < 0) {
      zoomLevel.value = Math.min(zoomLevel.value + zoomSpeed, 3)
    } else {
      zoomLevel.value = Math.max(zoomLevel.value - zoomSpeed, 1)
    }
  }
}

onMounted(() => {
  window.addEventListener('wheel', handleWheel, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('wheel', handleWheel)
})

const VLine = (props) => h('div', {
  style: { 
    width: '1px', 
    height: props.h || '15px', 
    background: '#000', 
    flexShrink: 0 
  }
})

const orgData = ref({
  president: { name: 'ROLYN C. DAGUIL, PhD', title: 'University President' },
  vp: { name: 'ALEXANDER T. DEMENTILLO, D. ENG.', title: 'Vice President for Administration and Finance' },
  divChief: { name: 'AR. MAGICHAEL B. CLORIBEL', title: 'Division Chief, DCFSSS' },
  director: { name: 'AR. MAGICHAEL B. CLORIBEL', title: 'Director, ECO' },

  pdu: {
    head: { name: 'AR. DERWIN T. GUMBAN', title: 'Head, Planning and Design Unit' },
    members: [
      { name: 'AR. DERWIN T. GUMBAN', title: 'University Architect' },
      { name: 'ENGR. MARIEL M. DELO', title: 'Structural Engineer' },
      { name: 'ENGR. CHARLE MAGNE L. CILLO', title: 'Electrical Engineer' },
      { name: 'ENGR. ROBERT LEE M. BAWIGA', title: 'Electronics Engineer' },
      { name: 'ENGR. LOUID D. HERMOSA', title: 'Mechanical Engineer / Master Plumber' },
      { name: 'ENGR. DANIEL C. DE LA CENA III', title: 'Geodetic Engineer' },
      { name: 'AR. KRESIA H. SALES', title: 'Quantity Surveyor / University Architect' },
    ],
    subMembers: [
      { name: 'MARK VI D. CEPEDA', title: 'Senior Draftsman' },
      { name: 'RALPH NHYNE P. PABON', title: 'Junior Draftsman' },
      { name: 'REGINALD M. LLAGAS', title: 'Junior Draftsman' },
      { name: 'MICHAELLA B. GUILLERA', title: 'Junior Draftswoman' },
    ]
  },

  officeStaff: [
    { name: 'JOKO J. SACO', title: 'PTO I (Technical Writer)' },
    { name: 'GERLIE MAE O. CABAL', title: 'Technical Assistant (Technical Writer)' },
    { name: 'JAY CRIZ M. DELO', title: 'Technical Assistant (Liaison Officer)' },
    { name: 'CORAZON D. CEPEDA', title: 'Office Staff' },
  ],

  piu: {
    head: { name: 'ENGR. MARK CRYSLER F. VALEROS', title: 'Head, Project Implementation Unit' },
    manager: { name: 'AR. KRESIA H. SALES', title: 'Construction Manager' },
    siteEngineers: [
      { name: 'ENGR. NEIL R. GALUSO', title: 'Site Engineer I' },
      { name: 'ENGR. JON BRIAN O. FELICILDA', title: 'Site Engineer I' },
    ],
  }
})

const showManagement = ref(false)
const showUnitStructureModal = ref(false)
const unitStructureModalData = ref({ title: '', sections: [] })
const selectedProfile = ref(null)

const openUnitStructureModal = (unitKey) => {
  if (unitKey === 'pdu') {
    unitStructureModalData.value = {
      title: 'Planning and Design Unit Functional Structure',
      sections: [
        { heading: 'Unit Head', items: [orgData.value.pdu.head] },
        { heading: 'Professional Staff', items: orgData.value.pdu.members },
        { heading: 'Drafting Staff', items: orgData.value.pdu.subMembers },
      ],
    }
  } else if (unitKey === 'office') {
    unitStructureModalData.value = {
      title: 'Office Staff Functional Structure',
      sections: [
        { heading: 'Office Staff Members', items: orgData.value.officeStaff },
      ],
    }
  } else if (unitKey === 'piu') {
    unitStructureModalData.value = {
      title: 'Project Implementation Unit Functional Structure',
      sections: [
        { heading: 'Unit Head', items: [orgData.value.piu.head] },
        { heading: 'Construction Management', items: [orgData.value.piu.manager] },
        { heading: 'Site Engineers', items: orgData.value.piu.siteEngineers },
      ],
    }
  }
  showUnitStructureModal.value = true
}

const closeUnitStructureModal = () => {
  showUnitStructureModal.value = false
}

// Global sizes passed directly to the component
const sz = {
  lg: { w: '160px', av: '40px', nm: '8px', ti: '7px', p: '3px 6px' },
  md: { w: '130px', av: '36px', nm: '7px', ti: '6px', p: '2px 5px' },
  sm: { w: '80px', av: '28px', nm: '6px', ti: '5px', p: '2px 3px' },
}
</script>

<template>
  <div class="flex-1 w-full h-full overflow-auto min-h-0 relative opacity-80 bg-[url('/images/csu-background.png')] bg-cover bg-center">

    <div v-if="!showManagement" class="relative z-10 flex flex-col items-center py-2 px-2 w-full" >
      
      <div class="w-full flex justify-between items-center mb-1 px-2">
        <div class="flex items-center gap-3">
          <img src="../../public/images/csu_seal.png" alt="CSU" class="w-20 h-20 object-contain" onerror="this.style.display='none'" />
          <div class="leading-tight">
            <p class="text-sm font-semibold text-[#1b5e3f] uppercase tracking-widest">Caraga State</p>
            <p class="text-lg font-black text-[#1b5e3f] uppercase tracking-widest" style="font-family:Georgia,serif;">University</p>
          </div>
        </div>
        <button v-if="role" @click="showManagement = true" class="text-white font-bold text-sm px-10 py-4 rounded-3xl shadow-lg bg-green-950 hover:bg-green-900 transition-colors cursor-pointer">
          Manage Membership
        </button>
      </div>

      <div class="relative w-full max-w-screen transition-transform duration-300 ease-in-out origin-top-left" :style="{ transform: `scale(${zoomLevel})` }">
        <div class="min-w-[2028px] flex flex-col items-center justify-center pb-5">

          <OrgCard :person="orgData.president" :sz="sz.md" @click="selectedProfile = orgData.president" />
          <VLine />
          
          <OrgCard :person="orgData.vp" :sz="sz.lg" @click="selectedProfile = orgData.vp" />
          <VLine />
          
          <OrgCard :person="orgData.divChief" :sz="sz.md" @click="selectedProfile = orgData.divChief" />
          <VLine />
          
          <OrgCard :person="orgData.director" :sz="sz.md" @click="selectedProfile = orgData.director" />
          <VLine />

          <div class="w-[2028px]">
            <div class="relative min-h-[14px]">
              <div class="absolute top-0 left-0 right-0 h-px bg-black"></div>
              <div class="grid grid-cols-[660px_660px_660px] gap-6">
                <div class="flex justify-center"><div class="w-px h-[14px] bg-black"></div></div>
                <div class="flex justify-center"><div class="w-px h-[14px] bg-black"></div></div>
                <div class="flex justify-center"><div class="w-px h-[14px] bg-black"></div></div>
              </div>
            </div>
          </div>

          <div class="w-[2028px] grid grid-cols-[660px_660px_660px] gap-6 justify-items-center">

            <div class="w-[660px] flex flex-col items-center">
              <VLine />
              <p class="text-[#386327] font-bold uppercase text-center leading-tight mb-1 mt-1 cursor-pointer hover:underline" @click="openUnitStructureModal('pdu')" style="font-family:'Lilita One',serif;font-size:13px;">PLANNING AND DESIGN UNIT</p>
              <VLine />
              
              <OrgCard :person="orgData.pdu.head" :sz="sz.md" @click="selectedProfile = orgData.pdu.head" />
              <VLine />

              <div class="w-[660px] relative min-h-[14px]">
                <div class="absolute top-0 left-0 right-0 h-px bg-black"></div>
                <div class="flex justify-between items-start">
                  <div v-for="i in orgData.pdu.members.length" :key="i" class="w-[80px] flex justify-center"><div class="w-px h-[14px] bg-black"></div></div>
                </div>
              </div>

              <div class="w-[660px] flex justify-between items-start">
                <OrgCard v-for="m in orgData.pdu.members" :key="m.name" :person="m" :sz="sz.sm" @click="selectedProfile = m" />
              </div>

              <VLine />
              
              <div class="flex flex-col items-center">
                <OrgCard :person="orgData.pdu.subMembers[0]" :sz="sz.sm" @click="selectedProfile = orgData.pdu.subMembers[0]" />
                <VLine />

                <div class="w-[360px] relative min-h-[14px]">
                  <div class="absolute top-0 left-0 right-0 h-px bg-black"></div>
                  <div class="flex justify-between items-start">
                    <div v-for="i in orgData.pdu.subMembers.slice(1).length" :key="i" class="w-[80px] flex justify-center"><div class="w-px h-[14px] bg-black"></div></div>
                  </div>
                </div>

                <div class="w-[360px] flex justify-between items-start">
                  <OrgCard v-for="s in orgData.pdu.subMembers.slice(1)" :key="s.name" :person="s" :sz="sz.sm" @click="selectedProfile = s" />
                </div>
              </div>
            </div>

            <div class="w-[660px] flex flex-col items-center">
              <div class="w-px h-56 bg-black"></div>
              <p class="text-[#386327] font-bold uppercase text-center leading-tight mb-1 mt-1 cursor-pointer hover:underline" @click="openUnitStructureModal('office')" style="font-family:'Lilita One',serif;font-size:13px;">OFFICE STAFF</p>
              <VLine />
              <div class="w-px h-20 bg-black"></div>

              <div class="w-[440px] relative min-h-[14px]">
                <div class="absolute top-0 left-0 right-0 h-px bg-black"></div>
                <div class="flex justify-between items-start">
                  <div v-for="i in orgData.officeStaff.length" :key="i" class="w-[80px] flex justify-center"><div class="w-px h-[14px] bg-black"></div></div>
                </div>
              </div>

              <div class="w-[440px] flex justify-between items-start">
                <OrgCard v-for="s in orgData.officeStaff" :key="s.name" :person="s" :sz="sz.sm" @click="selectedProfile = s" />
              </div>
            </div>

            <div class="w-[660px] flex flex-col items-center">
              <VLine />
              <p class="text-[#386327] font-bold uppercase text-center leading-tight mb-1 mt-1 cursor-pointer hover:underline" @click="openUnitStructureModal('piu')" style="font-family:'Lilita One',serif;font-size:13px;">PROJECT IMPLEMENTATION UNIT</p>
              <VLine />
              
              <OrgCard :person="orgData.piu.head" :sz="sz.md" @click="selectedProfile = orgData.piu.head" />
              <VLine />

              <OrgCard :person="orgData.piu.manager" :sz="sz.sm" @click="selectedProfile = orgData.piu.manager" />
              <VLine />

              <div class="w-[260px] relative min-h-[14px]">
                <div class="absolute top-0 left-0 right-0 h-px bg-black"></div>
                <div class="flex justify-between items-start">
                  <div v-for="i in orgData.piu.siteEngineers.length" :key="i" class="w-[80px] flex justify-center"><div class="w-px h-[14px] bg-black"></div></div>
                </div>
              </div>

              <div class="w-[260px] flex justify-between items-start">
                <OrgCard v-for="e in orgData.piu.siteEngineers" :key="e.name" :person="e" :sz="sz.sm" @click="selectedProfile = e" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <div v-else class="relative z-10 flex flex-col p-8">
      <button @click="showManagement = false" class="mb-6 px-6 py-3 text-lg font-bold text-gray-700 hover:text-gray-900 flex items-center gap-3">
        <span class="text-xl">←</span> Go back
      </button>
      <ManageMembership />
    </div>

    <div v-if="showUnitStructureModal" class="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="closeUnitStructureModal"></div>
      <div class="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-extrabold text-[#1b5e3f]">{{ unitStructureModalData.title }}</h2>
          <button @click="closeUnitStructureModal" class="rounded-full border border-gray-300 px-3 py-1 text-sm font-bold text-gray-700 hover:bg-gray-100">
            Close
          </button>
        </div>
        <div class="space-y-4">
          <div v-for="section in unitStructureModalData.sections" :key="section.heading" class="rounded-lg border border-gray-200 p-4">
            <p class="mb-2 text-sm font-bold uppercase tracking-wide text-[#386327]">{{ section.heading }}</p>
            <div class="space-y-1">
              <div v-for="person in section.items" :key="person.name" class="text-sm text-gray-800">
                <span class="font-semibold">{{ person.name }}</span>
                <span class="text-gray-600"> - {{ person.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="selectedProfile" class="fixed inset-0 z-[1300] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="selectedProfile = null"></div>
        <div class="relative z-10 w-full max-w-[280px] rounded-xl bg-white p-6 shadow-2xl text-center">
          <div class="text-xs text-gray-400 mb-3">Profile (click to view)</div>
          <div class="w-20 h-20 rounded-full bg-[#D9D9D9] mx-auto mb-4 flex items-center justify-center shrink-0">
            <svg fill="#9ca3af" viewBox="0 0 24 24" class="w-1/2 h-1/2"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
          <p class="text-[15px] font-bold text-black mb-1 font-['Hammersmith_One',sans-serif]">{{ selectedProfile.name }}</p>
          <p class="text-[13px] text-gray-600 mb-4 font-['Hammersmith_One',sans-serif]">{{ selectedProfile.title }}</p>
          <div class="bg-gray-100 rounded-lg min-h-[100px] mb-4 flex items-center justify-center text-gray-400 text-sm">
            Additional information
          </div>
          <button @click="selectedProfile = null" class="bg-[#003300] text-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-green-900 transition-colors">
            Close
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Hammersmith+One&family=Lilita+One&display=swap');
</style>