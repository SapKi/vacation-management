<template>
  <div class="hp">
    <div class="hp-grid" />
    <div class="hp-glow hp-glow--a" />
    <div class="hp-glow hp-glow--b" />
    <div class="hp-glow hp-glow--c" />

    <div class="hp-body">
      <div class="hp-badge">
        <span class="hp-badge-dot" />
        Vacation Management Platform
      </div>

      <h1 class="hp-headline">
        Time Off, <span class="hp-headline-grad">Handled.</span>
      </h1>
      <p class="hp-sub">
        Submit requests, track approvals, and keep your whole team aligned —
        from one clean workspace.
      </p>

      <!-- Already logged in -->
      <template v-if="isLoggedIn">
        <div class="hp-session">
          <span class="hp-session-avatar">{{ currentUser!.name[0] }}</span>
          <div class="hp-session-info">
            <span class="hp-session-name">{{ currentUser!.name }}</span>
            <span class="hp-session-role">{{ currentUser!.role }}</span>
          </div>
        </div>
        <div class="hp-actions">
          <RouterLink :to="currentUser!.role === 'Requester' ? '/requester' : '/validator'" class="hp-btn hp-btn--primary">
            <ArrowRight :size="17" stroke-width="2" />
            Continue to Dashboard
          </RouterLink>
          <button class="hp-btn hp-btn--ghost" @click="switchAccount">
            <RefreshCw :size="16" stroke-width="2" />
            Switch Account
          </button>
        </div>
      </template>

      <!-- Not logged in -->
      <template v-else>
        <div class="hp-actions">
          <RouterLink to="/login" class="hp-btn hp-btn--primary">
            <LogIn :size="17" stroke-width="2" />
            Sign In
            <ChevronRight :size="15" stroke-width="2.5" class="hp-btn-arrow" />
          </RouterLink>
          <RouterLink to="/signup" class="hp-btn hp-btn--ghost">
            <UserPlus :size="17" stroke-width="2" />
            Create Account
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { LogIn, UserPlus, ChevronRight, ArrowRight, RefreshCw } from "lucide-vue-next";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { currentUser, isLoggedIn, logout } = useAuth();

function switchAccount() {
  logout();
  router.push("/login");
}
</script>

<style scoped>
.hp {
  position: relative;
  min-height: calc(100vh - 58px);
  background: #060b18;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 3rem 1.5rem;
}

.hp-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

.hp-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
}
.hp-glow--a { width: 560px; height: 560px; background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%); top: -140px; left: -80px; }
.hp-glow--b { width: 480px; height: 480px; background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%); bottom: -120px; right: -60px; }
.hp-glow--c { width: 300px; height: 300px; background: radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%); top: 30%; right: 15%; }

.hp-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 600px;
}

.hp-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 1rem;
  border-radius: 9999px;
  background: rgba(99,102,241,0.12);
  border: 1px solid rgba(99,102,241,0.3);
  color: #a5b4fc;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  margin-bottom: 1.75rem;
}

.hp-badge-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 6px rgba(99,102,241,0.9);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.85); }
}

.hp-headline {
  font-size: clamp(2.8rem, 6vw, 4.2rem);
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -1.5px;
  line-height: 1.08;
  margin-bottom: 1.1rem;
}

.hp-headline-grad {
  background: linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hp-sub {
  font-size: 1rem;
  color: #64748b;
  line-height: 1.7;
  max-width: 440px;
  margin-bottom: 2.25rem;
}

/* Logged-in session pill */
.hp-session {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(99,102,241,0.25);
  border-radius: 12px;
  padding: 0.7rem 1.1rem;
  margin-bottom: 1.5rem;
}

.hp-session-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: rgba(99,102,241,0.2);
  border: 1px solid rgba(99,102,241,0.4);
  color: #a5b4fc;
  font-size: 0.85rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hp-session-info { display: flex; flex-direction: column; text-align: left; }
.hp-session-name { font-size: 0.875rem; font-weight: 700; color: #e2e8f0; }
.hp-session-role { font-size: 0.72rem; color: #475569; }

/* Buttons */
.hp-actions {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  justify-content: center;
}

.hp-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.6rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  letter-spacing: -0.1px;
  transition: all 0.18s ease;
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.hp-btn--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  box-shadow: 0 0 0 1px rgba(99,102,241,0.4), 0 4px 20px rgba(99,102,241,0.35);
}
.hp-btn--primary:hover {
  background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
  box-shadow: 0 0 0 1px rgba(99,102,241,0.5), 0 6px 28px rgba(99,102,241,0.5);
  transform: translateY(-2px);
}

.hp-btn-arrow { transition: transform 0.18s ease; }
.hp-btn--primary:hover .hp-btn-arrow { transform: translateX(3px); }

.hp-btn--ghost {
  background-image: linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.6)),
                    linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5));
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border: 1.5px solid transparent;
  color: #94a3b8;
}
.hp-btn--ghost:hover {
  color: #e2e8f0;
  background-image: linear-gradient(rgba(30,40,68,0.8), rgba(30,40,68,0.8)),
                    linear-gradient(135deg, rgba(99,102,241,0.8), rgba(139,92,246,0.8));
  background-origin: border-box;
  background-clip: padding-box, border-box;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99,102,241,0.18);
}

@media (max-width: 480px) {
  .hp-actions { flex-direction: column; align-items: stretch; }
  .hp-btn { justify-content: center; }
}
</style>
