<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal" role="dialog" aria-modal="true">

      <div class="modal-header">
        <h3 class="modal-title">Request Details</h3>
        <button class="modal-close" @click="$emit('close')" aria-label="Close">
          <X :size="16" stroke-width="2.5" />
        </button>
      </div>

      <div class="modal-body">
        <div class="vd-status-row">
          <StatusBadge :status="request.status" />
          <span class="vd-meta">{{ formatRelative(request.created_at) }}</span>
        </div>

        <div class="vd-grid">
          <div class="vd-field">
            <span class="vd-label">Start Date</span>
            <span class="vd-value">{{ formatDate(request.start_date) }}</span>
          </div>
          <div class="vd-field">
            <span class="vd-label">End Date</span>
            <span class="vd-value">{{ formatDate(request.end_date) }}</span>
          </div>
          <div class="vd-field">
            <span class="vd-label">Duration</span>
            <span class="vd-value">{{ dayCount }} day{{ dayCount !== 1 ? "s" : "" }}</span>
          </div>
          <div v-if="request.user" class="vd-field">
            <span class="vd-label">Employee</span>
            <span class="vd-value">{{ request.user.name }}</span>
          </div>
        </div>

        <div v-if="request.reason" class="vd-section">
          <span class="vd-label">Reason</span>
          <p class="vd-text">{{ request.reason }}</p>
        </div>

        <div v-if="request.comments" class="vd-section vd-comments">
          <span class="vd-label">
            <MessageSquare :size="12" stroke-width="2" style="margin-right:4px; vertical-align:middle" />
            Manager Note
          </span>
          <p class="vd-text">{{ request.comments }}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" @click="$emit('close')">Close</button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { X, MessageSquare } from "lucide-vue-next";
import StatusBadge from "./StatusBadge.vue";
import type { VacationRequest } from "../services/vacationRequestsApi";
import { formatDate, formatRelative, daysBetween } from "../utils/date";

const props = defineProps<{ request: VacationRequest }>();
defineEmits<{ close: [] }>();

const dayCount = computed(() => daysBetween(props.request.start_date, props.request.end_date));
</script>

<style scoped>
.vd-status-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.vd-meta {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.vd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.vd-field {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.55rem 0.75rem;
}

.vd-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.vd-value {
  font-size: 0.88rem;
  color: var(--text);
  font-weight: 500;
}

.vd-section {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.vd-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.6rem 0.75rem;
}

.vd-comments .vd-label {
  color: var(--danger);
}

.vd-comments .vd-text {
  border-color: var(--danger-border);
  background: var(--danger-bg);
}
</style>
