import api from "./api";

export interface VacationRequest {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  comments?: string;
  created_at: string;
  user?: { id: number; name: string; role: string };
}

export interface CreateRequestPayload {
  userId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}

export const vacationRequestsApi = {
  create(payload: CreateRequestPayload) {
    return api.post<VacationRequest>("/vacation-requests", payload);
  },

  getByUser(userId: number) {
    return api.get<VacationRequest[]>(`/vacation-requests/user/${userId}`);
  },

  getAll(status?: string) {
    return api.get<VacationRequest[]>("/vacation-requests", {
      params: status && status !== "All" ? { status } : {},
    });
  },

  approve(id: number) {
    return api.patch<VacationRequest>(`/vacation-requests/${id}/approve`);
  },

  reject(id: number, comments: string) {
    return api.patch<VacationRequest>(`/vacation-requests/${id}/reject`, {
      comments,
    });
  },
};
