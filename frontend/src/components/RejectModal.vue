<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h3 class="modal-title">Reject Request</h3>
        <button class="modal-close" @click="$emit('cancel')" aria-label="Close">
          <X :size="16" stroke-width="2.5" />
        </button>
      </div>
      <div class="modal-body">
        <p style="color:#475569; font-size:0.82rem; margin-bottom:1rem; line-height:1.6">
          Please provide a reason for rejecting this request. The requester will see this comment.
        </p>
        <div class="form-group">
          <label class="form-label">
            Comment <span class="required-mark">*</span>
          </label>
          <textarea
            v-model="comment"
            class="form-textarea"
            :class="{ error: showError }"
            placeholder="e.g. Too many employees absent that week"
            rows="3"
            autofocus
          />
          <span v-if="showError" class="field-error">
            A comment is required when rejecting a request.
          </span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" @click="$emit('cancel')" :disabled="loading">Cancel</button>
        <button class="btn btn-danger" @click="submit" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:13px;height:13px;border-width:2px" />
          {{ loading ? "Rejecting…" : "Reject Request" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { X } from "lucide-vue-next";

defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ confirm: [comment: string]; cancel: [] }>();

const comment   = ref("");
const showError = ref(false);

function submit() {
  if (!comment.value.trim()) { showError.value = true; return; }
  showError.value = false;
  emit("confirm", comment.value.trim());
}
</script>
