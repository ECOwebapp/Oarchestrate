<template>
  <div class="app" ref="appRef">
    <!-- ─── NAVBAR ─── -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-inner">
        <div class="nav-brand">
          <div class="csu-seal">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#009900" stroke-width="1.5" />
              <circle cx="20" cy="20" r="13" stroke="#009900" stroke-width="0.8" />
              <path d="M20 8 L22 15 L29 15 L23.5 19.5 L25.5 26.5 L20 22 L14.5 26.5 L16.5 19.5 L11 15 L18 15 Z"
                fill="#009900" />
            </svg>
          </div>
          <span class="brand-text">CSU <span class="brand-accent">oarchestrate</span></span>
        </div>
        <div class="nav-links">
          <a href="#about" @click.prevent="scrollTo('about')">About</a>
          <a href="#features" @click.prevent="scrollTo('features')">Features</a>
          <a href="#developers" @click.prevent="scrollTo('developers')">Team</a>
          <router-link to="/login" class="nav-cta">Sign In</router-link>
        </div>
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }">
          <span></span><span></span><span></span>
        </button>
      </div>
      <div class="mobile-menu" :class="{ open: menuOpen }">
        <a href="#about" @click="menuOpen = false">About</a>
        <a href="#features" @click="menuOpen = false">Features</a>
        <a href="#developers" @click="menuOpen = false">Team</a>
        <router-link to="/login" class="nav-cta" @click="menuOpen = false">Sign In</router-link>
      </div>
    </nav>

    <!-- ─── HERO ─── -->
    <section class="hero w-screen" ref="heroRef">
      <div class="hero-bg">
        <div class="bg-mesh"></div>
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
        <Antigravity :count="300" :magnetRadius="10" :ringRadius="10" :waveSpeed="0.4" :waveAmplitude="1"
          :particleSize="2" :lerpSpeed="0.1" color="#009900" :autoAnimate="false" :particleVariance="1"
          :rotationSpeed="0" :depthFactor="1" :pulseSpeed="3" particleShape="capsule" :fieldStrength="10" />
      </div>
      <div class="hero-content">
        <div class="hero-badge" :class="{ visible: heroVisible }">
          <span class="badge-dot"></span>
          Caraga State University — ECO
        </div>

        <h1 class="hero-title" :class="{ visible: heroVisible }">
          <span class="title-line line-1">Project</span>
          <span class="title-line line-2">Management</span>
          <span class="title-line line-3">
            <span class="title-outline">System</span>
          </span>
        </h1>

        <p class="hero-sub" :class="{ visible: heroVisible }">
          A unified platform for the Engineering and Construction Office — streamlining
          task assignments, design approvals, and project tracking across all units.
        </p>

        <div class="hero-actions" :class="{ visible: heroVisible }">
          <button class="btn-primary">
            <span>Get Started</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button class="btn-ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
            </svg>
            Watch Demo
          </button>
        </div>

        <div class="hero-stats" :class="{ visible: heroVisible }">
          <div class="stat" v-for="s in stats" :key="s.label">
            <span class="stat-value">{{ s.value }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>

      <div class="scroll-indicator" :class="{ visible: heroVisible }">
        <span>Scroll</span>
        <div class="scroll-line"></div>
      </div>
    </section>

    <!-- ─── ABOUT ─── -->
    <section class="about" id="about" ref="aboutRef">
      <div class="section-header">
        <div class="section-tag">About the System</div>
        <h2 class="section-title">
          Built for the <span class="highlight">ECO</span> — <br>
          Designed for Efficiency
        </h2>
        <p class="section-desc">
          The Oarchestrate Project Management System centralizes all capital project workflows —
          from task creation to multi-level approvals — in one cohesive platform.
        </p>
      </div>

      <div class="about-cards" ref="aboutCardsRef">
        <div v-for="(card, i) in aboutCards" :key="card.title" class="about-card" :class="{ visible: aboutVisible }"
          :style="{ transitionDelay: (i * 0.1) + 's' }">
          <div class="card-icon-wrap">
            <div class="card-icon" v-html="card.icon"></div>
          </div>
          <h3 class="card-title">{{ card.title }}</h3>
          <p class="card-body">{{ card.body }}</p>
          <div class="card-accent"></div>
        </div>
      </div>
    </section>

    <!-- ─── FEATURES ─── -->
    <section class="features" id="features" ref="featuresRef">
      <div class="features-inner">
        <div class="features-left">
          <div class="section-tag light">Key Features</div>
          <h2 class="section-title light">Everything you need<br>to manage projects</h2>
          <p class="section-desc light">
            Designed around the real workflows of the Capital Projects Management Office,
            every feature serves a purpose.
          </p>

          <div class="feature-list">
            <div v-for="(f, i) in features" :key="f.title" class="feature-item" :class="{ active: activeFeature === i }"
              @mouseenter="activeFeature = i">
              <div class="feature-dot"></div>
              <div>
                <div class="feature-title">{{ f.title }}</div>
                <div class="feature-desc">{{ f.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="features-right">
          <div class="feature-display">
            <div class="display-card" :key="activeFeature">
              <div class="display-header">
                <div class="display-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="display-label">{{ features[activeFeature].title }}</span>
              </div>
              <div class="display-body" v-html="features[activeFeature].preview"></div>
            </div>
            <div class="display-glow"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── DEVELOPERS ─── -->
    <section class="developers" id="developers" ref="devsRef">
      <div class="section-header">
        <div class="section-tag">Meet the Team</div>
        <h2 class="section-title">The Developers</h2>
        <p class="section-desc">
          Built with dedication by a team of Caraga State University students.
        </p>
      </div>

      <div class="dev-cards">
        <div v-for="(dev, i) in developers" :key="dev.name" class="dev-card" :class="{ visible: devsVisible }"
          :style="{ transitionDelay: (i * 0.12) + 's' }">
          <div class="dev-avatar-wrap">
            <div class="dev-avatar" :style="{ background: dev.gradient }">
              <span>{{ dev.initials }}</span>
            </div>
            <div class="dev-ring"></div>
          </div>
          <div class="dev-info">
            <h3 class="dev-name">{{ dev.name }}</h3>
            <span class="dev-role">{{ dev.role }}</span>
            <p class="dev-bio">{{ dev.bio }}</p>
          </div>
          <div class="dev-links">
            <a href="#" class="dev-link" title="GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a href="#" class="dev-link" title="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── FOOTER ─── -->
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">
            <div class="csu-seal large">
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="27" stroke="#009900" stroke-width="1.5" />
                <circle cx="30" cy="30" r="20" stroke="#009900" stroke-width="0.8" />
                <path d="M30 12 L33 21 L43 21 L35.5 27 L38 36 L30 31 L22 36 L24.5 27 L17 21 L27 21 Z" fill="#009900" />
              </svg>
            </div>
            <div>
              <div class="footer-brand-name">CSU ECO</div>
              <div class="footer-brand-sub">Project Management System</div>
            </div>
          </div>
          <p class="footer-tagline">
            Empowering the Engineering and Construction Office with modern,
            efficient project tracking tools.
          </p>
        </div>

        <div class="footer-links-group">
          <div class="footer-col">
            <h4>System</h4>
            <a href="#">Dashboard</a>
            <a href="#">Tasks</a>
            <a href="#">Approvals</a>
            <a href="#">Reports</a>
          </div>
          <div class="footer-col">
            <h4>Units</h4>
            <a href="#">Planning & Design</a>
            <a href="#">Project Implementation</a>
            <a href="#">Directors</a>
          </div>
          <div class="footer-col">
            <h4>Info</h4>
            <a href="#">About CSU</a>
            <a href="#">Contact ECO</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© {{ new Date().getFullYear() }} Caraga State University — ECO. All rights reserved.</span>
        <span>Bugsay pa more!</span>
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
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`
  },
  {
    title: 'Approval Workflow',
    body: 'Multi-level approvals from Unit Head to Director, with dedicated design approval flows including plenary review.',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
  },
  {
    title: 'Role-Based Access',
    body: 'Director, Unit Head, and Unit Member roles — each with tailored permissions and views within the system.',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    title: 'Deadline Tracking',
    body: 'Monitor task durations and deadlines across all units. Urgent tasks are flagged and prioritized automatically.',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
  },
  {
    title: 'Output Management',
    body: 'Attach deliverables and output links directly to tasks. Track revisions and maintain a clean audit trail.',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
  },
  {
    title: 'Comment Threads',
    body: 'Per-task comment sections allow assigners, assignees, and reviewers to communicate in context.',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`
  }
]

const features = [
  {
    title: 'Task Assignment',
    desc: 'Assign regular or insertion tasks to any unit member with deadline and urgency controls.',
    preview: `
      <div style="padding:16px;font-family:monospace;font-size:13px;color:#009900">
        <div style="margin-bottom:12px;color:#003300;font-size:14px;font-weight:600">New Task</div>
        <div style="background:rgba(0,153,0,0.08);border:1px solid rgba(0,153,0,0.25);border-radius:8px;padding:12px;margin-bottom:8px">
          <div style="color:#4d4d4d;font-size:11px;margin-bottom:4px">TITLE</div>
          <div style="color:#003300">Site Survey Report — Phase 2</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:rgba(0,153,0,0.08);border:1px solid rgba(0,153,0,0.25);border-radius:8px;padding:10px">
            <div style="color:#4d4d4d;font-size:11px;margin-bottom:4px">ASSIGNEE</div>
            <div style="color:#003300">J. Santos</div>
          </div>
          <div style="background:rgba(0,153,0,0.08);border:1px solid rgba(0,153,0,0.25);border-radius:8px;padding:10px">
            <div style="color:#4d4d4d;font-size:11px;margin-bottom:4px">DEADLINE</div>
            <div style="color:#003300">Mar 15, 2025</div>
          </div>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px">
          <div style="background:rgba(255,153,0,0.15);border-radius:20px;padding:4px 10px;font-size:11px;color:#FF9900">● Urgent</div>
          <div style="background:rgba(0,153,0,0.12);border-radius:20px;padding:4px 10px;font-size:11px;color:#009900">Regular Task</div>
        </div>
      </div>`
  },
  {
    title: 'Approval Pipeline',
    desc: 'Track unit head and director approval status in real-time for every task.',
    preview: `
      <div style="padding:16px;font-family:monospace;font-size:13px">
        <div style="margin-bottom:12px;color:#003300;font-size:14px;font-weight:600">Approval Status</div>
        ${['Unit Head', 'Director'].map((r, i) => `
        <div style="display:flex;align-items:center;gap:12px;background:rgba(0,153,0,0.06);border:1px solid rgba(0,153,0,0.2);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="width:28px;height:28px;border-radius:50%;background:${i === 0 ? '#009900' : 'rgba(0,153,0,0.15)'};display:flex;align-items:center;justify-content:center;font-size:14px;color:#fff">${i === 0 ? '✓' : '○'}</div>
          <div>
            <div style="color:#003300;font-size:12px">${r}</div>
            <div style="color:${i === 0 ? '#009900' : '#4d4d4d'};font-size:10px">${i === 0 ? 'Approved — Mar 10' : 'Awaiting review'}</div>
          </div>
        </div>`).join('')}
      </div>`
  },
  {
    title: 'Design Review',
    desc: 'Specialized design approval flow with senior draftsman and plenary sign-off.',
    preview: `
      <div style="padding:16px;font-family:monospace;font-size:13px">
        <div style="margin-bottom:12px;color:#003300;font-size:14px;font-weight:600">Design Approval</div>
        ${['Senior Draftsman', 'Plenary Review'].map((r, i) => `
        <div style="background:rgba(0,153,0,0.06);border:1px solid rgba(0,153,0,0.2);border-radius:8px;padding:10px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="color:#003300">${r}</span>
            <span style="background:${i === 1 ? 'rgba(249,220,7,0.15)' : 'rgba(0,153,0,0.15)'};border-radius:20px;padding:2px 10px;font-size:10px;color:${i === 1 ? '#8B7A00' : '#009900'}">${i === 1 ? 'Pending' : 'Approved'}</span>
          </div>
        </div>`).join('')}
      </div>`
  },
  {
    title: 'Unit Management',
    desc: 'Manage Planning & Design and Project Implementation units with clear member hierarchies.',
    preview: `
      <div style="padding:16px;font-family:monospace;font-size:13px">
        <div style="margin-bottom:12px;color:#003300;font-size:14px;font-weight:600">Units</div>
        ${['Planning & Design Unit', 'Project Implementation Unit'].map(u => `
        <div style="background:rgba(0,153,0,0.06);border:1px solid rgba(0,153,0,0.2);border-radius:8px;padding:12px;margin-bottom:8px">
          <div style="color:#009900;margin-bottom:6px;font-size:12px">${u}</div>
          <div style="display:flex;gap:6px">
            ${['UH', 'M1', 'M2', 'M3'].map(m => `<div style="width:26px;height:26px;border-radius:50%;background:rgba(0,153,0,0.15);display:flex;align-items:center;justify-content:center;font-size:9px;color:#009900">${m}</div>`).join('')}
          </div>
        </div>`).join('')}
      </div>`
  }
]

const developers = [
  {
    name: 'June Luis Bermudez',
    initials: 'JL',
    role: 'Chairperson, ECO Interns Council / Full-Stack Developer',
    bio: 'Architected the Supabase schema and Vue frontend integration.',
    gradient: 'linear-gradient(135deg, #003300, #009900)'
  },
  {
    name: 'Austine Rey Manlangit',
    initials: 'AR',
    role: 'First Vice Chairperson / Full-Stack Developer',
    bio: 'Designed user experience using optimized systems.',
    gradient: 'linear-gradient(135deg, #005500, #F9DC07)'
  },
  {
    name: 'Jacky Barneso',
    initials: 'J',
    role: 'Second Vice Chairperson / Back-end Developer',
    bio: 'Built the authentication, RLS policies, and approval logic.',
    gradient: 'linear-gradient(135deg, #003300, #FF9900)'
  },
  {
    name: 'Nheron Louise Cedro',
    initials: 'NL',
    role: 'Member / Back-end Developer',
    bio: 'Developed the task management and dashboard views in Vue.',
    gradient: 'linear-gradient(135deg, #007700, #009900)'
  },
  {
    name: 'Cyrel John Rollo',
    initials: 'CJ',
    role: 'Member / QA & Documentation',
    bio: 'Handled testing, documentation, and system deployment.',
    gradient: 'linear-gradient(135deg, #004400, #FF9900)'
  }
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  menuOpen.value = false
}

let observers = []

function observe(el, callback) {
  const obs = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { callback(); obs.disconnect() }
  }, { threshold: 0.15 })
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

<style scoped>
/* ─── CSS Variables ─── */
:root {
  --green: #009900;
  --green-dark: #003300;
  --green-mid: #005500;
  --yellow: #F9DC07;
  --orange: #FF9900;
  --grey: #4d4d4d;
  --white: #FFFFFF;
  --off-white: #FEFFFF;
  --text-dark: #1a1a1a;
  --text-mid: #4d4d4d;
  --text-muted: #7a7a7a;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.app {
  background: #FEFFFF;
  color: var(--text-dark);
  font-family: 'Georgia', 'Times New Roman', serif;
  overflow-x: hidden;
}

/* ─── NAVBAR ─── */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 0;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: rgba(254, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 14px 0;
  border-bottom: 2px solid #009900;
  box-shadow: 0 2px 24px rgba(0, 153, 0, 0.08);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #003300;
  letter-spacing: 0.05em;
}

.csu-seal svg {
  width: 36px;
  height: 36px;
}

.csu-seal.large svg {
  width: 52px;
  height: 52px;
}

.brand-accent {
  color: #009900;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-links a {
  color: #4d4d4d;
  text-decoration: none;
  font-size: 14px;
  letter-spacing: 0.04em;
  transition: color 0.2s;
  font-family: 'Arial', sans-serif;
  font-weight: 500;
}

.nav-links a:hover {
  color: #009900;
}

.nav-cta {
  background: linear-gradient(135deg, #003300, #009900);
  border: none;
  color: #FEFFFF;
  padding: 9px 22px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-family: 'Arial', sans-serif;
  letter-spacing: 0.05em;
  font-weight: 600;
  transition: all 0.2s;
}

.nav-cta:hover {
  background: linear-gradient(135deg, #009900, #F9DC07);
  color: #003300;
  box-shadow: 0 4px 16px rgba(0, 153, 0, 0.3);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: #009900;
  transition: all 0.3s;
}

.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 12px 32px 20px;
  gap: 12px;
  border-top: 1px solid rgba(0, 153, 0, 0.2);
  margin-top: 12px;
  background: rgba(254, 255, 255, 0.97);
}

.mobile-menu a {
  color: #4d4d4d;
  text-decoration: none;
  font-size: 15px;
  font-family: 'Arial', sans-serif;
}

/* ─── HERO ─── */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 120px 32px 80px;
  background: linear-gradient(160deg, #FEFFFF 0%, #f0fff0 40%, #e8ffe8 70%, #FEFFFF 100%);
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

/* Decorative gradient orbs */
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #009900, transparent 70%);
  top: -100px;
  left: -100px;
  animation: orbFloat 8s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #F9DC07, transparent 70%);
  bottom: -80px;
  right: -80px;
  animation: orbFloat 10s ease-in-out infinite reverse;
  opacity: 0.25;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, #FF9900, transparent 70%);
  top: 50%;
  right: 10%;
  animation: orbFloat 12s ease-in-out infinite;
  opacity: 0.18;
}

@keyframes orbFloat {

  0%,
  100% {
    transform: translate(0, 0);
  }

  33% {
    transform: translate(30px, -20px);
  }

  66% {
    transform: translate(-20px, 20px);
  }
}

/* Subtle grid */
.bg-mesh {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 153, 0, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 153, 0, 0.04) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 153, 0, 0.08);
  border: 1px solid rgba(0, 153, 0, 0.3);
  color: #005500;
  padding: 8px 18px;
  border-radius: 30px;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-family: 'Arial', sans-serif;
  font-weight: 600;
  margin-bottom: 32px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.6s ease;
}

.hero-badge.visible {
  opacity: 1;
  transform: translateY(0);
}

.badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #009900;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

.hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: clamp(52px, 9vw, 110px);
  font-weight: 700;
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin-bottom: 28px;
}

.title-line {
  display: block;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.hero-title.visible .line-1 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.15s;
  color: #003300;
}

.hero-title.visible .line-2 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.25s;
  color: #009900;
}

.hero-title.visible .line-3 {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.35s;
}

.title-outline {
  -webkit-text-stroke: 2px #009900;
  color: transparent;
}

.hero-sub {
  font-size: 17px;
  line-height: 1.7;
  color: #4d4d4d;
  max-width: 560px;
  margin: 0 auto 40px;
  font-family: 'Arial', sans-serif;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s ease 0.5s;
}

.hero-sub.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 60px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s ease 0.65s;
}

.hero-actions.visible {
  opacity: 1;
  transform: translateY(0);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #003300 0%, #009900 100%);
  color: #FEFFFF;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Arial', sans-serif;
  cursor: pointer;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #009900, #F9DC07);
  opacity: 0;
  transition: opacity 0.3s;
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:hover {
  color: #003300;
}

.btn-primary span,
.btn-primary svg {
  position: relative;
  z-index: 1;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 153, 0, 0.25);
}

.btn-ghost {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 153, 0, 0.06);
  color: #009900;
  border: 1.5px solid rgba(0, 153, 0, 0.4);
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 15px;
  font-family: 'Arial', sans-serif;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-ghost:hover {
  background: rgba(0, 153, 0, 0.12);
  border-color: #009900;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 153, 0, 0.12);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.7s ease 0.8s;
}

.hero-stats.visible {
  opacity: 1;
  transform: translateY(0);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #009900;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7a7a7a;
  font-family: 'Arial', sans-serif;
}

.scroll-indicator {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.7s ease 1.2s;
}

.scroll-indicator.visible {
  opacity: 1;
}

.scroll-indicator span {
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #7a7a7a;
  font-family: 'Arial', sans-serif;
}

.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, #009900, transparent);
  animation: scrollDrop 2s ease-in-out infinite;
}

@keyframes scrollDrop {
  0% {
    transform: scaleY(0);
    transform-origin: top;
  }

  50% {
    transform: scaleY(1);
    transform-origin: top;
  }

  51% {
    transform: scaleY(1);
    transform-origin: bottom;
  }

  100% {
    transform: scaleY(0);
    transform-origin: bottom;
  }
}

/* ─── ABOUT ─── */
.about {
  padding: 120px 32px;
  max-width: 1200px;
  margin: 0 auto;
  background: transparent;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-tag {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #009900;
  background: rgba(0, 153, 0, 0.08);
  border: 1px solid rgba(0, 153, 0, 0.25);
  padding: 5px 16px;
  border-radius: 20px;
  font-family: 'Arial', sans-serif;
  font-weight: 700;
  margin-bottom: 20px;
}

.section-tag.light {
  color: #FEFFFF;
  background: rgba(254, 255, 255, 0.1);
  border-color: rgba(254, 255, 255, 0.25);
}

.section-title {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 700;
  color: #003300;
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

.section-title .highlight {
  color: #009900;
}

.section-title.light {
  color: #FEFFFF;
}

.section-desc {
  font-size: 16px;
  color: #4d4d4d;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.7;
  font-family: 'Arial', sans-serif;
}

.section-desc.light {
  color: rgba(254, 255, 255, 0.7);
}

.about-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.about-card {
  background: linear-gradient(135deg, rgba(0, 153, 0, 0.05) 0%, #FFFFFF 100%);
  border: 1.5px solid rgba(0, 153, 0, 0.15);
  border-radius: 16px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: default;
}

.about-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.about-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 153, 0, 0.07), rgba(249, 220, 7, 0.04));
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 16px;
}

.about-card:hover::before {
  opacity: 1;
}

.about-card:hover {
  border-color: #009900;
  transform: translateY(-4px) !important;
  box-shadow: 0 20px 60px rgba(0, 153, 0, 0.12);
}

.card-accent {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #003300, #009900, #F9DC07);
  transform: scaleX(0);
  transition: transform 0.3s;
  border-radius: 0 0 16px 16px;
}

.about-card:hover .card-accent {
  transform: scaleX(1);
}

.card-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(0, 153, 0, 0.12), rgba(249, 220, 7, 0.08));
  border: 1.5px solid rgba(0, 153, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: #009900;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #003300;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.card-body {
  font-size: 14px;
  line-height: 1.7;
  color: #4d4d4d;
  font-family: 'Arial', sans-serif;
}

/* ─── FEATURES ─── */
.features {
  background: linear-gradient(160deg, #003300 0%, #005500 50%, #003300 100%);
  padding: 120px 32px;
  position: relative;
  overflow: hidden;
}

/* Decorative stripes */
.features::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #003300, #F9DC07, #FF9900, #F9DC07, #003300);
}

.features::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #003300, #FF9900, #F9DC07, #FF9900, #003300);
}

/* Subtle pattern overlay */
.features-inner::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(254, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(254, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.features-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
}

.features-left .section-header {
  text-align: left;
  margin-bottom: 40px;
}

.features-left .section-header .section-tag {
  margin-bottom: 12px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.feature-item:hover,
.feature-item.active {
  background: rgba(254, 255, 255, 0.07);
  border-color: rgba(249, 220, 7, 0.25);
}

.feature-dot {
  width: 8px;
  height: 8px;
  min-width: 8px;
  border-radius: 50%;
  background: rgba(254, 255, 255, 0.2);
  margin-top: 6px;
  transition: all 0.25s;
}

.feature-item.active .feature-dot {
  background: #F9DC07;
  box-shadow: 0 0 8px rgba(249, 220, 7, 0.6);
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(254, 255, 255, 0.75);
  margin-bottom: 3px;
  font-family: 'Arial', sans-serif;
  transition: color 0.25s;
}

.feature-item.active .feature-title {
  color: #F9DC07;
}

.feature-desc {
  font-size: 13px;
  color: rgba(254, 255, 255, 0.4);
  line-height: 1.5;
  font-family: 'Arial', sans-serif;
}

.features-right {
  position: relative;
}

.feature-display {
  position: relative;
}

.display-card {
  background: #FEFFFF;
  border: 1.5px solid rgba(0, 153, 0, 0.2);
  border-radius: 16px;
  overflow: hidden;
  animation: fadeIn 0.4s ease;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.97);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.display-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 153, 0, 0.15);
  background: rgba(0, 153, 0, 0.04);
}

.display-dots {
  display: flex;
  gap: 6px;
}

.display-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(0, 153, 0, 0.2);
}

.display-dots span:first-child {
  background: rgba(255, 100, 100, 0.5);
}

.display-label {
  font-size: 12px;
  color: #4d4d4d;
  font-family: 'Arial', sans-serif;
}

.display-body {
  min-height: 200px;
}

.display-glow {
  position: absolute;
  inset: -1px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(249, 220, 7, 0.08), transparent 50%);
  pointer-events: none;
}

/* ─── DEVELOPERS ─── */
.developers {
  padding: 120px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.dev-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.dev-card {
  background: linear-gradient(160deg, rgba(0, 153, 0, 0.06), #FFFFFF);
  border: 1.5px solid rgba(0, 153, 0, 0.12);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.dev-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.dev-card:hover {
  border-color: #009900;
  transform: translateY(-6px) !important;
  box-shadow: 0 24px 64px rgba(0, 153, 0, 0.14);
}

.dev-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(0, 153, 0, 0.05), rgba(249, 220, 7, 0.03));
  opacity: 0;
  transition: opacity 0.3s;
}

.dev-card:hover::before {
  opacity: 1;
}

/* Colorful top accent bar */
.dev-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #003300, #009900, #F9DC07);
  transform: scaleX(0);
  transition: transform 0.3s;
}

.dev-card:hover::after {
  transform: scaleX(1);
}

.dev-avatar-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
}

.dev-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: #FEFFFF;
  position: relative;
  z-index: 1;
}

.dev-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 153, 0, 0.3);
  animation: ringPulse 3s ease-in-out infinite;
}

@keyframes ringPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }

  50% {
    transform: scale(1.08);
    opacity: 1;
  }
}

.dev-name {
  font-size: 15px;
  font-weight: 700;
  color: #003300;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.dev-role {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #009900;
  font-family: 'Arial', sans-serif;
  font-weight: 700;
  display: block;
  margin-bottom: 12px;
}

.dev-bio {
  font-size: 12px;
  line-height: 1.6;
  color: #4d4d4d;
  font-family: 'Arial', sans-serif;
  margin-bottom: 16px;
}

.dev-links {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.dev-link {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 153, 0, 0.07);
  border: 1px solid rgba(0, 153, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4d4d4d;
  text-decoration: none;
  transition: all 0.2s;
}

.dev-link:hover {
  background: rgba(0, 153, 0, 0.15);
  color: #009900;
  border-color: #009900;
  transform: translateY(-2px);
}

/* ─── FOOTER ─── */
.footer {
  background: linear-gradient(180deg, #003300 0%, #001a00 100%);
  border-top: 3px solid #009900;
  padding: 80px 32px 40px;
}

.footer-top {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 80px;
  margin-bottom: 60px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.footer-brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #FEFFFF;
  letter-spacing: 0.05em;
}

.footer-brand-sub {
  font-size: 12px;
  color: rgba(254, 255, 255, 0.45);
  font-family: 'Arial', sans-serif;
  margin-top: 2px;
}

.footer-tagline {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(254, 255, 255, 0.45);
  max-width: 340px;
  font-family: 'Arial', sans-serif;
}

.footer-links-group {
  display: flex;
  gap: 48px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col h4 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #F9DC07;
  font-family: 'Arial', sans-serif;
  font-weight: 700;
  margin-bottom: 6px;
}

.footer-col a {
  font-size: 13px;
  color: rgba(254, 255, 255, 0.4);
  text-decoration: none;
  font-family: 'Arial', sans-serif;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: #F9DC07;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 32px;
  border-top: 1px solid rgba(254, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: rgba(254, 255, 255, 0.25);
  font-family: 'Arial', sans-serif;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 900px) {
  .features-inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .footer-top {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .footer-links-group {
    flex-wrap: wrap;
    gap: 32px;
  }
}

@media (max-width: 640px) {
  .nav-links {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .mobile-menu.open {
    display: flex;
  }

  .hero-title {
    font-size: clamp(40px, 12vw, 72px);
  }

  .hero-stats {
    gap: 24px;
  }

  .dev-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .about-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 400px) {
  .dev-cards {
    grid-template-columns: 1fr;
  }
}
</style>