<template>
  <div class="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
    <!-- Background -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background: url('../../public/images/CSU-LOGO-ANIMATION.mp4');"
    ></div>
    <div class="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

    <!-- Register card -->
    <div
      class="relative z-10 w-full max-w-md mx-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl px-10 py-10 my-5"
    >
      <!-- Logo -->
      <div class="flex justify-center items-center gap-3 mb-5">
        <img
          src="../../public/images/csu_logo.png"
          class="w-32 h-32 object-contain drop-shadow"
        />
      </div>

      <!-- Title -->
      <h1
        class="text-center text-3xl font-bold text-gray-800 tracking-wide mb-8"
        style="font-family: 'Georgia', serif; letter-spacing: 0.04em;"
      >
        Create Account
      </h1>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="space-y-4">

        <!-- Firstname -->
        <div>
          <input
            v-model="form.firstName"
            type="text"
            placeholder="First Name"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-700 bg-white transition placeholder-gray-400 text-sm"
          />
        </div>

        <!-- Lastname -->
        <div>
          <input
            v-model="form.lastName"
            type="text"
            placeholder="Last Name"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-700 bg-white transition placeholder-gray-400 text-sm"
          />
        </div>

        <!-- Unit Dropdown -->
        <div>
          <select
            v-model="form.unit"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-700 bg-white transition text-sm"
          >
            <option disabled value="">Select Unit</option>
            <option value="IT Department">IT Department</option>
            <option value="HR Department">HR Department</option>
            <option value="Finance Office">Finance Office</option>
            <option value="Registrar">Registrar</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <!-- ID Number -->
        <div>
          <input
            v-model="form.idNumber"
            type="text"
            placeholder="ID Number"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-700 bg-white transition placeholder-gray-400 text-sm"
          />
        </div>

        <!-- Password -->
        <div>
          <input
            v-model="form.password"
            type="password"
            placeholder="Password"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent text-gray-700 bg-white transition placeholder-gray-400 text-sm"
          />
        </div>

        <!-- Back to Login -->
        <p class="text-center text-sm text-gray-500">
          Already have an account?
          <RouterLink
            to="/login"
            class="text-green-800 font-semibold hover:underline"
          >
            Sign in.
          </RouterLink>
        </p>

        <!-- Register button -->
        <button
          type="submit"
          class="w-full py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm"
        >
          Register
        </button>

      </form>
    </div>
  </div>
</template>

<script setup vapor>
import { reactive } from 'vue';
import { RouterLink } from 'vue-router';

const form = reactive({
  firstName: '',
  lastName: '',
  unit: '',
  idNumber: '',
  password: '',
})

function handleRegister() {
  if (!form.firstName || !form.lastName || !form.unit || !form.idNumber || !form.password) {
    alert('Please fill in all fields.')
    return
  }

  console.log('Register submitted:', form)
  // Add registration logic here
}
</script>

<style scoped>
input::placeholder {
  color: #9ca3af;
}
</style>