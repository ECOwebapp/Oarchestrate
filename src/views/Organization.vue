<script setup>
import { h, ref } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import ManageMembership from '@/components/ManageMembership.vue'

const role = useAuthStore().isDirector
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

  piu: {
    head: { name: 'ENGR. MARK CRYSLER F. VALEROS', title: 'Head, Project Implementation Unit' },
    manager: { name: 'AR. KRESIA H. SALES', title: 'Construction Manager' },
    siteEngineers: [
      { name: 'ENGR. NEIL R. GALUSO', title: 'Site Engineer I' },
      { name: 'ENGR. JON BRIAN O. FELICILDA', title: 'Site Engineer I' },
    ],
    subMembers: [
      { name: 'JOKO J. SACO', title: 'PTO I (Technical Writer)' },
      { name: 'GERLIE MAE O. CABAL', title: 'Technical Assistant (Technical Writer)' },
      { name: 'JAY CRIZ M. DELO', title: 'Technical Assistant (Liaison Officer)' },
      { name: 'CORAZON D. CEPEDA', title: 'Office Staff' },
    ]
  }
})

const showManagement = ref(false)
const pendingMembers = ref([
  { name: 'Seniour San T. Elmo' },
  { name: 'Jarakai T. Warlord' },
  { name: 'Traileou T. Tralala' },
  { name: 'Morokoy P. Suka' },
])

/* ── inline card sizes ── */
const sz = {
  lg: { w: '160px', av: '40px', nm: '8px', ti: '7px', p: '3px 6px' },
  md: { w: '130px', av: '36px', nm: '7px', ti: '6px', p: '2px 5px' },
  sm: { w: '80px', av: '28px', nm: '6px', ti: '5px', p: '2px 3px' },
}

// ── Component: OrgCard ──
const OrgCard = {
  props: { name: String, title: String, sz: Object },
  setup(props) {
    const showProfile = ref(false)

    return () => [
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'white',
          border: '1px solid #000',
          borderRadius: '10px',
          padding: props.sz.p,
          width: props.sz.w,
          maxWidth: '100%',
          textAlign: 'center',
          boxSizing: 'border-box',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        },
        onClick: () => { showProfile.value = true }
      }, [
        h('div', {
          style: {
            width: props.sz.av,
            height: props.sz.av,
            borderRadius: '50%',
            background: '#D9D9D9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2px',
            flexShrink: 0
          }
        }, [
          h('svg', {
            fill: '#9ca3af',
            viewBox: '0 0 24 24',
            style: { width: '55%', height: '55%' }
          }, [
            h('path', {
              d: 'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'
            })
          ])
        ]),
        h('p', {
          style: {
            fontSize: props.sz.nm,
            fontWeight: '700',
            color: '#000',
            lineHeight: '1.2',
            wordBreak: 'break-word',
            fontFamily: 'Hammersmith One,sans-serif'
          }
        }, props.name),
        h('p', {
          style: {
            fontSize: props.sz.ti,
            color: '#444',
            lineHeight: '1.1',
            marginTop: '1px',
            wordBreak: 'break-word',
            fontFamily: 'Hammersmith One,sans-serif'
          }
        }, props.title)
      ]),
      h(ModalBackdrop, { show: showProfile.value, onClose: () => { showProfile.value = false } }),
      h(ProfileModal, {
        name: props.name,
        title: props.title,
        show: showProfile.value,
        onClose: () => { showProfile.value = false }
      })
    ]
  }
}

// ── Component: VLine ──
const VLine = {
  setup() {
    return () => h('div', {
      style: {
        width: '1px',
        height: '15px',
        background: '#000',
        flexShrink: 0
      }
    })
  }
}

// ── Component: ProfileModal ──
const ProfileModal = {
  props: { name: String, title: String, show: Boolean },
  emits: ['close'],
  setup(props, { emit }) {
    return () => props.show ? h('div', {
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        minWidth: '280px',
        textAlign: 'center'
      }
    }, [
      h('div', {
        style: {
          fontSize: '12px',
          color: '#999',
          marginBottom: '12px'
        }
      }, 'Profile (click to view)'),
      h('div', {
        style: {
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#D9D9D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          flexShrink: 0
        }
      }, [
        h('svg', {
          fill: '#9ca3af',
          viewBox: '0 0 24 24',
          style: { width: '50%', height: '50%' }
        }, [
          h('path', {
            d: 'M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z'
          })
        ])
      ]),
      h('p', {
        style: {
          fontSize: '15px',
          fontWeight: '700',
          color: '#000',
          margin: '0 0 4px 0',
          fontFamily: 'Hammersmith One,sans-serif'
        }
      }, props.name),
      h('p', {
        style: {
          fontSize: '13px',
          color: '#666',
          margin: '0 0 16px 0',
          fontFamily: 'Hammersmith One,sans-serif'
        }
      }, props.title),
      h('div', {
        style: {
          background: '#f0f0f0',
          borderRadius: '8px',
          minHeight: '100px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999'
        }
      }, 'Additional information'),
      h('button', {
        style: {
          background: '#003300',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '10px 24px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer'
        },
        onClick: () => emit('close')
      }, 'Close')
    ]) : null
  }
}

// ── Component: ModalBackdrop ──
const ModalBackdrop = {
  props: { show: Boolean },
  emits: ['close'],
  setup(props, { emit }) {
    return () => props.show ? h('div', {
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 999
      },
      onClick: () => emit('close')
    }) : null
  }
}
</script>

<template>
  <div class="flex-1 min-h-0 overflow-auto relative bg-white">

    <div
      class="absolute inset-0 pointer-events-none opacity-80 bg-[url('/images/csu-background.png')] bg-cover bg-center">
    </div>

    <div v-if="!showManagement" class="relative z-10 flex flex-col items-center py-2 px-2 w-full">

      <div class="w-full flex justify-between items-center mb-1 px-2">
        <div class="flex items-center gap-3">
          <img src="../../public/image/csu_logo.png" alt="CSU" class="w-20 h-20 object-contain"
            onerror="this.style.display='none'" />
          <div class="leading-tight">
            <p class="text-sm font-semibold text-[#1b5e3f] uppercase tracking-widest">Caraga State</p>
            <p class="text-lg font-black text-[#1b5e3f] uppercase tracking-widest" style="font-family:Georgia,serif;">
              University</p>
          </div>
        </div>
        <div v-if="role" class="flex items-center gap-2">
          <button @click="showManagement = true"
            class="text-white font-bold text-sm px-10 py-4 rounded-3xl shadow-lg bg-green-950 hover:bg-green-900 transition-colors cursor-pointer">
            Manage Membership
          </button>
        </div>
      </div>

      <OrgCard v-bind="orgData.president" :sz="sz.md" />
      <VLine />

      <OrgCard v-bind="orgData.vp" :sz="sz.lg" />
      <VLine />

      <OrgCard v-bind="orgData.divChief" :sz="sz.md" />
      <VLine />

      <OrgCard v-bind="orgData.director" :sz="sz.md" />
      <VLine />

      <div class="w-full flex items-start gap-2 px-2">

        <div class="flex-1 flex flex-col items-center min-w-0">
          <div class="w-full border-t-2 border-black"></div>
          <VLine />

          <p class="text-[#386327] font-bold uppercase text-center leading-tight mb-2"
            style="font-family:'Lilita One',serif;font-size:13px;">
            PLANNING AND DESIGN UNIT
          </p>
          <VLine />
          <OrgCard v-bind="orgData.pdu.head" :sz="sz.md" />
          <VLine />

          <div class="flex justify-center gap-1 w-full flex-wrap">
            <OrgCard v-for="m in orgData.pdu.members" :key="m.name" v-bind="m" :sz="sz.sm" />
          </div>
          <VLine />

          <div class="flex flex-col items-center gap-0">
            <OrgCard v-bind="orgData.pdu.subMembers[0]" :sz="sz.sm" />
            <VLine />
            <div class="flex justify-center gap-1 flex-wrap">
              <div v-for="s in orgData.pdu.subMembers.slice(1)" :key="s.name" class="flex flex-col items-center">
                <VLine />
                <OrgCard v-bind="s" :sz="sz.sm" />
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col items-center min-w-0">
          <div class="w-full border-t-2 border-black"></div>
          <VLine />

          <p class="text-[#386327] font-bold uppercase text-center leading-tight mb-2"
            style="font-family:'Lilita One',serif;font-size:13px;">
            PROJECT IMPLEMENTATION UNIT
          </p>
          <VLine />
          <OrgCard v-bind="orgData.piu.head" :sz="sz.md" />
          <VLine />

          <OrgCard v-bind="orgData.piu.manager" :sz="sz.sm" />
          <VLine />

          <div class="flex gap-1 flex-wrap">
            <div v-for="e in orgData.piu.siteEngineers" :key="e.name" class="flex flex-col items-center">
              <VLine />
              <OrgCard v-bind="e" :sz="sz.sm" />
            </div>
          </div>
          <VLine />

          <div class="flex justify-center gap-1 w-full flex-wrap">
            <OrgCard v-for="s in orgData.piu.subMembers" :key="s.name" v-bind="s" :sz="sz.sm" />
          </div>
        </div>
      </div>
    </div>
    <div v-else class="relative z-10 flex flex-col p-8">
      <button @click="showManagement = false"
        class="mb-6 px-6 py-3 text-lg font-bold text-gray-700 hover:text-gray-900 flex items-center gap-3">
        <span class="text-xl">←</span>
        Go back
      </button>
      <ManageMembership />

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Hammersmith+One&family=Lilita+One&display=swap');
</style>