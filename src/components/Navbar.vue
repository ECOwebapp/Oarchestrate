<script setup vapor>
import profile_bg from "../styles/bg_profile.jpg"

const bg_profile = profile_bg
</script>

<template>
    <nav class="flex-col">
        <div class="bg-[url(bg_profile)] bg-cover bg-center">
        </div>
        <ul class=" flex flex-col justify-between">
            <RouterLink to="/">Dashboard</RouterLink>
            <RouterLink to="/tasks">Tasks</RouterLink>
            <RouterLink to="/design">Design</RouterLink>
            <RouterLink to="/organisation">Organization</RouterLink>
            <RouterLink to="/analytics">Analytics</RouterLink>
            <RouterLink to="/profile">Profile</RouterLink>
            <RouterLink>Logout</RouterLink>
        </ul>
    </nav>
</template>