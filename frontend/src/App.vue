<template>
  <div class="app">
    <header class="app-header">
      <div class="header-content">
        <RouterLink :to="ROUTES.HOME" class="logo">
          <CalendarRange :size="22" stroke-width="2" />
          <span class="logo-text">Vacation Manager</span>
        </RouterLink>

        <div class="header-right">
          <template v-if="isLoggedIn">
            <nav class="nav">
              <RouterLink :to="ROUTES.REQUESTER" class="nav-link" active-class="active">
                <User :size="15" stroke-width="2" />
                My Requests
              </RouterLink>
              <RouterLink :to="ROUTES.VALIDATOR" class="nav-link" active-class="active">
                <ClipboardList :size="15" stroke-width="2" />
                Manage Requests
              </RouterLink>
            </nav>

            <div class="header-divider" />

            <div class="header-user">
              <span class="header-user-avatar">{{ currentUser!.name[0] }}</span>
              <span class="header-user-name">{{ currentUser!.name }}</span>
            </div>

            <button class="header-logout" @click="handleLogout" title="Sign out">
              <LogOut :size="15" stroke-width="2" />
            </button>
          </template>
        </div>
      </div>
    </header>

    <main :class="['main-content', { 'main-content--flush': isFlush }]">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CalendarRange, User, ClipboardList, LogOut } from "lucide-vue-next";
import { useAuth } from "./composables/useAuth";
import { ROUTES } from "./constants";

const route  = useRoute();
const router = useRouter();
const { currentUser, isLoggedIn, logout } = useAuth();

const isFlush = computed(() =>
  route.path === ROUTES.HOME || route.path === ROUTES.LOGIN || route.path === ROUTES.SIGNUP
);

function handleLogout() {
  logout();
  router.push(ROUTES.LOGIN);
}
</script>
