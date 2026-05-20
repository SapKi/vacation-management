<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <RouterLink to="/" class="logo">
          <CalendarRange :size="22" stroke-width="2" />
          <span class="logo-text">Vacation Manager</span>
        </RouterLink>
        <nav class="nav">
          <RouterLink to="/requester" class="nav-link" active-class="active">
            <User :size="15" stroke-width="2" />
            My Requests
          </RouterLink>
          <RouterLink to="/validator" class="nav-link" active-class="active">
            <ClipboardList :size="15" stroke-width="2" />
            Manage Requests
          </RouterLink>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { CalendarRange, User, ClipboardList } from "lucide-vue-next";
</script>
