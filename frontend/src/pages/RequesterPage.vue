<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">My Vacation Requests</h1>
      <p class="page-subtitle">Welcome, Alice Johnson — Requester</p>
    </div>

    <div class="two-col">
      <!-- Left: Submit form -->
      <div>
        <VacationRequestForm @submitted="loadRequests" />
      </div>

      <!-- Right: Request history -->
      <div>
        <div class="card" style="padding-bottom:0.5rem">
          <h2 class="card-title">Request History</h2>
          <VacationRequestList
            :requests="requests"
            :loading="loading"
            :error="error"
            empty-message="You haven't submitted any vacation requests yet."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import VacationRequestForm from "../components/VacationRequestForm.vue";
import VacationRequestList from "../components/VacationRequestList.vue";
import { vacationRequestsApi } from "../services/vacationRequestsApi";
import type { VacationRequest } from "../services/vacationRequestsApi";

// Hardcoded to seeded requester (id=1)
const REQUESTER_USER_ID = 1;

const requests = ref<VacationRequest[]>([]);
const loading = ref(false);
const error = ref("");

async function loadRequests() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await vacationRequestsApi.getByUser(REQUESTER_USER_ID);
    requests.value = data;
  } catch (err: any) {
    error.value =
      err?.response?.data?.error || "Failed to load your requests. Is the backend running?";
  } finally {
    loading.value = false;
  }
}

onMounted(loadRequests);
</script>
