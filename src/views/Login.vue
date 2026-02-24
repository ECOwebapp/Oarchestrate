<template>
  <div class="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
    <!-- Background image with blur overlay -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Caraga_State_University_main_building.jpg/1280px-Caraga_State_University_main_building.jpg');"
    ></div>
    <div class="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

    <!-- Login card -->
    <div
      class="relative z-10 w-full max-w-md mx-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl px-10 py-10"
    >
      <!-- Logos -->
      <div class="flex justify-center items-center gap-3 mb-5">
        <img
          src="../img/csu_logo.png"
          class="w-16 h-16 object-contain drop-shadow"
        />
        <!-- ECOmmunicate placeholder badge -->
        <div
          class="w-16 h-16 rounded-full bg-green-800 flex items-center justify-center shadow-md border-2 border-yellow-400"
        >
          <span class="text-white text-[9px] font-bold text-center leading-tight px-1">ECOmmunicate</span>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-center text-3xl font-bold text-gray-800 tracking-wide mb-8"
        style="font-family: 'Georgia', serif; letter-spacing: 0.04em;">
        Oarchestrate
      </h1>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
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
        <!-- Remember me -->
        <div class="flex items-center gap-2">
          <input
            id="remember"
            v-model="form.rememberMe"
            type="checkbox"
            class="w-4 h-4 rounded accent-green-700 cursor-pointer"
          />
          <label for="remember" class="text-sm text-gray-600 cursor-pointer select-none">Remember me</label>
        </div>

        <!-- Create account link -->
        <p class="text-center text-sm text-gray-500">
          Don't have account yet?
          <a href="#" class="text-green-800 font-semibold hover:underline">Create account.</a>
        </p>

        <!-- Sign In button -->
        <button
          type="submit"
          class="w-full py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm"
        >
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const form = reactive({
  idNumber: '',
  password: '',
  rememberMe: true,
})

function handleSubmit() {
  console.log('Login submitted:', form)
  // Add your authentication logic here
}
</script>

<style scoped>
/* Additional polish */
input::placeholder {
  color: #9ca3af;
}
</style>