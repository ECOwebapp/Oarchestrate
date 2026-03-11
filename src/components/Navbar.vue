<script setup>
import { useAuthStore } from '@/stores/useAuthStore'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

const expanded    = ref(false)
const mobileOpen  = ref(false)
const closeDrawer = () => { mobileOpen.value = false }

const navNames = [
  'Dashboard',
  'Tasks',
  'Design',
  'Organization',
  'Analytics',
  'Profile',
]

const getPath  = (name) => `/${name.toLowerCase()}`
const isActive = (name) => route.name === name
const version  = '0.1 alpha'
</script>

<template>

  <!-- ══ MOBILE: Hamburger ══ -->
  <button
    @click="mobileOpen = true"
    class="xl:hidden fixed top-24 left-4 z-50 w-10 h-10 flex items-center justify-center
           rounded-xl bg-green-900 shadow-lg shadow-green-900/40 text-black
           active:scale-95 transition-transform">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
         stroke-linecap="round" class="w-5 h-5">
      <path d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  </button>

  <!-- ══ MOBILE: Backdrop ══ -->
  <Transition name="overlay">
    <div v-if="mobileOpen"
      class="xl:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      @click="closeDrawer" />
  </Transition>

  <!-- ══ MOBILE: Drawer ══ -->
  <Transition name="drawer">
    <nav v-if="mobileOpen"
      class="xl:hidden fixed left-0 top-0 bottom-0 z-50 w-68 flex flex-col drop-shadow-2xl"
      style="background: url(/images/csu-background.png) center/cover no-repeat;">
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

  <!-- ══ DESKTOP: Collapsible sidebar ══ -->
  <nav
    class="hidden xl:flex flex-col drop-shadow-xl flex-shrink-0
           transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)] overflow-hidden"
    style="background: url(/images/csu-background.png) center/cover no-repeat;"
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

<script>
import { defineComponent, h, resolveComponent } from 'vue'
import Icons from './Icons.vue'

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
      const RouterLink = resolveComponent('RouterLink')

      const avatarSize = props.expanded ? '115px' : '50px'
      const avatarFont = props.expanded ? '64px' : '32px'
      const avatarMb   = props.expanded ? '10px' : '6px'

      return h('div', { class: 'flex flex-col h-full w-full' }, [

        // ════════════════════
        // PROFILE HEADER
        // ════════════════════
        h('div', {
          class: 'relative flex flex-col items-center justify-end flex-shrink-0 overflow-hidden',
          style: 'height:220px; background: url(/images/bg_profile.jpg) top center / cover no-repeat',
        }, [

          h('div', {
            class: 'absolute inset-0',
            style: 'background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(6,46,20,0.88) 100%)',
          }),

          h('div', { class: 'relative z-10 flex flex-col items-center w-full pb-4 px-3' }, [

            // ── Initials avatar ──
            h('div', {
              style: `
                width: ${avatarSize};
                height: ${avatarSize};
                margin-bottom: ${avatarMb};
                border-radius: 9999px;
                background: ${props.authStore.avatarColor ?? '#14532d'};
                box-shadow: 0 0 0 3px rgba(255,255,255,0.3), 0 4px 16px rgba(0,0,0,0.4);
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: width 0.3s cubic-bezier(.16,1,.3,1),
                            height 0.3s cubic-bezier(.16,1,.3,1),
                            margin-bottom 0.3s ease;
              `,
            }, [
              h('span', {
                style: `
                  color: white;
                  font-weight: 700;
                  font-size: ${avatarFont};
                  letter-spacing: 0.05em;
                  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
                  user-select: none;
                  transition: font-size 0.3s ease;
                `,
              }, props.authStore.initials ?? '?'),
            ]),

            // Loading skeletons
            props.authStore.loading
              ? h('div', { class: 'flex flex-col items-center gap-1.5' }, [
                  h('div', { class: 'h-3 w-28 rounded bg-white/20 animate-pulse' }),
                  props.expanded
                    ? h('div', { class: 'h-2.5 w-20 rounded bg-white/15 animate-pulse' })
                    : null,
                ])
              : props.expanded
                ? h('div', { class: 'text-center' }, [
                    h('p', { class: 'text-white text-sm font-bold leading-tight truncate max-w-[180px]' },
                      props.authStore.fullName),
                    h('p', { class: 'text-white text-[11px] font-bold mt-2 leading-tight max-w-[180px]'}, 
                      props.authStore.unitName),
                    h('p', { class: 'text-green-300 text-[11px] truncate max-w-[180px] mt-0.5' },
                      `${props.authStore.positionLabel} (${props.authStore.roleLabel})`),
                  ])
                : null,
          ]),
        ]),

        // ════════════════════
        // NAV ITEMS
        // ════════════════════
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
                    ? 'bg-gray/15 text-black'
                    : 'text-green-900/500 hover:bg-black/10 hover:text-black',
                ].join(' '),
                style: `animation: navIn 0.35s cubic-bezier(.16,1,.3,1) both; animation-delay:${i * 35}ms`,
              }, () => [
                active
                  ? h('span', { class: 'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full' })
                  : null,

                h(Icons, {
                  icon: name.toLowerCase(),
                  class: 'flex-shrink-0 transition-transform duration-150 mx-4 group-hover:scale-110',
                }),

                props.expanded
                  ? h('span', {
                      class: 'text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 mr-4',
                    }, name + (name === 'Design' ? ' Review' : ''))
                  : null,

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

        // ════════════════════
        // LOGOUT
        // ════════════════════
        h('div', { class: 'flex-shrink-0 border-t border-white/10 p-2' }, [
          h('button', {
            onClick: () => emit('logout'),
            class: 'group relative w-full flex flex-row items-center rounded-xl py-3 mx-0 overflow-hidden text-red-900/300 hover:bg-red-500/500 hover:text-red-500 transition-all duration-150',
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
nav.hidden { box-shadow: 4px 0 28px rgba(0,0,0,0.3); }

.drawer-enter-active  { animation: drawerIn  0.3s cubic-bezier(.16,1,.3,1) both }
.drawer-leave-active  { animation: drawerOut 0.22s ease both }
@keyframes drawerIn   { from { transform: translateX(-100%) } to { transform: translateX(0) } }
@keyframes drawerOut  { from { transform: translateX(0) }     to { transform: translateX(-100%) } }

.overlay-enter-active { animation: fadeIn  0.2s ease both }
.overlay-leave-active { animation: fadeOut 0.2s ease both }
@keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes fadeOut { from { opacity: 1 } to { opacity: 0 } }

@keyframes navIn {
  from { opacity: 0; transform: translateX(-10px) }
  to   { opacity: 1; transform: translateX(0) }
}
</style>