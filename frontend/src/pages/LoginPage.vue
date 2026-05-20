<template>
  <div class="lp">
    <div class="lp-grid" />
    <div class="lp-glow lp-glow--a" />
    <div class="lp-glow lp-glow--b" />

    <div class="lp-card">
      <div class="lp-logo"><CalendarRange :size="22" stroke-width="1.75" /></div>
      <h1 class="lp-title">Welcome back</h1>
      <p class="lp-sub">Sign in to your account to continue</p>

      <div v-if="error" class="lp-error">
        <AlertCircle :size="14" stroke-width="2" /> {{ error }}
      </div>

      <form @submit.prevent="submit" novalidate autocomplete="off">
        <div class="lp-field">
          <label class="lp-label">Full name</label>
          <input v-model="form.name" type="text" class="lp-input" :class="{ 'lp-input--err': errors.name }"
            placeholder="e.g. Alice Johnson" autocomplete="off" />
          <span v-if="errors.name" class="lp-field-err">{{ errors.name }}</span>
        </div>

        <div class="lp-field">
          <label class="lp-label">Password</label>
          <input v-model="form.password" type="password" class="lp-input" :class="{ 'lp-input--err': errors.password }"
            placeholder="••••••••" autocomplete="new-password" />
          <span v-if="errors.password" class="lp-field-err">{{ errors.password }}</span>
        </div>

        <button type="submit" class="lp-submit" :disabled="loading">
          <span v-if="loading" class="lp-spinner" />
          {{ loading ? "Signing in…" : "Sign In" }}
          <ArrowRight v-if="!loading" :size="16" stroke-width="2.5" />
        </button>
      </form>

      <div class="lp-footer">
        Don't have an account?
        <RouterLink :to="ROUTES.SIGNUP" class="lp-link">Create one</RouterLink>
      </div>

      <!-- Demo hint -->
      <div class="lp-demo">
        <span class="lp-demo-label">Demo accounts</span>
        <div class="lp-demo-rows">
          <button class="lp-demo-btn" type="button" @click="fillDemo('Alice Johnson', 'Tr0pic@lLeave!')">
            Alice Johnson <span class="lp-demo-role">Requester</span>
          </button>
          <button class="lp-demo-btn" type="button" @click="fillDemo('Bob Smith', 'Appr0ve&Rest!')">
            Bob Smith <span class="lp-demo-role">Validator</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { CalendarRange, AlertCircle, ArrowRight } from "lucide-vue-next";
import { authService } from "../services/auth";
import { useAuth }     from "../composables/useAuth";
import { ROUTES, roleToRoute } from "../constants";
import { getApiError } from "../utils/error";

const router = useRouter();
const { setUser } = useAuth();

const form   = reactive({ name: "", password: "" });
const errors = reactive({ name: "", password: "" });
const error  = ref("");
const loading = ref(false);

function fillDemo(name: string, password: string) {
  form.name     = name;
  form.password = password;
}

function validate() {
  errors.name = errors.password = "";
  if (!form.name.trim())  errors.name     = "Name is required";
  if (!form.password)     errors.password = "Password is required";
  return !errors.name && !errors.password;
}

async function submit() {
  if (!validate()) return;
  loading.value = true;
  error.value   = "";
  try {
    const { data } = await authService.login(form.name.trim(), form.password);
    setUser(data);
    router.push(roleToRoute(data.role));
  } catch (err: unknown) {
    error.value = getApiError(err, "Sign in failed. Please try again.");
  } finally {
    loading.value = false;
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
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}
.lp-glow { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); }
.lp-glow--a { width: 500px; height: 500px; background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%); top: -120px; left: -80px; }
.lp-glow--b { width: 420px; height: 420px; background: radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%); bottom: -100px; right: -60px; }

.lp-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 400px;
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
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem; color: #818cf8;
}
.lp-title { font-size: 1.4rem; font-weight: 800; color: #f1f5f9; letter-spacing: -0.4px; margin-bottom: 0.3rem; text-align: center; }
.lp-sub   { font-size: 0.82rem; color: #475569; margin-bottom: 1.5rem; text-align: center; }

.lp-error {
  display: flex; align-items: center; gap: 0.4rem;
  background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.25);
  color: #fca5a5; border-radius: 8px; padding: 0.6rem 0.875rem;
  font-size: 0.78rem; margin-bottom: 1rem;
}

.lp-field { margin-bottom: 1rem; }
.lp-label { display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.4rem; letter-spacing: 0.2px; }
.lp-input {
  width: 100%; padding: 0.65rem 0.875rem;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; color: #f1f5f9; font-size: 0.875rem; font-family: inherit;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.lp-input::placeholder { color: #334155; }
.lp-input:focus { border-color: rgba(99,102,241,0.6); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
.lp-input--err { border-color: rgba(220,38,38,0.5); }
.lp-field-err { display: block; font-size: 0.72rem; color: #f87171; margin-top: 0.3rem; }

.lp-submit {
  width: 100%; margin-top: 0.5rem;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.72rem;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff; border: none; border-radius: 10px;
  font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 20px rgba(99,102,241,0.35);
  transition: all 0.18s ease;
}
.lp-submit:hover:not(:disabled) { background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%); transform: translateY(-1px); }
.lp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.lp-footer { text-align: center; font-size: 0.78rem; color: #475569; margin-top: 1.25rem; }
.lp-link { color: #818cf8; text-decoration: none; font-weight: 600; }
.lp-link:hover { color: #a5b4fc; }

/* Demo hint */
.lp-demo {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.lp-demo-label { display: block; font-size: 0.67rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #f1f5f9; margin-bottom: 0.6rem; }
.lp-demo-rows  { display: flex; flex-direction: column; gap: 0.4rem; }
.lp-demo-btn {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06); border-radius: 8px;
  color: #475569; font-size: 0.75rem; cursor: pointer; font-family: inherit;
  transition: all 0.14s;
}
.lp-demo-btn:hover { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.25); color: #94a3b8; }
.lp-demo-role { font-size: 0.65rem; color: #334155; }

.lp-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
