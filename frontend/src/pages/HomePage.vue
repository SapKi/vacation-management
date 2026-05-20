<template>
  <div class="hp">
    <!-- Background layers -->
    <div class="hp-grid" />
    <div class="hp-glow hp-glow--a" />
    <div class="hp-glow hp-glow--b" />
    <div class="hp-glow hp-glow--c" />

    <!-- Content -->
    <div class="hp-body">

      <!-- Eyebrow badge -->
      <div class="hp-badge">
        <span class="hp-badge-dot" />
        Vacation Management Platform
      </div>

      <!-- Headline -->
      <h1 class="hp-headline">
        Time Off, <span class="hp-headline-grad">Handled.</span>
      </h1>

      <!-- Sub -->
      <p class="hp-sub">
        Submit requests, track approvals, and keep your whole team aligned —
        from one clean workspace.
      </p>

      <!-- Action buttons -->
      <div class="hp-actions">
        <RouterLink to="/requester" class="hp-btn hp-btn--primary">
          <User :size="17" stroke-width="2" />
          Request Time Off
          <ChevronRight :size="15" stroke-width="2.5" class="hp-btn-arrow" />
        </RouterLink>
        <RouterLink to="/validator" class="hp-btn hp-btn--ghost">
          <ShieldCheck :size="17" stroke-width="2" />
          Review Requests
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { User, ShieldCheck, ChevronRight } from "lucide-vue-next";
</script>

<style scoped>
/* ── Full-page dark shell ── */
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

/* ── Grid overlay ── */
.hp-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

/* ── Glow orbs ── */
.hp-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(80px);
}
.hp-glow--a {
  width: 560px; height: 560px;
  background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%);
  top: -140px; left: -80px;
}
.hp-glow--b {
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%);
  bottom: -120px; right: -60px;
}
.hp-glow--c {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%);
  top: 30%; right: 15%;
}

/* ── Content block ── */
.hp-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 600px;
  gap: 0;
}

/* ── Badge ── */
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

/* ── Headline ── */
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

/* ── Sub ── */
.hp-sub {
  font-size: 1rem;
  color: #64748b;
  line-height: 1.7;
  max-width: 440px;
  margin-bottom: 2.5rem;
}

/* ── Buttons ── */
.hp-actions {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2.75rem;
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
  position: relative;
  cursor: pointer;
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
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  /* gradient border via background-clip trick */
  background-image: linear-gradient(rgba(15,23,42,0.6), rgba(15,23,42,0.6)),
                    linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.5));
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border: 1.5px solid transparent;
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

/* ── Responsive ── */
@media (max-width: 480px) {
  .hp-actions { flex-direction: column; align-items: stretch; }
  .hp-btn { justify-content: center; }
}
</style>
