<script setup>
import Icons from './Icons.vue'
import { computed } from 'vue'

const props = defineProps({
  navNames: Array,
  getPath: Function,
  isActive: Function,
  authStore: Object,
  expanded: Boolean,
  version: String,
  formattedPositions: String,
  formattedUnits: String,
})

defineEmits(['logout', 'navigate'])

// Dynamic styles for the avatar
const avatarContainerStyle = computed(() => ({
  width: props.expanded ? '115px' : '50px',
  height: props.expanded ? '115px' : '50px',
  marginBottom: props.expanded ? '10px' : '6px',
  borderRadius: '9999px',
  backgroundColor: props.authStore.avatarColor ?? '#14532d',
}))

const avatarFontSize = computed(() => props.expanded ? '64px' : '32px')
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <div
      class="relative flex flex-col items-center justify-end flex-shrink-0 overflow-hidden bg-[url('/images/bg_profile.jpg')] h-[220px] bg-center bg-cover no-repeat">
      <div class="absolute inset-0"
        style="background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(6,46,20,0.88) 100%)" />

      <div class="relative z-10 flex flex-col items-center w-full pb-4 px-3">
        <div :style="avatarContainerStyle"
          class="flex items-center justify-center transition-all duration-300 shadow-xl border-white/30 border-[2px] overflow-hidden">
          <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" alt="User avatar"
            class="w-full h-full object-cover block" />

          <span v-else :style="{
            fontSize: avatarFontSize,
            transition: 'font-size 0.3s ease'
          }" class="text-white font-bold tracking-wider drop-shadow-md select-none">
            {{ authStore.initials ?? '?' }}
          </span>
        </div>

        <template v-if="!authStore.loading && authStore.initialized">
          <div v-show="expanded" class="text-center">
            <p class="text-white text-sm font-bold leading-tight truncate max-w-[180px]">
              {{ authStore.fullName }}
            </p>
            <p class="text-green-300 text-[13px] font-bold truncate mt-0.5 max-w-[180px]">
              {{ formattedPositions }}
            </p>
            <p class="text-white text-[12px] leading-tight max-w-[180px]">
              {{ formattedUnits }}
            </p>
          </div>
        </template>

        <div v-else class="flex flex-col items-center gap-1.5">
          <div class="h-3 w-28 rounded bg-white/20 animate-pulse"></div>
          <div v-show="expanded" class="h-2.5 w-20 rounded bg-white/15 animate-pulse"></div>
        </div>
      </div>
    </div>

    <ul class="flex flex-col flex-1 py-2 overflow-hidden">
      <li v-for="(name, i) in navNames" :key="name">
        <router-link :to="getPath(name)" @click="$emit('navigate')"
          class="group relative flex flex-row items-center gap-0 py-3 mx-2 rounded-xl transition-all duration-150 overflow-hidden"
          :class="isActive(name) ? 'bg-green-950 text-white' : 'text-black hover:bg-black/10'"
          :style="{ animation: `navIn 0.35s cubic-bezier(.16,1,.3,1) both`, animationDelay: `${i * 35}ms` }">
          <span v-if="isActive(name)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full"></span>

          <Icons :icon="name.toLowerCase()" class="flex-shrink-0 transition-transform duration-150 mx-4"
            :class="!isActive(name) ? 'group-hover:scale-110' : ''" />

          <span v-if="expanded"
            class="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 mr-4">
            {{ name }}{{ name === 'Design' ? ' Review' : '' }}
          </span>

          <span v-if="!expanded"
            class="pointer-events-none absolute left-full ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-green-900 text-white shadow-lg">
            {{ name }}
          </span>
        </router-link>
      </li>
    </ul>

    <div class="flex-shrink-0 border-t border-white/10 p-2">
      <button @click="$emit('logout')"
        class="group relative w-full flex flex-row items-center rounded-xl py-3 mx-0 overflow-hidden text-red-600 hover:bg-red-500/30 hover:cursor-pointer transition-all duration-150">
        <Icons icon="logout" class="flex-shrink-0 mx-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        <span v-if="expanded" class="text-sm font-medium mr-4">Logout</span>
      </button>
      <p v-if="expanded" class="text-center text-[10px] text-green-700 mt-1.5 tracking-widest">v{{ version }}</p>
    </div>
  </div>
</template>


<!-- <script>
import { defineComponent, h, resolveComponent } from 'vue'
import Icons from './Icons.vue'

const NavInner = defineComponent({
  name: 'NavInner',
  props: {
    navNames: Array,
    getPath: Function,
    isActive: Function,
    authStore: Object,
    expanded: Boolean,
    version: String,
    formattedPositions: String,
    formattedUnits: String,
  },
  emits: ['logout', 'navigate'],
  setup(props, { emit }) {
    return () => {
      const RouterLink = resolveComponent('RouterLink')

      const avatarSize = props.expanded ? '115px' : '50px'
      const avatarFont = props.expanded ? '64px' : '32px'
      const avatarMb = props.expanded ? '10px' : '6px'

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
                  h('p', { class: 'text-green-300 text-[13px] font-bold truncate mt-2 max-w-[180px] mt-0.5' },
                    `${props.formattedPositions}`),
                  h('p', { class: 'text-white text-[12px] leading-tight max-w-[180px]' },
                    props.formattedUnits),
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
                    ? 'bg-gray/15 text-white bg-green-950'
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

export { NavInner } -->