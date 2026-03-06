import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'

// stub the router's useRoute to avoid undefined during tests
import { vi } from 'vitest'
vi.mock('vue-router', () => ({
  useRoute: () => ({ meta: {} }),
  useRouter: () => ({ push: () => {} }),
}))

describe('App', () => {
  it('mounts renders properly', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia()],
      },
    })
    expect(wrapper.text()).toContain('Logout') // application header text
  })
})
