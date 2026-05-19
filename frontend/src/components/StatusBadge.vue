<template>
  <span :class="['badge', badgeClass]">
    <span>{{ icon }}</span>
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  status: "Pending" | "Approved" | "Rejected";
}>();

const badgeClass = computed(() => {
  const map = {
    Pending: "badge-pending",
    Approved: "badge-approved",
    Rejected: "badge-rejected",
  };
  return map[props.status];
});

const icon = computed(() => {
  const map = { Pending: "⏳", Approved: "✅", Rejected: "❌" };
  return map[props.status];
});
</script>
