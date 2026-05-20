<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal" role="dialog" aria-modal="true">

      <div class="modal-header">
        <h3 class="modal-title">Edit Vacation Request</h3>
        <button class="modal-close" @click="$emit('cancel')" aria-label="Close">
          <X :size="16" stroke-width="2.5" />
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label" for="edit-start">
            Start Date <span class="required-mark">*</span>
          </label>
          <input
            id="edit-start"
            v-model="form.startDate"
            type="date"
            class="form-input"
            :class="{ error: errors.startDate }"
          />
          <span v-if="errors.startDate" class="field-error">{{ errors.startDate }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-end">
            End Date <span class="required-mark">*</span>
          </label>
          <input
            id="edit-end"
            v-model="form.endDate"
            type="date"
            class="form-input"
            :class="{ error: errors.endDate }"
            :min="form.startDate"
          />
          <span v-if="errors.endDate" class="field-error">{{ errors.endDate }}</span>
        </div>

        <div class="form-group" style="margin-bottom:0">
          <label class="form-label" for="edit-reason">Reason (optional)</label>
          <textarea
            id="edit-reason"
            v-model="form.reason"
            class="form-textarea"
            placeholder="e.g. Family trip, personal days..."
            rows="3"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('cancel')" :disabled="loading">
          Cancel
        </button>
        <button class="btn btn-primary" @click="submit" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:13px;height:13px;border-width:2px" />
          {{ loading ? "Saving…" : "Save Changes" }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from "vue";
import { X } from "lucide-vue-next";
import type { VacationRequest } from "../services/vacationRequestsApi";

const props = defineProps<{
  request: VacationRequest;
  loading?: boolean;
}>();

const emit = defineEmits<{
  confirm: [payload: { startDate: string; endDate: string; reason: string }];
  cancel: [];
}>();

const form = reactive({
  startDate: props.request.start_date,
  endDate:   props.request.end_date,
  reason:    props.request.reason ?? "",
});

const errors = reactive({ startDate: "", endDate: "" });

// Keep form in sync if parent swaps the request prop
watch(() => props.request, (r) => {
  form.startDate = r.start_date;
  form.endDate   = r.end_date;
  form.reason    = r.reason ?? "";
});

function validate(): boolean {
  errors.startDate = "";
  errors.endDate   = "";
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.endDate)   errors.endDate   = "End date is required.";
  if (form.startDate && form.endDate && form.endDate < form.startDate)
    errors.endDate = "End date must be on or after the start date.";
  return !errors.startDate && !errors.endDate;
}

function submit() {
  if (!validate()) return;
  emit("confirm", {
    startDate: form.startDate,
    endDate:   form.endDate,
    reason:    form.reason,
  });
}
</script>
