<template>
  <div class="filter-bar">
    <button
      v-for="option in STATUS_FILTER_OPTIONS"
      :key="option"
      :class="['filter-btn', { active: modelValue === option }]"
      @click="$emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { STATUS_FILTER_OPTIONS, type StatusFilterOption } from "../constants";

defineProps<{ modelValue: StatusFilterOption | string }>();
defineEmits<{ "update:modelValue": [value: string] }>();
</script>
