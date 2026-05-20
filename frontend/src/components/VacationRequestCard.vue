<template>
  <div :class="['request-card', `request-card--${request.status.toLowerCase()}`]">
    <div class="request-card-inner">
      <div class="request-card-header">
        <div>
          <div class="request-dates">
            {{ formatDate(request.start_date) }}
            <span style="color:#94a3b8; font-weight:400; margin: 0 0.3rem">→</span>
            {{ formatDate(request.end_date) }}
            <span class="request-duration">({{ dayCount }}d)</span>
          </div>
          <div v-if="showEmployee && request.user" class="request-employee">
            <User :size="12" stroke-width="2.5" />
            {{ request.user.name }}
          </div>
          <div class="request-meta">{{ formatRelative(request.created_at) }}</div>
        </div>
        <StatusBadge :status="request.status" />
      </div>
      <div v-if="request.reason" class="request-reason">{{ request.reason }}</div>
    </div>

    <div v-if="request.status === RequestStatus.REJECTED && request.comments" class="request-comments">
      <MessageSquare :size="13" stroke-width="2" style="flex-shrink:0; margin-top:1px" />
      <span><strong>Manager note:</strong> {{ request.comments }}</span>
    </div>

    <div
      v-if="request.status === RequestStatus.PENDING && (showActions || showEdit || showCancel)"
      class="request-actions"
    >
      <button v-if="showEdit" class="btn btn-ghost btn-sm" @click="$emit('edit', request.id)">
        <Pencil :size="13" stroke-width="2.5" /> Edit
      </button>
      <button v-if="showCancel" class="btn btn-ghost btn-sm" @click="$emit('cancel', request.id)">
        <Ban :size="13" stroke-width="2.5" /> Cancel
      </button>
      <template v-if="showActions">
        <button class="btn btn-success btn-sm" :disabled="actionLoading" @click="$emit('approve', request.id)">
          <Check :size="13" stroke-width="3" /> Approve
        </button>
        <button class="btn btn-danger btn-sm" :disabled="actionLoading" @click="$emit('reject', request.id)">
          <X :size="13" stroke-width="3" /> Reject
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { User, Check, X, MessageSquare, Pencil, Ban } from "lucide-vue-next";
import StatusBadge from "./StatusBadge.vue";
import type { VacationRequest } from "../services/vacationRequestsApi";
import { RequestStatus } from "../constants";

const props = defineProps<{
  request: VacationRequest;
  showActions?: boolean;
  showEmployee?: boolean;
  showEdit?: boolean;
  showCancel?: boolean;
  actionLoading?: boolean;
}>();

defineEmits<{
  approve: [id: number];
  reject:  [id: number];
  edit:    [id: number];
  cancel:  [id: number];
}>();

const dayCount = computed(() => {
  const start = new Date(props.request.start_date);
  const end   = new Date(props.request.end_date);
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function formatRelative(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days === 0) return "Submitted today";
  if (days === 1) return "Submitted yesterday";
  if (days < 7)  return `Submitted ${days} days ago`;
  return `Submitted ${new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}
</script>
