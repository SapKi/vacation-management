<template>
  <div class="app">
    <VacationDeco />
    <header class="app-header">
      <div class="header-content">
        <RouterLink :to="ROUTES.HOME" class="logo">
          <CalendarRange :size="22" stroke-width="2" />
          <span class="logo-text">Vacation Manager</span>
        </RouterLink>

        <div class="header-right">
          <template v-if="isLoggedIn">
            <nav class="nav">
              <template v-if="currentUser!.role === UserRole.REQUESTER">
                <RouterLink :to="ROUTES.REQUESTER" class="nav-link" active-class="active">
                  <User :size="15" stroke-width="2" />
                  My Requests
                </RouterLink>
                <button class="nav-switch" @click="handleSwitchRole" title="Switch to Validator account">
                  <ArrowLeftRight :size="13" stroke-width="2" />
                  Switch to Validator
                </button>
              </template>
              <template v-else>
                <RouterLink :to="ROUTES.VALIDATOR" class="nav-link" active-class="active">
                  <ClipboardList :size="15" stroke-width="2" />
                  Manage Requests
                </RouterLink>
                <button class="nav-switch" @click="handleSwitchRole" title="Switch to Requester account">
                  <ArrowLeftRight :size="13" stroke-width="2" />
                  Switch to Requester
                </button>
              </template>
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
import { CalendarRange, User, ClipboardList, LogOut, ArrowLeftRight } from "lucide-vue-next";
import { useAuth } from "./composables/useAuth";
import { ROUTES, UserRole } from "./constants";
import VacationDeco from "./components/VacationDeco.vue";

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

function handleSwitchRole() {
  logout();
  router.push(ROUTES.LOGIN);
}
</script>
