<template>
  <div class="lp">
    <div class="lp-grid" />
    <div class="lp-glow lp-glow--a" />
    <div class="lp-glow lp-glow--b" />

    <div class="lp-card">
      <!-- Logo -->
      <div class="lp-logo">
        <CalendarRange :size="22" stroke-width="1.75" />
      </div>
      <h1 class="lp-title">Sign in</h1>
      <p class="lp-sub">Choose your account to continue</p>

      <!-- Error -->
      <div v-if="error" class="lp-error">
        <AlertCircle :size="14" stroke-width="2" />
        {{ error }}
      </div>

      <!-- Account tiles -->
      <div class="lp-accounts">
        <button
          v-for="account in accounts"
          :key="account.id"
          class="lp-account"
          :class="{ 'lp-account--loading': loggingIn === account.id }"
          :disabled="!!loggingIn"
          @click="signIn(account)"
        >
          <span :class="['lp-account-avatar', account.role === 'Requester' ? 'lp-account-avatar--blue' : 'lp-account-avatar--violet']">
            {{ account.name[0] }}
          </span>
          <span class="lp-account-info">
            <strong>{{ account.name }}</strong>
            <span>{{ account.role }}</span>
          </span>
          <span class="lp-account-role-badge" :class="account.role === 'Requester' ? 'lp-badge--blue' : 'lp-badge--violet'">
            {{ account.role }}
          </span>
          <span v-if="loggingIn === account.id" class="lp-spinner" />
          <ChevronRight v-else :size="16" stroke-width="2" class="lp-account-arrow" />
        </button>

        <div v-if="loadingAccounts" class="lp-loading">
          <span class="lp-spinner" /> Loading accounts…
        </div>
      </div>

      <p class="lp-hint">
        Your session is stored locally in this browser.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { CalendarRange, AlertCircle, ChevronRight } from "lucide-vue-next";
import { authService, type AuthUser } from "../services/auth";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { setUser } = useAuth();

const accounts       = ref<AuthUser[]>([]);
const loadingAccounts = ref(true);
const loggingIn      = ref<number | null>(null);
const error          = ref("");

onMounted(async () => {
  try {
    const { data } = await authService.getAccounts();
    accounts.value = data;
  } catch {
    error.value = "Could not load accounts. Is the backend running?";
  } finally {
    loadingAccounts.value = false;
  }
});

async function signIn(account: AuthUser) {
  loggingIn.value = account.id;
  error.value = "";
  try {
    const { data } = await authService.login(account.name);
    setUser(data);
    router.push(data.role === "Requester" ? "/requester" : "/validator");
  } catch (err: any) {
    error.value = err?.response?.data?.error || "Sign in failed.";
  } finally {
    loggingIn.value = null;
  }
}
</script>

<style scoped>
.lp {
  position: relative;
  min-height: calc(100vh - 58px);
  background: #060b18;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 2rem 1.5rem;
}

.lp-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

.lp-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
}
.lp-glow--a {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%);
  top: -120px; left: -80px;
}
.lp-glow--b {
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%);
  bottom: -100px; right: -60px;
}

/* Card */
.lp-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  background: #0d1526;
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
}

.lp-logo {
  width: 48px; height: 48px;
  background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  color: #818cf8;
}

.lp-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -0.4px;
  margin-bottom: 0.3rem;
}

.lp-sub {
  font-size: 0.82rem;
  color: #475569;
  margin-bottom: 1.5rem;
}

.lp-error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(220,38,38,0.1);
  border: 1px solid rgba(220,38,38,0.25);
  color: #fca5a5;
  border-radius: 8px;
  padding: 0.6rem 0.875rem;
  font-size: 0.78rem;
  margin-bottom: 1rem;
}

/* Account tiles */
.lp-accounts {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}

.lp-account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.16s ease;
  font-family: inherit;
  text-align: left;
}

.lp-account:hover:not(:disabled) {
  background: rgba(99,102,241,0.08);
  border-color: rgba(99,102,241,0.35);
  transform: translateX(2px);
}

.lp-account:disabled { opacity: 0.6; cursor: not-allowed; }

.lp-account-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lp-account-avatar--blue   { background: #1e3a5f; color: #93c5fd; }
.lp-account-avatar--violet { background: #2e1065; color: #c4b5fd; }

.lp-account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.lp-account-info strong { font-size: 0.875rem; font-weight: 700; color: #e2e8f0; }
.lp-account-info span   { font-size: 0.72rem;  color: #475569; }

.lp-account-role-badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0.18rem 0.5rem;
  border-radius: 9999px;
}
.lp-badge--blue   { background: rgba(37,99,235,0.15);  color: #93c5fd; border: 1px solid rgba(37,99,235,0.3); }
.lp-badge--violet { background: rgba(124,58,237,0.15); color: #c4b5fd; border: 1px solid rgba(124,58,237,0.3); }

.lp-account-arrow { color: #334155; transition: transform 0.16s, color 0.16s; }
.lp-account:hover:not(:disabled) .lp-account-arrow { transform: translateX(3px); color: #6366f1; }

.lp-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(99,102,241,0.2);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.lp-loading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #475569;
  font-size: 0.78rem;
  padding: 0.5rem 0;
}

.lp-hint {
  text-align: center;
  font-size: 0.7rem;
  color: #1e293b;
}
</style>
