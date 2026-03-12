<template>
  <div class="app" ref="appRef">

    <!-- ─── NAVBAR ─── -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      :class="isScrolled
        ? 'bg-white/90 backdrop-blur-2xl shadow-[0_2px_32px_rgba(0,120,0,0.08)] border-b border-green-100 py-3'
        : 'py-6'"
    >
      <div class="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <!-- Brand -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-green-700 to-green-500 flex items-center justify-center shadow-md shadow-green-200">
            <svg viewBox="0 0 24 24" class="w-5 h-5 fill-white">
              <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z"/>
            </svg>
          </div>
          <div class="leading-tight">
            <span class="font-display text-green-900 font-bold text-[15px] tracking-tight">CSU</span>
            <span class="font-display text-green-600 font-bold text-[15px] tracking-tight"> Oarchestrate</span>
          </div>
        </div>

        <!-- Desktop links -->
        <div class="hidden md:flex items-center gap-8">
          <a v-for="link in navLinks" :key="link.href"
            :href="link.href" @click.prevent="scrollTo(link.id)"
            class="text-[13px] font-medium text-stone-500 hover:text-green-700 transition-colors duration-200 tracking-wide">
            {{ link.label }}
          </a>
          <router-link to="/login"
            class="px-5 py-2.5 rounded-2xl bg-gradient-to-br from-green-700 to-green-500 text-white text-[13px] font-semibold shadow-lg shadow-green-200 hover:shadow-green-300 hover:-translate-y-0.5 transition-all duration-200">
            Sign In
          </router-link>
        </div>

        <!-- Hamburger -->
        <button class="md:hidden p-2 rounded-xl hover:bg-green-50 transition-colors"
          @click="menuOpen = !menuOpen">
          <div class="w-5 flex flex-col gap-[5px]">
            <span class="block h-[1.5px] bg-green-700 rounded-full transition-all duration-300"
              :class="menuOpen ? 'rotate-45 translate-y-[6.5px]' : ''"></span>
            <span class="block h-[1.5px] bg-green-700 rounded-full transition-all duration-300"
              :class="menuOpen ? 'opacity-0' : ''"></span>
            <span class="block h-[1.5px] bg-green-700 rounded-full transition-all duration-300"
              :class="menuOpen ? '-rotate-45 -translate-y-[6.5px]' : ''"></span>
          </div>
        </button>
      </div>

      <!-- Mobile menu -->
      <div class="md:hidden overflow-hidden transition-all duration-300"
        :class="menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'">
        <div class="px-6 pt-3 pb-6 flex flex-col gap-3 bg-white/95 backdrop-blur-xl border-t border-green-50">
          <a v-for="link in navLinks" :key="link.href"
            :href="link.href" @click="menuOpen = false"
            class="text-[14px] text-stone-600 font-medium py-2 hover:text-green-700 transition-colors">
            {{ link.label }}
          </a>
          <router-link to="/login" @click="menuOpen = false"
            class="mt-1 px-5 py-3 rounded-2xl bg-gradient-to-br from-green-700 to-green-500 text-white text-[13px] font-semibold text-center shadow-lg shadow-green-200">
            Sign In
          </router-link>
        </div>
      </div>
    </nav>

    <!-- ─── HERO ─── -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 px-6"
      ref="heroRef">
      <!-- Background layers -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,160,0,0.12),transparent)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_85%_70%,rgba(249,220,7,0.07),transparent)]"></div>
      <div class="absolute inset-0" style="background-image: radial-gradient(rgba(0,140,0,0.07) 1px, transparent 1px); background-size: 28px 28px;"></div>
      <!-- Soft blobs -->
      <div class="absolute w-[600px] h-[600px] top-[-180px] left-[-180px] rounded-full bg-green-400/10 blur-[100px] pointer-events-none animate-blob1"></div>
      <div class="absolute w-[400px] h-[400px] bottom-[-100px] right-[-100px] rounded-full bg-yellow-300/10 blur-[80px] pointer-events-none animate-blob2"></div>

      <!-- Antigravity particle field -->
      <div class="absolute inset-0 z-[1]">
        <Antigravity :count="300" :magnetRadius="10" :ringRadius="10" :waveSpeed="0.4" :waveAmplitude="1"
          :particleSize="2" :lerpSpeed="0.1" color="#009900" :autoAnimate="false" :particleVariance="1"
          :rotationSpeed="0" :depthFactor="1" :pulseSpeed="3" particleShape="capsule" :fieldStrength="10" />
      </div>

      <div class="relative z-[2] text-center max-w-4xl mx-auto">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-green-200/80
          shadow-sm shadow-green-100 text-[11px] font-bold text-green-700 uppercase tracking-[0.15em] mb-8
          transition-all duration-700"
          :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Caraga State University — ECO
        </div>

        <!-- Title -->
        <h1 class="font-display font-black leading-[0.92] tracking-[-0.035em] mb-7">
          <span class="block text-[clamp(52px,9vw,108px)] text-green-950 transition-all duration-700 delay-150"
            :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">Project</span>
          <span class="block text-[clamp(52px,9vw,108px)] text-green-600 transition-all duration-700 delay-200"
            :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'">Management</span>
          <span class="block text-[clamp(52px,9vw,108px)] transition-all duration-700 delay-300"
            :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
            style="-webkit-text-stroke: 2.5px #16a34a; color: transparent;">System</span>
        </h1>

        <!-- Subtitle -->
        <p class="font-body text-[17px] leading-relaxed text-stone-500 max-w-[520px] mx-auto mb-10 transition-all duration-700 delay-[450ms]"
          :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'">
          A unified platform for the Engineering and Construction Office — streamlining
          task assignments, design approvals, and project tracking across all units.
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap gap-4 justify-center mb-16 transition-all duration-700 delay-[550ms]"
          :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'">
          <button to="/login" class="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-br from-green-800 to-green-500
            text-white text-[14px] font-semibold shadow-xl shadow-green-200 hover:shadow-green-300
            hover:-translate-y-1 transition-all duration-200 group" >
            <span>
              Get Started
            </span>
            <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <button class="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white border border-green-200
            text-green-700 text-[14px] font-semibold shadow-md shadow-green-50 hover:border-green-400
            hover:shadow-green-100 hover:-translate-y-1 transition-all duration-200">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>
            </svg>
            Watch Demo
          </button>
        </div>

        <!-- Stats -->
        <div class="flex flex-wrap justify-center gap-8 transition-all duration-700 delay-[650ms]"
          :class="heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'">
          <div v-for="s in stats" :key="s.label"
            class="flex flex-col items-center gap-1 px-6 py-3 rounded-2xl bg-white/80 backdrop-blur border border-green-100 shadow-sm">
            <span class="font-display font-black text-2xl text-green-700">{{ s.value }}</span>
            <span class="text-[11px] uppercase tracking-widest text-stone-400 font-semibold">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <!-- Scroll cue -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2] flex flex-col items-center gap-2 transition-all duration-700 delay-[900ms]"
        :class="heroVisible ? 'opacity-100' : 'opacity-0'">
        <span class="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-semibold">Scroll</span>
        <div class="w-[1px] h-8 bg-gradient-to-b from-green-500 to-transparent animate-scroll-line"></div>
      </div>
    </section>

    <!-- ─── ABOUT ─── -->
    <section id="about" ref="aboutRef" class="py-28 px-6 bg-[#f8faf8]">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <span class="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold uppercase tracking-[0.18em] border border-green-200/60 mb-4">About the System</span>
          <h2 class="font-display font-black text-[clamp(30px,5vw,52px)] text-green-950 leading-tight tracking-tight mb-4">
            Built for the <span class="text-green-600">ECO</span> —<br>Designed for Efficiency
          </h2>
          <p class="font-body text-[16px] text-stone-500 max-w-[480px] mx-auto leading-relaxed">
            The Oarchestrate PMS centralizes all capital project workflows — from task creation to multi-level approvals — in one cohesive platform.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="(card, i) in aboutCards" :key="card.title"
            class="group relative bg-white rounded-3xl p-7 border border-stone-100 shadow-sm
              hover:shadow-xl hover:shadow-green-100/60 hover:-translate-y-1.5
              transition-all duration-500 cursor-default overflow-hidden"
            :class="aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
            :style="{ transitionDelay: (i * 0.08) + 's' }">
            <!-- Top accent -->
            <div class="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-full"></div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-50 border border-green-200/60
              flex items-center justify-center text-green-600 mb-5 group-hover:scale-110 transition-transform duration-300"
              v-html="card.icon">
            </div>
            <h3 class="font-display font-bold text-[16px] text-green-950 mb-2">{{ card.title }}</h3>
            <p class="font-body text-[13.5px] text-stone-500 leading-relaxed">{{ card.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURES ─── -->
    <section id="features" ref="featuresRef" class="py-28 px-6 relative overflow-hidden bg-green-950">
      <!-- subtle pattern -->
      <div class="absolute inset-0 opacity-[0.03]"
        style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 24px 24px;"></div>
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/40 to-transparent"></div>

      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <!-- Left -->
        <div>
          <span class="inline-block px-4 py-1.5 rounded-full bg-white/10 text-green-300 text-[11px] font-bold uppercase tracking-[0.18em] border border-white/15 mb-5">Key Features</span>
          <h2 class="font-display font-black text-[clamp(28px,4.5vw,48px)] text-white leading-tight tracking-tight mb-4">
            Everything you need<br>to manage projects
          </h2>
          <p class="font-body text-[15px] text-white/50 leading-relaxed mb-10 max-w-sm">
            Designed around real ECO workflows — every feature serves a clear purpose.
          </p>

          <div class="flex flex-col gap-1.5">
            <div v-for="(f, i) in features" :key="f.title"
              class="flex items-start gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-250 border"
              :class="activeFeature === i
                ? 'bg-white/10 border-yellow-400/30 shadow-lg shadow-black/10'
                : 'border-transparent hover:bg-white/5 hover:border-white/10'"
              @mouseenter="activeFeature = i">
              <div class="mt-1.5 w-2 h-2 min-w-[8px] rounded-full transition-all duration-250"
                :class="activeFeature === i ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'bg-white/20'">
              </div>
              <div>
                <div class="font-display font-semibold text-[13.5px] mb-0.5 transition-colors duration-250"
                  :class="activeFeature === i ? 'text-yellow-300' : 'text-white/60'">{{ f.title }}</div>
                <div class="font-body text-[12.5px] text-white/35 leading-relaxed">{{ f.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Display card -->
        <div class="relative">
          <div class="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 bg-white" :key="activeFeature">
            <div class="flex items-center gap-3 px-5 py-4 border-b border-stone-100 bg-stone-50/80">
              <div class="flex gap-1.5">
                <span class="w-3 h-3 rounded-full bg-red-300"></span>
                <span class="w-3 h-3 rounded-full bg-yellow-300"></span>
                <span class="w-3 h-3 rounded-full bg-green-300"></span>
              </div>
              <span class="font-display text-[12px] text-stone-400 font-medium">{{ features[activeFeature].title }}</span>
            </div>
            <div class="min-h-[220px]" v-html="features[activeFeature].preview"></div>
          </div>
          <!-- Glow -->
          <div class="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-yellow-400/10 to-green-400/10 blur-2xl -z-10 pointer-events-none"></div>
        </div>
      </div>
    </section>

    <!-- ─── DEVELOPERS ─── -->
    <section id="developers" ref="devsRef" class="py-28 px-6 bg-[#f8faf8]">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <span class="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-[11px] font-bold uppercase tracking-[0.18em] border border-green-200/60 mb-4">Meet the Team</span>
          <h2 class="font-display font-black text-[clamp(30px,5vw,52px)] text-green-950 leading-tight tracking-tight mb-3">The Developers</h2>
          <p class="font-body text-[15px] text-stone-400 max-w-sm mx-auto">Built with dedication by Caraga State University students.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          <div v-for="(dev, i) in developers" :key="dev.name"
            class="group bg-white rounded-3xl p-6 text-center border border-stone-100 shadow-sm
              hover:shadow-xl hover:shadow-green-100/60 hover:-translate-y-2
              transition-all duration-500 overflow-hidden relative"
            :class="devsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
            :style="{ transitionDelay: (i * 0.1) + 's' }">
            <div class="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl"
              :style="{ background: dev.gradient }"></div>

            <div class="relative inline-block mb-4">
              <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-black text-xl shadow-lg mx-auto"
                :style="{ background: dev.gradient }">{{ dev.initials }}</div>
              <div class="absolute -inset-1 rounded-[18px] opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"
                :style="{ background: dev.gradient }"></div>
            </div>

            <h3 class="font-display font-bold text-[13.5px] text-green-950 mb-1 leading-snug">{{ dev.name }}</h3>
            <span class="block text-[10px] font-bold uppercase tracking-wider text-green-500 mb-2">{{ dev.roleShort }}</span>
            <p class="font-body text-[12px] text-stone-400 leading-relaxed mb-4">{{ dev.bio }}</p>

            <div class="flex justify-center gap-2">
              <a href="#" class="w-8 h-8 rounded-xl bg-stone-100 hover:bg-green-100 hover:text-green-700 text-stone-400
                flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a href="#" class="w-8 h-8 rounded-xl bg-stone-100 hover:bg-blue-100 hover:text-blue-600 text-stone-400
                flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer class="bg-green-950 border-t-2 border-green-800/60 pt-20 pb-10 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          <!-- Brand col -->
          <div>
            <div class="flex items-center gap-3 mb-5">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center shadow-lg shadow-green-900/40">
                <svg viewBox="0 0 24 24" class="w-6 h-6 fill-white">
                  <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5Z"/>
                </svg>
              </div>
              <div>
                <div class="font-display font-bold text-white text-[15px]">CSU ECO</div>
                <div class="font-body text-[11px] text-white/35">Project Management System</div>
              </div>
            </div>
            <p class="font-body text-[13.5px] text-white/35 leading-relaxed max-w-xs">
              Empowering the Engineering and Construction Office with modern, efficient project tracking tools.
            </p>
          </div>

          <!-- Links -->
          <div class="grid grid-cols-3 gap-8">
            <div v-for="col in footerCols" :key="col.heading">
              <h4 class="font-display font-bold text-[11px] uppercase tracking-[0.18em] text-yellow-400/80 mb-4">{{ col.heading }}</h4>
              <div class="flex flex-col gap-2.5">
                <a v-for="link in col.links" :key="link" href="#"
                  class="font-body text-[13px] text-white/35 hover:text-white/80 transition-colors duration-200">
                  {{ link }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-8 border-t border-white/8 flex flex-wrap justify-between items-center gap-4">
          <span class="font-body text-[12px] text-white/25">© {{ new Date().getFullYear() }} Caraga State University — ECO. All rights reserved.</span>
          <span class="font-body text-[12px] text-green-600/60 font-medium">Bugsay pa more! 🌿</span>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup>
import Antigravity from '@/components/Antigravity.vue'
import { onMounted, onUnmounted, ref } from 'vue'

const isScrolled = ref(false)
const menuOpen = ref(false)
const heroVisible = ref(false)
const aboutVisible = ref(false)
const devsVisible = ref(false)
const activeFeature = ref(0)

const heroRef = ref(null)
const aboutRef = ref(null)
const devsRef = ref(null)

const navLinks = [
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'Team', href: '#developers', id: 'developers' },
]

const stats = [
  { value: '2', label: 'Units' },
  { value: '3', label: 'Role Types' },
  { value: '∞', label: 'Tasks Tracked' },
  { value: '100%', label: 'Paperless' }
]

const aboutCards = [
  {
    title: 'Task Management',
    body: 'Create, assign, and track tasks across Planning & Design and Project Implementation units with ease.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`
  },
  {
    title: 'Approval Workflow',
    body: 'Multi-level approvals from Unit Head to Director, with dedicated design approval flows including plenary review.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  },
  {
    title: 'Role-Based Access',
    body: 'Director, Unit Head, and Unit Member roles — each with tailored permissions and views within the system.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    title: 'Deadline Tracking',
    body: 'Monitor task durations and deadlines across all units. Urgent tasks are flagged and prioritized automatically.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  },
  {
    title: 'Output Management',
    body: 'Attach deliverables and output links directly to tasks. Track revisions and maintain a clean audit trail.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
  },
  {
    title: 'Comment Threads',
    body: 'Per-task comment sections allow assigners, assignees, and reviewers to communicate in context.',
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  }
]

const features = [
  {
    title: 'Task Assignment',
    desc: 'Assign regular or insertion tasks to any unit member with deadline and urgency controls.',
    preview: `<div style="padding:20px;font-family:'Nunito',sans-serif;font-size:13px">
        <div style="margin-bottom:14px;color:#14532d;font-size:15px;font-weight:700">New Task</div>
        <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;padding:14px;margin-bottom:10px">
          <div style="color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Title</div>
          <div style="color:#14532d;font-weight:600">Site Survey Report — Phase 2</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;padding:12px">
            <div style="color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Assignee</div>
            <div style="color:#14532d;font-weight:600">J. Santos</div>
          </div>
          <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;padding:12px">
            <div style="color:#6b7280;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Deadline</div>
            <div style="color:#14532d;font-weight:600">Mar 15, 2025</div>
          </div>
        </div>
        <div style="display:flex;gap:8px">
          <span style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:20px;padding:4px 12px;font-size:11px;color:#c2410c;font-weight:700">⚡ Urgent</span>
          <span style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:20px;padding:4px 12px;font-size:11px;color:#15803d;font-weight:700">Regular Task</span>
        </div>
      </div>`
  },
  {
    title: 'Approval Pipeline',
    desc: 'Track unit head and director approval status in real-time for every task.',
    preview: `<div style="padding:20px;font-family:'Nunito',sans-serif;font-size:13px">
        <div style="margin-bottom:14px;color:#14532d;font-size:15px;font-weight:700">Approval Status</div>
        ${[['Unit Head','Approved — Mar 10', true],['Director','Awaiting review', false]].map(([r,s,done]) => `
        <div style="display:flex;align-items:center;gap:12px;background:${done?'#f0fdf4':'#fafafa'};border:1.5px solid ${done?'#bbf7d0':'#e5e7eb'};border-radius:14px;padding:12px;margin-bottom:8px">
          <div style="width:32px;height:32px;border-radius:10px;background:${done?'#16a34a':'#e5e7eb'};display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:${done?'#fff':'#9ca3af'};flex-shrink:0">${done?'✓':'○'}</div>
          <div>
            <div style="color:#14532d;font-size:13px;font-weight:700">${r}</div>
            <div style="color:${done?'#16a34a':'#9ca3af'};font-size:11px;margin-top:2px">${s}</div>
          </div>
        </div>`).join('')}
      </div>`
  },
  {
    title: 'Design Review',
    desc: 'Specialized design approval flow with senior draftsman and plenary sign-off.',
    preview: `<div style="padding:20px;font-family:'Nunito',sans-serif;font-size:13px">
        <div style="margin-bottom:14px;color:#14532d;font-size:15px;font-weight:700">Design Approval</div>
        ${[['Senior Draftsman','Approved','#f0fdf4','#bbf7d0','#16a34a'],['Plenary Review','Pending','#fffbeb','#fde68a','#92400e']].map(([r,s,bg,br,tc]) => `
        <div style="background:${bg};border:1.5px solid ${br};border-radius:14px;padding:12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
          <span style="color:#14532d;font-weight:700">${r}</span>
          <span style="background:white;border-radius:20px;padding:3px 12px;font-size:11px;color:${tc};font-weight:700;border:1px solid ${br}">${s}</span>
        </div>`).join('')}
      </div>`
  },
  {
    title: 'Unit Management',
    desc: 'Manage Planning & Design and Project Implementation units with clear member hierarchies.',
    preview: `<div style="padding:20px;font-family:'Nunito',sans-serif;font-size:13px">
        <div style="margin-bottom:14px;color:#14532d;font-size:15px;font-weight:700">Units</div>
        ${['Planning & Design','Project Implementation'].map(u => `
        <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:14px;padding:14px;margin-bottom:10px">
          <div style="color:#15803d;margin-bottom:8px;font-size:12px;font-weight:700">${u}</div>
          <div style="display:flex;gap:6px">
            ${['UH','M1','M2','M3'].map(m => `<div style="width:28px;height:28px;border-radius:8px;background:#dcfce7;border:1.5px solid #86efac;display:flex;align-items:center;justify-content:center;font-size:9px;color:#15803d;font-weight:700">${m}</div>`).join('')}
          </div>
        </div>`).join('')}
      </div>`
  }
]

const developers = [
  { name: 'June Luis Bermudez', initials: 'JL', roleShort: 'Chairperson / Full-Stack', bio: 'Architected the Supabase schema and Vue frontend integration.', gradient: 'linear-gradient(135deg,#14532d,#16a34a)' },
  { name: 'Austine Rey Manlangit', initials: 'AR', roleShort: '1st VP / Full-Stack', bio: 'Designed user experience using optimized systems.', gradient: 'linear-gradient(135deg,#166534,#ca8a04)' },
  { name: 'Jacky Barneso', initials: 'J', roleShort: '2nd VP / Back-end', bio: 'Built authentication, RLS policies, and approval logic.', gradient: 'linear-gradient(135deg,#14532d,#ea580c)' },
  { name: 'Nheron Louise Cedro', initials: 'NL', roleShort: 'Member / Back-end', bio: 'Developed task management and dashboard views in Vue.', gradient: 'linear-gradient(135deg,#15803d,#16a34a)' },
  { name: 'Cyrel John Rollo', initials: 'CJ', roleShort: 'Member / QA & Docs', bio: 'Handled testing, documentation, and system deployment.', gradient: 'linear-gradient(135deg,#166534,#d97706)' },
]

const footerCols = [
  { heading: 'System', links: ['Dashboard', 'Tasks', 'Approvals', 'Reports'] },
  { heading: 'Units', links: ['Planning & Design', 'Project Implementation', 'Directors'] },
  { heading: 'Info', links: ['About CSU', 'Contact ECO', 'Privacy Policy'] },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  menuOpen.value = false
}

let observers = []

function observe(el, callback) {
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { callback(); obs.disconnect() }
  }, { threshold: 0.12 })
  if (el) obs.observe(el)
  observers.push(obs)
}

onMounted(() => {
  const onScroll = () => { isScrolled.value = window.scrollY > 40 }
  window.addEventListener('scroll', onScroll)
  setTimeout(() => { heroVisible.value = true }, 100)
  observe(aboutRef.value, () => { aboutVisible.value = true })
  observe(devsRef.value, () => { devsVisible.value = true })
  const cycle = setInterval(() => {
    activeFeature.value = (activeFeature.value + 1) % features.length
  }, 3500)
  observers.push({ disconnect: () => clearInterval(cycle) })
})

onUnmounted(() => observers.forEach(o => o.disconnect()))
</script>

<style>
/* Google Fonts — Nunito (rounded) + Fraunces (display) */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,800;0,900;1,700&family=Nunito:wght@400;500;600;700&display=swap');

.font-display { font-family: 'Fraunces', Georgia, serif; }
.font-body    { font-family: 'Nunito', system-ui, sans-serif; }

/* Blobs */
@keyframes blob1 { 0%,100%{transform:translate(0,0)} 40%{transform:translate(40px,-30px)} 70%{transform:translate(-20px,20px)} }
@keyframes blob2 { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-30px,20px)} 70%{transform:translate(20px,-20px)} }
.animate-blob1 { animation: blob1 10s ease-in-out infinite; }
.animate-blob2 { animation: blob2 13s ease-in-out infinite; }

/* Scroll line */
@keyframes scrollLine {
  0%   { transform: scaleY(0); transform-origin: top; }
  49%  { transform: scaleY(1); transform-origin: top; }
  50%  { transform: scaleY(1); transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}
.animate-scroll-line { animation: scrollLine 2.2s ease-in-out infinite; }

/* Feature card fade-in on change */
@keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px) scale(0.98); } to { opacity:1; transform:none; } }
.feature-display-enter { animation: fadeSlideIn 0.35s cubic-bezier(.16,1,.3,1); }
</style>