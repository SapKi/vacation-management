<template>
  <span :class="['badge', badgeClass]">
    <component :is="icon" :size="12" stroke-width="2.5" />
    {{ status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Clock, CheckCircle, XCircle, Ban } from "lucide-vue-next";
import { RequestStatus } from "../constants";

const props = defineProps<{ status: RequestStatus }>();

const badgeClass = computed(() => ({
  [RequestStatus.PENDING]:   "badge-pending",
  [RequestStatus.APPROVED]:  "badge-approved",
  [RequestStatus.REJECTED]:  "badge-rejected",
  [RequestStatus.CANCELLED]: "badge-cancelled",
}[props.status]));

const icon = computed(() => ({
  [RequestStatus.PENDING]:   Clock,
  [RequestStatus.APPROVED]:  CheckCircle,
  [RequestStatus.REJECTED]:  XCircle,
  [RequestStatus.CANCELLED]: Ban,
}[props.status]));
</script>
