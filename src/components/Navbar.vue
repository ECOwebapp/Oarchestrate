<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

// ── Desktop: hover to expand ──
const expanded = ref(false)

// ── Mobile: drawer ──
const mobileOpen = ref(false)
const closeDrawer = () => { mobileOpen.value = false }

const navNames = [
  'Dashboard',
  'Tasks',
  'Design',
  'Organization',
  'Analytics',
  'Profile',
]

const getPath = (name) => `/${name.toLowerCase()}`
const isActive = (name) => route.name === name

const version = '0.1 alpha'
</script>

<template>

  <!-- ══════════════════════════════════
       MOBILE: Hamburger button
  ══════════════════════════════════ -->
  <button
    @click="mobileOpen = true"
    class="xl:hidden fixed top-24 left-4 z-50 w-10 h-10 flex items-center justify-center
           rounded-xl bg-green-900 shadow-lg shadow-green-900/40 text-white
           active:scale-95 transition-transform">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
         stroke-linecap="round" class="w-5 h-5">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  </button>

  <!-- ══════════════════════════════════
       MOBILE: Backdrop
  ══════════════════════════════════ -->
  <Transition name="overlay">
    <div v-if="mobileOpen"
      class="xl:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      @click="closeDrawer" />
  </Transition>

  <!-- ══════════════════════════════════
       MOBILE: Drawer (always expanded)
  ══════════════════════════════════ -->
  <Transition name="drawer">
    <nav v-if="mobileOpen"
      class="xl:hidden fixed left-0 top-0 bottom-0 z-50 w-68 flex flex-col
             bg-green-950 drop-shadow-2xl">
      <NavInner
        :nav-names="navNames"
        :get-path="getPath"
        :is-active="isActive"
        :auth-store="authStore"
        :expanded="true"
        :version="version"
        @logout="authStore.logout(router)"
        @navigate="closeDrawer"
      />
    </nav>
  </Transition>

  <!-- ══════════════════════════════════
       DESKTOP: Collapsible sidebar
  ══════════════════════════════════ -->
  <nav
    class="hidden xl:flex flex-col bg-green-950 drop-shadow-xl flex-shrink-0
           transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] overflow-hidden"
    :class="expanded ? 'w-60' : 'w-[68px]'"
    @mouseenter="expanded = true"
    @mouseleave="expanded = false">
    <NavInner
      :nav-names="navNames"
      :get-path="getPath"
      :is-active="isActive"
      :auth-store="authStore"
      :expanded="expanded"
      :version="version"
      @logout="authStore.logout(router)"
    />
  </nav>

</template>

<!-- ──────────────────────────────────────
     Inner nav content — shared by both
     desktop sidebar and mobile drawer
────────────────────────────────────────── -->
<script>
import { defineComponent, h, resolveComponent } from 'vue'

const NavInner = defineComponent({
  name: 'NavInner',
  props: {
    navNames:  Array,
    getPath:   Function,
    isActive:  Function,
    authStore: Object,
    expanded:  Boolean,
    version:   String,
  },
  emits: ['logout', 'navigate'],
  setup(props, { emit }) {
    return () => {
      const Icons      = resolveComponent('Icons')
      const RouterLink = resolveComponent('RouterLink')

      return h('div', { class: 'flex flex-col h-full w-full' }, [

        // ── Profile header ──
        h('div', {
          class: 'relative flex flex-col items-center justify-end flex-shrink-0 overflow-hidden',
          style: 'height:200px; background: url(/images/bg_profile.jpg) top center / cover no-repeat',
        }, [
          // Dark gradient overlay
          h('div', {
            class: 'absolute inset-0',
            style: 'background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(6,46,20,0.88) 100%)',
          }),

          h('div', { class: 'relative z-10 flex flex-col items-center w-full pb-4 px-3' }, [

            // Avatar
            h('div', {
              class: 'rounded-full bg-cover bg-center ring-2 ring-white/40 flex-shrink-0 transition-all duration-300',
              style: `
                background-image: url(${props.authStore.avatarUrl});
                width:  ${props.expanded ? '56px' : '38px'};
                height: ${props.expanded ? '56px' : '38px'};
                margin-bottom: ${props.expanded ? '10px' : '6px'};
              `,
            }),

            // Loading skeletons
            props.authStore.loading
              ? h('div', { class: 'flex flex-col items-center gap-1.5' }, [
                  h('div', { class: 'h-3 w-28 rounded bg-white/20 animate-pulse' }),
                  props.expanded
                    ? h('div', { class: 'h-2.5 w-20 rounded bg-white/15 animate-pulse' })
                    : null,
                ])
              // Name + position
              : props.expanded
                ? h('div', { class: 'text-center' }, [
                    h('p', { class: 'text-white text-xs font-bold leading-tight truncate max-w-[180px]' },
                      props.authStore.fullName),
                    h('p', { class: 'text-green-300 text-[10px] truncate max-w-[180px] mt-0.5' },
                      props.authStore.positionLabel),
                  ])
                : null,
          ]),
        ]),

        // ── Nav items ──
        h('ul', { class: 'flex flex-col flex-1 py-2 overflow-hidden' },
          props.navNames.map((name, i) => {
            const active = props.isActive(name)
            return h('li', { key: name }, [
              h(RouterLink, {
                to: props.getPath(name),
                onClick: () => emit('navigate'),
                class: [
                  'group relative flex flex-row items-center gap-0 py-3 mx-2 rounded-xl',
                  'transition-all duration-150 overflow-hidden',
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-green-200/70 hover:bg-white/10 hover:text-white',
                ].join(' '),
                style: `animation: navIn 0.35s cubic-bezier(.16,1,.3,1) both; animation-delay:${i * 35}ms`,
              }, () => [
                // Active bar
                active
                  ? h('span', { class: 'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full' })
                  : null,

                // Icon
                h(Icons, {
                  icon: name.toLowerCase(),
                  class: [
                    'flex-shrink-0 transition-transform duration-150 mx-4',
                    'group-hover:scale-110',
                  ].join(' '),
                }),

                // Label (only when expanded)
                props.expanded
                  ? h('span', {
                      class: 'text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 mr-4',
                    }, name + (name === 'Design' ? ' Review' : ''))
                  : null,

                // Tooltip (only when collapsed)
                !props.expanded
                  ? h('span', {
                      class: 'pointer-events-none absolute left-full ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                      style: 'background:#14532d; color:white; box-shadow:0 4px 14px rgba(0,0,0,0.35)',
                    }, name + (name === 'Design' ? ' Review' : ''))
                  : null,
              ])
            ])
          })
        ),

        // ── Logout ──
        h('div', { class: 'flex-shrink-0 border-t border-white/10 p-2' }, [
          h('button', {
            onClick: () => emit('logout'),
            class: 'group relative w-full flex flex-row items-center rounded-xl py-3 mx-0 overflow-hidden text-red-300/70 hover:bg-red-500/20 hover:text-red-200 transition-all duration-150',
          }, [
            h(Icons, {
              icon: 'logout',
              class: 'flex-shrink-0 mx-4 transition-transform duration-150 group-hover:translate-x-0.5',
            }),
            props.expanded
              ? h('span', { class: 'text-sm font-medium mr-4' }, 'Logout')
              : null,
            !props.expanded
              ? h('span', {
                  class: 'pointer-events-none absolute left-full ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                  style: 'background:#7f1d1d; color:#fca5a5; box-shadow:0 4px 14px rgba(0,0,0,0.35)',
                }, 'Logout')
              : null,
          ]),

          // Version
          props.expanded
            ? h('p', { class: 'text-center text-[10px] text-green-700 mt-1.5 tracking-widest' }, `v${props.version}`)
            : null,
        ]),

      ])
    }
  }
})

export { NavInner }
</script>

<style scoped>
/* Desktop shadow */
nav.hidden { box-shadow: 4px 0 28px rgba(0,0,0,0.3); }

/* Mobile drawer */
.drawer-enter-active  { animation: drawerIn  0.3s cubic-bezier(.16,1,.3,1) both }
.drawer-leave-active  { animation: drawerOut 0.22s ease both }
@keyframes drawerIn   { from { transform: translateX(-100%) } to { transform: translateX(0) } }
@keyframes drawerOut  { from { transform: translateX(0) }     to { transform: translateX(-100%) } }

/* Backdrop */
.overlay-enter-active { animation: fadeIn  0.2s ease both }
.overlay-leave-active { animation: fadeOut 0.2s ease both }
@keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }

/* Nav item stagger */
@keyframes navIn {
  from { opacity: 0; transform: translateX(-10px) }
  to   { opacity: 1; transform: translateX(0) }
}
</style>