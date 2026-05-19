<template>
  <div class="filter-bar">
    <button
      v-for="option in options"
      :key="option"
      :class="['filter-btn', { active: modelValue === option }]"
      @click="$emit('update:modelValue', option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();

const options = ["All", "Pending", "Approved", "Rejected"];
</script>
