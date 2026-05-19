<template>
  <div class="request-card">
    <div class="request-card-header">
      <div>
        <div class="request-dates">
          {{ formatDate(request.start_date) }} → {{ formatDate(request.end_date) }}
          <span style="font-size:0.8rem; color:#94a3b8; font-weight:400; margin-left:0.5rem">
            ({{ dayCount }} day{{ dayCount !== 1 ? "s" : "" }})
          </span>
        </div>
        <div v-if="showEmployee && request.user" class="request-employee">
          👤 {{ request.user.name }}
        </div>
        <div class="request-meta">
          <span>Submitted {{ formatRelative(request.created_at) }}</span>
        </div>
      </div>
      <StatusBadge :status="request.status" />
    </div>

    <div v-if="request.reason" class="request-reason">
      "{{ request.reason }}"
    </div>

    <div v-if="request.status === 'Rejected' && request.comments" class="request-comments">
      <strong>Manager note:</strong> {{ request.comments }}
    </div>

    <!-- Validator actions -->
    <div v-if="showActions && request.status === 'Pending'" class="request-actions">
      <button
        class="btn btn-success btn-sm"
        :disabled="actionLoading"
        @click="$emit('approve', request.id)"
      >
        ✓ Approve
      </button>
      <button
        class="btn btn-danger btn-sm"
        :disabled="actionLoading"
        @click="$emit('reject', request.id)"
      >
        ✗ Reject
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import StatusBadge from "./StatusBadge.vue";
import type { VacationRequest } from "../services/vacationRequestsApi";

const props = defineProps<{
  request: VacationRequest;
  showActions?: boolean;
  showEmployee?: boolean;
  actionLoading?: boolean;
}>();

defineEmits<{
  approve: [id: number];
  reject: [id: number];
}>();

const dayCount = computed(() => {
  const start = new Date(props.request.start_date);
  const end = new Date(props.request.end_date);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
</script>
