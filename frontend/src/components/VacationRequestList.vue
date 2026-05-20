<template>
  <div>
    <div v-if="loading" class="loading-state">
      <span class="spinner" />
      <span>Loading requests...</span>
    </div>

    <div v-else-if="error" class="alert alert-error">
      <AlertCircle :size="16" stroke-width="2" />
      {{ error }}
    </div>

    <div v-else-if="requests.length === 0" class="empty-state">
      <Inbox :size="40" stroke-width="1.25" class="empty-icon" />
      <div class="empty-title">No requests found</div>
      <div class="empty-desc">{{ emptyMessage }}</div>
    </div>

    <template v-else>
      <div class="section-label">
        {{ requests.length }} request{{ requests.length !== 1 ? "s" : "" }}
      </div>
      <VacationRequestCard
        v-for="request in requests"
        :key="request.id"
        :request="request"
        :show-actions="showActions"
        :show-employee="showEmployee"
        :action-loading="actionLoadingId === request.id"
        @approve="$emit('approve', $event)"
        @reject="$emit('reject', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { Inbox, AlertCircle } from "lucide-vue-next";
import VacationRequestCard from "./VacationRequestCard.vue";
import type { VacationRequest } from "../services/vacationRequestsApi";

defineProps<{
  requests: VacationRequest[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  showActions?: boolean;
  showEmployee?: boolean;
  actionLoadingId?: number | null;
}>();

defineEmits<{
  approve: [id: number];
  reject: [id: number];
}>();
</script>
