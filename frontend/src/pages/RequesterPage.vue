<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">My Vacation Requests</h1>
      <p class="page-subtitle">Welcome, {{ currentUser!.name }} — {{ currentUser!.role }}</p>
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
            :show-cancel="true"
            empty-message="You haven't submitted any vacation requests yet."
            @edit="openEditModal"
            @cancel="openCancelModal"
          />
        </div>
      </div>
    </div>

    <EditRequestModal
      v-if="editTarget !== null"
      :request="editTarget"
      :loading="editLoading"
      :error="editError"
      @confirm="handleEdit"
      @cancel="closeEdit"
    />

    <CancelModal
      v-if="cancelTarget !== null"
      :request="cancelTarget"
      :loading="cancelLoading"
      @confirm="handleCancel"
      @cancel="cancelTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import VacationRequestForm from "../components/VacationRequestForm.vue";
import VacationRequestList from "../components/VacationRequestList.vue";
import EditRequestModal    from "../components/EditRequestModal.vue";
import CancelModal         from "../components/CancelModal.vue";
import { vacationRequestsApi } from "../services/vacationRequestsApi";
import type { VacationRequest } from "../services/vacationRequestsApi";
import { useAuth } from "../composables/useAuth";
import { getApiError } from "../utils/error";

const { currentUser } = useAuth();
const userId = computed(() => currentUser.value!.id);

const requests      = ref<VacationRequest[]>([]);
const loading       = ref(false);
const error         = ref("");
const editTarget    = ref<VacationRequest | null>(null);
const editLoading   = ref(false);
const editError     = ref("");
const cancelTarget  = ref<VacationRequest | null>(null);
const cancelLoading = ref(false);

async function loadRequests() {
  loading.value = true;
  error.value   = "";
  try {
    const { data } = await vacationRequestsApi.getByUser(userId.value);
    requests.value = data;
  } catch (err: unknown) {
    error.value = getApiError(err, "Failed to load your requests. Is the backend running?");
  } finally {
    loading.value = false;
  }
}

function openEditModal(id: number) {
  editError.value  = "";
  editTarget.value = requests.value.find(r => r.id === id) ?? null;
}

function closeEdit() {
  editTarget.value = null;
  editError.value  = "";
}

function openCancelModal(id: number) {
  cancelTarget.value = requests.value.find(r => r.id === id) ?? null;
}

async function handleEdit(payload: { startDate: string; endDate: string; reason: string }) {
  if (!editTarget.value) return;
  editLoading.value = true;
  editError.value   = "";
  try {
    await vacationRequestsApi.update(editTarget.value.id, payload);
    closeEdit();
    await loadRequests();
  } catch (err: unknown) {
    editError.value = getApiError(err, "Failed to update request.");
  } finally {
    editLoading.value = false;
  }
}

async function handleCancel() {
  if (!cancelTarget.value) return;
  cancelLoading.value = true;
  try {
    await vacationRequestsApi.cancel(cancelTarget.value.id);
    cancelTarget.value = null;
    await loadRequests();
  } catch (err: unknown) {
    error.value = getApiError(err, "Failed to cancel request.");
    cancelTarget.value = null;
  } finally {
    cancelLoading.value = false;
  }
}

onMounted(loadRequests);
</script>
