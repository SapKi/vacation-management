<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal" role="dialog" aria-modal="true">

      <div class="modal-header">
        <h3 class="modal-title">Cancel Request</h3>
        <button class="modal-close" @click="$emit('cancel')" aria-label="Close">
          <X :size="16" stroke-width="2.5" />
        </button>
      </div>

      <div class="modal-body">
        <div class="cancel-warning">
          <AlertTriangle :size="20" stroke-width="2" class="cancel-warning-icon" />
          <p>Are you sure you want to cancel this vacation request? This action cannot be undone.</p>
        </div>

        <div class="cancel-summary">
          <div class="cancel-summary-row">
            <CalendarRange :size="14" stroke-width="2" />
            <span>{{ formatDate(request.start_date) }} → {{ formatDate(request.end_date) }}
              <span class="cancel-summary-days">({{ dayCount }} day{{ dayCount !== 1 ? 's' : '' }})</span>
            </span>
          </div>
          <div v-if="request.reason" class="cancel-summary-row">
            <MessageSquare :size="14" stroke-width="2" />
            <span class="cancel-summary-reason">{{ request.reason }}</span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('cancel')" :disabled="loading">
          Keep Request
        </button>
        <button class="btn btn-cancel" @click="$emit('confirm')" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:13px;height:13px;border-width:2px" />
          {{ loading ? "Cancelling…" : "Yes, Cancel It" }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { X, AlertTriangle, CalendarRange, MessageSquare } from "lucide-vue-next";
import type { VacationRequest } from "../services/vacationRequestsApi";
import { formatDate, daysBetween } from "../utils/date";

const props = defineProps<{
  request: VacationRequest;
  loading?: boolean;
}>();

defineEmits<{ confirm: []; cancel: [] }>();

const dayCount = computed(() => daysBetween(props.request.start_date, props.request.end_date));
</script>
