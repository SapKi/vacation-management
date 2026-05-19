<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🏖️</span>
          <span class="logo-text">Vacation Manager</span>
        </div>
        <nav class="nav">
          <RouterLink to="/requester" class="nav-link" active-class="active">
            My Requests
          </RouterLink>
          <RouterLink to="/validator" class="nav-link" active-class="active">
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
</script>
