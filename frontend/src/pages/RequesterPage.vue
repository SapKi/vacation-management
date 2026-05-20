<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">My Vacation Requests</h1>
      <p class="page-subtitle">Welcome, {{ userName }} — Requester</p>
    </div>

    <div class="two-col">
      <div>
        <VacationRequestForm @submitted="loadRequests" />
      </div>

      <div>
        <div class="card" style="padding-bottom:0.5rem">
          <h2 class="card-title">Request History</h2>
          <VacationRequestList
            :requests="requests"
            :loading="loading"
            :error="error"
            :show-edit="true"
            empty-message="You haven't submitted any vacation requests yet."
            @edit="openEditModal"
          />
        </div>
      </div>
    </div>

    <EditRequestModal
      v-if="editTarget !== null"
      :request="editTarget"
      :loading="editLoading"
      @confirm="handleEdit"
      @cancel="editTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import VacationRequestForm from "../components/VacationRequestForm.vue";
import VacationRequestList from "../components/VacationRequestList.vue";
import EditRequestModal    from "../components/EditRequestModal.vue";
import { vacationRequestsApi } from "../services/vacationRequestsApi";
import type { VacationRequest } from "../services/vacationRequestsApi";
import { useAuth } from "../composables/useAuth";

const { currentUser } = useAuth();
const REQUESTER_USER_ID = computed(() => currentUser.value!.id);
const userName          = computed(() => currentUser.value!.name);

const requests    = ref<VacationRequest[]>([]);
const loading     = ref(false);
const error       = ref("");
const editTarget  = ref<VacationRequest | null>(null);
const editLoading = ref(false);

async function loadRequests() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await vacationRequestsApi.getByUser(REQUESTER_USER_ID.value);
    requests.value = data;
  } catch (err: any) {
    error.value = err?.response?.data?.error || "Failed to load your requests. Is the backend running?";
  } finally {
    loading.value = false;
  }
}

function openEditModal(id: number) {
  editTarget.value = requests.value.find(r => r.id === id) ?? null;
}

async function handleEdit(payload: { startDate: string; endDate: string; reason: string }) {
  if (!editTarget.value) return;
  editLoading.value = true;
  try {
    await vacationRequestsApi.update(editTarget.value.id, payload);
    editTarget.value = null;
    await loadRequests();
  } catch (err: any) {
    // Surface the error inside the modal by rethrowing — modal's parent owns error state
    alert(err?.response?.data?.error || "Failed to update request.");
  } finally {
    editLoading.value = false;
  }
}

onMounted(loadRequests);
</script>
