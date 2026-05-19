<template>
  <div class="card">
    <h2 class="card-title">Submit a Vacation Request</h2>

    <div v-if="success" class="alert alert-success">
      ✅ Your request has been submitted successfully!
    </div>

    <form @submit.prevent="handleSubmit" novalidate>
      <div class="form-group">
        <label class="form-label" for="startDate">
          Start Date <span class="required-mark">*</span>
        </label>
        <input
          id="startDate"
          v-model="form.startDate"
          type="date"
          class="form-input"
          :class="{ error: errors.startDate }"
          :min="today"
        />
        <span v-if="errors.startDate" class="field-error">{{ errors.startDate }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="endDate">
          End Date <span class="required-mark">*</span>
        </label>
        <input
          id="endDate"
          v-model="form.endDate"
          type="date"
          class="form-input"
          :class="{ error: errors.endDate }"
          :min="form.startDate || today"
        />
        <span v-if="errors.endDate" class="field-error">{{ errors.endDate }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="reason">Reason (optional)</label>
        <textarea
          id="reason"
          v-model="form.reason"
          class="form-textarea"
          placeholder="e.g. Family trip, personal days..."
          rows="3"
        />
      </div>

      <div v-if="submitError" class="alert alert-error">
        ⚠️ {{ submitError }}
      </div>

      <button type="submit" class="btn btn-primary" :disabled="loading" style="width:100%">
        <span v-if="loading" class="spinner" style="width:14px;height:14px;border-width:2px" />
        {{ loading ? "Submitting..." : "Submit Request" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { vacationRequestsApi } from "../services/vacationRequestsApi";

// Requester is always user id=1 (seeded)
const REQUESTER_USER_ID = 1;

const emit = defineEmits<{
  submitted: [];
}>();

const today = new Date().toISOString().split("T")[0];

const form = reactive({
  startDate: "",
  endDate: "",
  reason: "",
});

const errors = reactive({
  startDate: "",
  endDate: "",
});

const loading = ref(false);
const success = ref(false);
const submitError = ref("");

function validate(): boolean {
  errors.startDate = "";
  errors.endDate = "";

  if (!form.startDate) {
    errors.startDate = "Start date is required.";
  }
  if (!form.endDate) {
    errors.endDate = "End date is required.";
  }
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = "End date must be on or after the start date.";
  }

  return !errors.startDate && !errors.endDate;
}

async function handleSubmit() {
  success.value = false;
  submitError.value = "";

  if (!validate()) return;

  loading.value = true;
  try {
    await vacationRequestsApi.create({
      userId: REQUESTER_USER_ID,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason || undefined,
    });

    // Reset form
    form.startDate = "";
    form.endDate = "";
    form.reason = "";
    success.value = true;
    emit("submitted");

    setTimeout(() => {
      success.value = false;
    }, 4000);
  } catch (err: any) {
    submitError.value =
      err?.response?.data?.error || "Failed to submit request. Please try again.";
  } finally {
    loading.value = false;
  }
}
</script>
