<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Vacation Request Management</h1>
      <p class="page-subtitle">Welcome, {{ currentUser!.name }} — {{ currentUser!.role }}</p>
    </div>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <h2 class="card-title" style="border:none; margin:0; padding:0;">All Requests</h2>
        <button class="btn btn-ghost btn-sm" @click="loadRequests" :disabled="loading">
          <RefreshCw :size="14" stroke-width="2" /> Refresh
        </button>
      </div>

      <StatusFilter v-model="activeFilter" @update:modelValue="loadRequests" />

      <div v-if="actionError" class="alert alert-error" style="margin-bottom:1rem">
        <AlertCircle :size="16" stroke-width="2" /> {{ actionError }}
      </div>
      <div v-if="actionSuccess" class="alert alert-success" style="margin-bottom:1rem">
        <CheckCircle :size="16" stroke-width="2" /> {{ actionSuccess }}
      </div>

      <VacationRequestList
        :requests="requests"
        :loading="loading"
        :error="error"
        :show-actions="true"
        :show-employee="true"
        :action-loading-id="actionLoadingId"
        empty-message="No requests match the current filter."
        @approve="handleApprove"
        @reject="openRejectModal"
        @view="openViewModal"
      />
    </div>

    <RejectModal
      v-if="rejectTargetId !== null"
      :loading="actionLoadingId === rejectTargetId"
      @confirm="handleReject"
      @cancel="rejectTargetId = null"
    />

    <ViewDetailsModal
      v-if="viewTarget !== null"
      :request="viewTarget"
      @close="viewTarget = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-vue-next";
import VacationRequestList from "../components/VacationRequestList.vue";
import StatusFilter        from "../components/StatusFilter.vue";
import RejectModal         from "../components/RejectModal.vue";
import ViewDetailsModal    from "../components/ViewDetailsModal.vue";
import { vacationRequestsApi } from "../services/vacationRequestsApi";
import type { VacationRequest } from "../services/vacationRequestsApi";
import { useAuth }      from "../composables/useAuth";
import { getApiError }  from "../utils/error";
import { STATUS_FILTER_OPTIONS, NOTIFICATION_DISMISS_MS } from "../constants";

const { currentUser } = useAuth();

const FILTER_ALL = STATUS_FILTER_OPTIONS[0]; // "All"

const requests        = ref<VacationRequest[]>([]);
const loading         = ref(false);
const error           = ref("");
const activeFilter    = ref<string>(FILTER_ALL);
const actionLoadingId = ref<number | null>(null);
const actionError     = ref("");
const actionSuccess   = ref("");
const rejectTargetId  = ref<number | null>(null);
const viewTarget      = ref<VacationRequest | null>(null);

function openViewModal(id: number) {
  viewTarget.value = requests.value.find(r => r.id === id) ?? null;
}

async function loadRequests() {
  loading.value = true;
  error.value   = "";
  try {
    const { data } = await vacationRequestsApi.getAll(
      activeFilter.value !== FILTER_ALL ? activeFilter.value : undefined
    );
    requests.value = data;
  } catch (err: unknown) {
    error.value = getApiError(err, "Failed to load requests. Is the backend running?");
  } finally {
    loading.value = false;
  }
}

async function handleApprove(id: number) {
  actionError.value = actionSuccess.value = "";
  actionLoadingId.value = id;
  try {
    await vacationRequestsApi.approve(id);
    actionSuccess.value = "Request approved successfully.";
    await loadRequests();
    setTimeout(() => { actionSuccess.value = ""; }, NOTIFICATION_DISMISS_MS);
  } catch (err: unknown) {
    actionError.value = getApiError(err, "Failed to approve request.");
  } finally {
    actionLoadingId.value = null;
  }
}

function openRejectModal(id: number) {
  actionError.value = actionSuccess.value = "";
  rejectTargetId.value = id;
}

async function handleReject(comment: string) {
  if (rejectTargetId.value === null) return;
  const id = rejectTargetId.value;
  actionLoadingId.value = id;
  try {
    await vacationRequestsApi.reject(id, comment);
    rejectTargetId.value  = null;
    actionSuccess.value   = "Request rejected.";
    await loadRequests();
    setTimeout(() => { actionSuccess.value = ""; }, NOTIFICATION_DISMISS_MS);
  } catch (err: unknown) {
    actionError.value    = getApiError(err, "Failed to reject request.");
    rejectTargetId.value = null;
  } finally {
    actionLoadingId.value = null;
  }
}

onMounted(loadRequests);
</script>
