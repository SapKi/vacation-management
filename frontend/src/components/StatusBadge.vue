<template>
  <span :class="['badge', badgeClass]">
    <component :is="icon" :size="12" stroke-width="2.5" />
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Clock, CheckCircle, XCircle } from "lucide-vue-next";

const props = defineProps<{
  status: "Pending" | "Approved" | "Rejected";
}>();

const badgeClass = computed(() => ({
  Pending:  "badge-pending",
  Approved: "badge-approved",
  Rejected: "badge-rejected",
}[props.status]));

const icon = computed(() => ({
  Pending:  Clock,
  Approved: CheckCircle,
  Rejected: XCircle,
}[props.status]));
</script>
