<template>
  <div class="sp">
    <div class="sp-grid" />
    <div class="sp-glow sp-glow--a" />
    <div class="sp-glow sp-glow--b" />

    <div class="sp-card">
      <div class="sp-logo"><CalendarRange :size="22" stroke-width="1.75" /></div>
      <h1 class="sp-title">Create account</h1>
      <p class="sp-sub">Choose your role and get started</p>

      <div v-if="error" class="sp-error">
        <AlertCircle :size="14" stroke-width="2" /> {{ error }}
      </div>

      <form @submit.prevent="submit" novalidate>
        <!-- Role selector -->
        <div class="sp-field">
          <label class="sp-label">I am a…</label>
          <div class="sp-roles">
            <button
              type="button"
              :class="['sp-role-tile', form.role === UserRole.REQUESTER && 'sp-role-tile--active']"
              @click="form.role = UserRole.REQUESTER"
            >
              <span class="sp-role-icon sp-role-icon--blue"><User :size="18" stroke-width="1.75" /></span>
              <span class="sp-role-text">
                <strong>Requester</strong>
                <span>Submit vacation requests</span>
              </span>
              <span class="sp-role-check" v-if="form.role === UserRole.REQUESTER">
                <CheckCircle :size="16" stroke-width="2.5" />
              </span>
            </button>
            <button
              type="button"
              :class="['sp-role-tile', form.role === UserRole.VALIDATOR && 'sp-role-tile--active sp-role-tile--active-green']"
              @click="form.role = UserRole.VALIDATOR"
            >
              <span class="sp-role-icon sp-role-icon--green"><ShieldCheck :size="18" stroke-width="1.75" /></span>
              <span class="sp-role-text">
                <strong>Validator</strong>
                <span>Review &amp; approve requests</span>
              </span>
              <span class="sp-role-check sp-role-check--green" v-if="form.role === UserRole.VALIDATOR">
                <CheckCircle :size="16" stroke-width="2.5" />
              </span>
            </button>
          </div>
          <span v-if="errors.role" class="sp-field-err">{{ errors.role }}</span>
        </div>

        <div class="sp-field">
          <label class="sp-label">Full name</label>
          <input v-model="form.name" type="text" class="sp-input" :class="{ 'sp-input--err': errors.name }"
            placeholder="e.g. Jane Smith" autocomplete="name" />
          <span v-if="errors.name" class="sp-field-err">{{ errors.name }}</span>
        </div>

        <div class="sp-field">
          <label class="sp-label">Password</label>
          <input v-model="form.password" type="password" class="sp-input" :class="{ 'sp-input--err': errors.password }"
            placeholder="Min. 4 characters" autocomplete="new-password" />
          <span v-if="errors.password" class="sp-field-err">{{ errors.password }}</span>
        </div>

        <div class="sp-field" style="margin-bottom:0">
          <label class="sp-label">Confirm password</label>
          <input v-model="form.confirm" type="password" class="sp-input" :class="{ 'sp-input--err': errors.confirm }"
            placeholder="Repeat password" autocomplete="new-password" />
          <span v-if="errors.confirm" class="sp-field-err">{{ errors.confirm }}</span>
        </div>

        <button type="submit" class="sp-submit" :disabled="loading">
          <span v-if="loading" class="sp-spinner" />
          {{ loading ? "Creating account…" : "Create Account" }}
          <ArrowRight v-if="!loading" :size="16" stroke-width="2.5" />
        </button>
      </form>

      <div class="sp-footer">
        Already have an account?
        <RouterLink :to="ROUTES.LOGIN" class="sp-link">Sign in</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { CalendarRange, AlertCircle, ArrowRight, User, ShieldCheck, CheckCircle } from "lucide-vue-next";
import { authService }            from "../services/auth";
import { useAuth }                from "../composables/useAuth";
import { ROUTES, UserRole, roleToRoute } from "../constants";
import { getApiError }            from "../utils/error";

const router = useRouter();
const { setUser } = useAuth();

const form = reactive({ name: "", role: "" as UserRole | "", password: "", confirm: "" });
const errors = reactive({ name: "", role: "", password: "", confirm: "" });
const error   = ref("");
const loading = ref(false);

function validate() {
  errors.name = errors.role = errors.password = errors.confirm = "";
  if (!form.role)              errors.role     = "Please select a role";
  if (!form.name.trim())       errors.name     = "Name is required";
  if (form.password.length < 4) errors.password = "Password must be at least 4 characters";
  if (form.password !== form.confirm) errors.confirm = "Passwords do not match";
  return !errors.role && !errors.name && !errors.password && !errors.confirm;
}

async function submit() {
  if (!validate()) return;
  loading.value = true;
  error.value   = "";
  try {
    const { data } = await authService.register({ name: form.name.trim(), role: form.role as UserRole, password: form.password });
    setUser(data);
    router.push(roleToRoute(data.role));
  } catch (err: unknown) {
    error.value = getApiError(err, "Registration failed. Please try again.");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.sp {
  position: relative;
  min-height: calc(100vh - 58px);
  background: #060b18;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; padding: 2rem 1.5rem;
}
.sp-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}
.sp-glow { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); }
.sp-glow--a { width: 500px; height: 500px; background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%); top: -120px; left: -80px; }
.sp-glow--b { width: 420px; height: 420px; background: radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%); bottom: -100px; right: -60px; }

.sp-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 420px;
  background: #0d1526; border: 1px solid rgba(99,102,241,0.2);
  border-radius: 20px; padding: 2rem;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1);
}

.sp-logo {
  width: 48px; height: 48px; background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.3); border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem; color: #818cf8;
}
.sp-title { font-size: 1.4rem; font-weight: 800; color: #f1f5f9; letter-spacing: -0.4px; margin-bottom: 0.3rem; text-align: center; }
.sp-sub   { font-size: 0.82rem; color: #475569; margin-bottom: 1.5rem; text-align: center; }

.sp-error {
  display: flex; align-items: center; gap: 0.4rem;
  background: rgba(220,38,38,0.1); border: 1px solid rgba(220,38,38,0.25);
  color: #fca5a5; border-radius: 8px; padding: 0.6rem 0.875rem;
  font-size: 0.78rem; margin-bottom: 1rem;
}

.sp-field { margin-bottom: 1rem; }
.sp-label { display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.5rem; letter-spacing: 0.2px; }
.sp-input {
  width: 100%; padding: 0.65rem 0.875rem;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; color: #f1f5f9; font-size: 0.875rem; font-family: inherit;
  outline: none; transition: border-color 0.15s, box-shadow 0.15s;
}
.sp-input::placeholder { color: #334155; }
.sp-input:focus { border-color: rgba(99,102,241,0.6); box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
.sp-input--err { border-color: rgba(220,38,38,0.5); }
.sp-field-err { display: block; font-size: 0.72rem; color: #f87171; margin-top: 0.3rem; }

/* Role tiles */
.sp-roles { display: flex; flex-direction: column; gap: 0.5rem; }

.sp-role-tile {
  display: flex; align-items: center; gap: 0.75rem;
  background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.08);
  border-radius: 10px; padding: 0.75rem 0.875rem;
  cursor: pointer; font-family: inherit; text-align: left; transition: all 0.15s;
}
.sp-role-tile:hover { border-color: rgba(99,102,241,0.35); background: rgba(99,102,241,0.06); }
.sp-role-tile--active { border-color: rgba(99,102,241,0.6) !important; background: rgba(99,102,241,0.1) !important; }
.sp-role-tile--active-green { border-color: rgba(5,150,105,0.6) !important; background: rgba(5,150,105,0.08) !important; }

.sp-role-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.sp-role-icon--blue  { background: rgba(37,99,235,0.15); color: #93c5fd; }
.sp-role-icon--green { background: rgba(5,150,105,0.15); color: #6ee7b7; }

.sp-role-text { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.sp-role-text strong { font-size: 0.82rem; font-weight: 700; color: #e2e8f0; }
.sp-role-text span   { font-size: 0.72rem; color: #475569; }

.sp-role-check       { color: #818cf8; margin-left: auto; }
.sp-role-check--green { color: #34d399; }

.sp-submit {
  width: 100%; margin-top: 1.25rem;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.72rem; background: linear-gradient(135deg, #ccb800 0%, #ffe600 100%);
  color: #0d1117; border: none; border-radius: 10px;
  font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 20px rgba(255,230,0,0.35); transition: all 0.18s ease;
}
.sp-submit:hover:not(:disabled) { background: linear-gradient(135deg, #ffe600 0%, #fff176 100%); transform: translateY(-1px); }
.sp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.sp-footer { text-align: center; font-size: 0.78rem; color: #475569; margin-top: 1.25rem; }
.sp-link { color: #ffe600; text-decoration: none; font-weight: 600; }
.sp-link:hover { color: #fff176; }

.sp-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
