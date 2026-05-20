import { describe, it, expect, vi, beforeEach } from "vitest";
import { RequestStatus, UserRole } from "../constants";

vi.mock("./api", () => ({
  default: {
    post:   vi.fn(),
    get:    vi.fn(),
    patch:  vi.fn(),
    delete: vi.fn(),
  },
}));

import api from "./api";
import { vacationRequestsApi } from "./vacationRequestsApi";

const mockRequest = {
  id: 1, user_id: 1,
  start_date: "2026-09-01", end_date: "2026-09-05",
  reason: "Holiday", status: RequestStatus.PENDING,
  comments: "", created_at: "2026-05-01T00:00:00Z",
};

beforeEach(() => vi.clearAllMocks());

describe("vacationRequestsApi.create", () => {
  it("posts to /vacation-requests with payload", async () => {
    (api.post as any).mockResolvedValue({ data: mockRequest });
    const payload = { userId: 1, startDate: "2026-09-01", endDate: "2026-09-05" };
    await vacationRequestsApi.create(payload);
    expect(api.post).toHaveBeenCalledWith("/vacation-requests", payload);
  });
});

describe("vacationRequestsApi.getByUser", () => {
  it("gets /vacation-requests/user/:userId", async () => {
    (api.get as any).mockResolvedValue({ data: [mockRequest] });
    await vacationRequestsApi.getByUser(1);
    expect(api.get).toHaveBeenCalledWith("/vacation-requests/user/1");
  });
});

describe("vacationRequestsApi.getAll", () => {
  it("gets /vacation-requests without params when no status given", async () => {
    (api.get as any).mockResolvedValue({ data: [] });
    await vacationRequestsApi.getAll();
    expect(api.get).toHaveBeenCalledWith("/vacation-requests", { params: {} });
  });

  it("passes status param when provided", async () => {
    (api.get as any).mockResolvedValue({ data: [] });
    await vacationRequestsApi.getAll("Pending");
    expect(api.get).toHaveBeenCalledWith("/vacation-requests", { params: { status: "Pending" } });
  });
});

describe("vacationRequestsApi.update", () => {
  it("patches /vacation-requests/:id with payload", async () => {
    (api.patch as any).mockResolvedValue({ data: mockRequest });
    const payload = { startDate: "2026-10-01", endDate: "2026-10-05" };
    await vacationRequestsApi.update(1, payload);
    expect(api.patch).toHaveBeenCalledWith("/vacation-requests/1", payload);
  });
});

describe("vacationRequestsApi.cancel", () => {
  it("deletes /vacation-requests/:id", async () => {
    (api.delete as any).mockResolvedValue({});
    await vacationRequestsApi.cancel(1);
    expect(api.delete).toHaveBeenCalledWith("/vacation-requests/1");
  });
});

describe("vacationRequestsApi.approve", () => {
  it("patches /vacation-requests/:id/approve", async () => {
    (api.patch as any).mockResolvedValue({ data: { ...mockRequest, status: RequestStatus.APPROVED } });
    await vacationRequestsApi.approve(1);
    expect(api.patch).toHaveBeenCalledWith("/vacation-requests/1/approve");
  });
});

describe("vacationRequestsApi.reject", () => {
  it("patches /vacation-requests/:id/reject with comments", async () => {
    (api.patch as any).mockResolvedValue({ data: { ...mockRequest, status: RequestStatus.REJECTED } });
    await vacationRequestsApi.reject(1, "Overlap");
    expect(api.patch).toHaveBeenCalledWith("/vacation-requests/1/reject", { comments: "Overlap" });
  });
});
