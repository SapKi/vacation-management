import "reflect-metadata";

jest.mock("../data-source", () => ({
  AppDataSource: { getRepository: jest.fn() },
}));

import { VacationRequestService } from "../services/vacationRequest.service";
import { AppDataSource } from "../data-source";
import { RequestStatus } from "../entities/VacationRequest";
import { User } from "../entities/User";
import { VacationRequest } from "../entities/VacationRequest";

const mockRequestRepo = {
  create:    jest.fn(),
  save:      jest.fn(),
  findOneBy: jest.fn(),
  find:      jest.fn(),
  remove:    jest.fn(),
};

const mockUserRepo = {
  findOneBy: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: unknown) => {
    if (entity === User)            return mockUserRepo;
    if (entity === VacationRequest) return mockRequestRepo;
    return mockRequestRepo;
  });
});

const service = new VacationRequestService();

const pendingRequest = {
  id: 10, user_id: 1,
  start_date: "2026-09-01", end_date: "2026-09-05",
  reason: "Holiday", status: RequestStatus.PENDING, comments: "",
};

// ── createRequest ────────────────────────────────────────────────
describe("VacationRequestService.createRequest", () => {
  it("creates a Pending request when input is valid", async () => {
    mockUserRepo.findOneBy.mockResolvedValue({ id: 1, name: "Alice" });
    const saved = { ...pendingRequest };
    mockRequestRepo.create.mockReturnValue(saved);
    mockRequestRepo.save.mockResolvedValue(saved);

    const result = await service.createRequest({
      userId: 1, startDate: "2026-09-01", endDate: "2026-09-05", reason: "Holiday",
    });
    expect(result.status).toBe(RequestStatus.PENDING);
    expect(result.user_id).toBe(1);
  });

  it("throws 400 when userId is missing", async () => {
    await expect(service.createRequest({ userId: 0, startDate: "2026-09-01", endDate: "2026-09-05" }))
      .rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when startDate is missing", async () => {
    await expect(service.createRequest({ userId: 1, startDate: "", endDate: "2026-09-05" }))
      .rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when endDate is missing", async () => {
    await expect(service.createRequest({ userId: 1, startDate: "2026-09-01", endDate: "" }))
      .rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when endDate is before startDate", async () => {
    await expect(service.createRequest({ userId: 1, startDate: "2026-09-10", endDate: "2026-09-01" }))
      .rejects.toMatchObject({ status: 400 });
  });

  it("throws 404 when user does not exist", async () => {
    mockUserRepo.findOneBy.mockResolvedValue(null);
    await expect(service.createRequest({ userId: 99, startDate: "2026-09-01", endDate: "2026-09-05" }))
      .rejects.toMatchObject({ status: 404 });
  });
});

// ── getRequestsByUser ────────────────────────────────────────────
describe("VacationRequestService.getRequestsByUser", () => {
  it("returns requests filtered by user", async () => {
    mockRequestRepo.find.mockResolvedValue([pendingRequest]);
    const result = await service.getRequestsByUser(1);
    expect(result).toHaveLength(1);
    expect(result[0].user_id).toBe(1);
  });
});

// ── getAllRequests ────────────────────────────────────────────────
describe("VacationRequestService.getAllRequests", () => {
  it("returns all requests when no status filter provided", async () => {
    mockRequestRepo.find.mockResolvedValue([pendingRequest]);
    const result = await service.getAllRequests();
    expect(result).toHaveLength(1);
  });

  it("passes valid status filter to repository", async () => {
    mockRequestRepo.find.mockResolvedValue([]);
    await service.getAllRequests("Pending");
    expect(mockRequestRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "Pending" } })
    );
  });

  it("ignores invalid status filter", async () => {
    mockRequestRepo.find.mockResolvedValue([]);
    await service.getAllRequests("InvalidStatus");
    expect(mockRequestRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });
});

// ── updateRequest ────────────────────────────────────────────────
describe("VacationRequestService.updateRequest", () => {
  it("updates start/end dates on a Pending request", async () => {
    const req = { ...pendingRequest };
    mockRequestRepo.findOneBy.mockResolvedValue(req);
    mockRequestRepo.save.mockResolvedValue({ ...req, start_date: "2026-10-01", end_date: "2026-10-05" });

    const result = await service.updateRequest(10, { startDate: "2026-10-01", endDate: "2026-10-05" });
    expect(result.start_date).toBe("2026-10-01");
  });

  it("throws 404 when request not found", async () => {
    mockRequestRepo.findOneBy.mockResolvedValue(null);
    await expect(service.updateRequest(99, { startDate: "2026-10-01", endDate: "2026-10-05" }))
      .rejects.toMatchObject({ status: 404 });
  });

  it("throws 400 when request is not Pending", async () => {
    mockRequestRepo.findOneBy.mockResolvedValue({ ...pendingRequest, status: RequestStatus.APPROVED });
    await expect(service.updateRequest(10, { startDate: "2026-10-01", endDate: "2026-10-05" }))
      .rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when new endDate is before startDate", async () => {
    mockRequestRepo.findOneBy.mockResolvedValue({ ...pendingRequest });
    await expect(service.updateRequest(10, { startDate: "2026-10-10", endDate: "2026-10-01" }))
      .rejects.toMatchObject({ status: 400 });
  });
});

// ── approveRequest ───────────────────────────────────────────────
describe("VacationRequestService.approveRequest", () => {
  it("sets status to Approved", async () => {
    const req = { ...pendingRequest };
    mockRequestRepo.findOneBy.mockResolvedValue(req);
    mockRequestRepo.save.mockResolvedValue({ ...req, status: RequestStatus.APPROVED });

    const result = await service.approveRequest(10);
    expect(result.status).toBe(RequestStatus.APPROVED);
  });

  it("throws 404 when request not found", async () => {
    mockRequestRepo.findOneBy.mockResolvedValue(null);
    await expect(service.approveRequest(99)).rejects.toMatchObject({ status: 404 });
  });
});

// ── rejectRequest ────────────────────────────────────────────────
describe("VacationRequestService.rejectRequest", () => {
  it("sets status to Rejected with comments", async () => {
    const req = { ...pendingRequest };
    mockRequestRepo.findOneBy.mockResolvedValue(req);
    mockRequestRepo.save.mockResolvedValue({ ...req, status: RequestStatus.REJECTED, comments: "Overlap" });

    const result = await service.rejectRequest(10, "Overlap");
    expect(result.status).toBe(RequestStatus.REJECTED);
    expect(result.comments).toBe("Overlap");
  });

  it("throws 400 when comments is empty", async () => {
    await expect(service.rejectRequest(10, "")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when comments is whitespace", async () => {
    await expect(service.rejectRequest(10, "   ")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 404 when request not found", async () => {
    mockRequestRepo.findOneBy.mockResolvedValue(null);
    await expect(service.rejectRequest(99, "Reason")).rejects.toMatchObject({ status: 404 });
  });
});

// ── deleteRequest ────────────────────────────────────────────────
describe("VacationRequestService.deleteRequest", () => {
  it("removes a Pending request", async () => {
    mockRequestRepo.findOneBy.mockResolvedValue({ ...pendingRequest });
    mockRequestRepo.remove.mockResolvedValue(undefined);
    await expect(service.deleteRequest(10)).resolves.toBeUndefined();
    expect(mockRequestRepo.remove).toHaveBeenCalled();
  });

  it("throws 404 when request not found", async () => {
    mockRequestRepo.findOneBy.mockResolvedValue(null);
    await expect(service.deleteRequest(99)).rejects.toMatchObject({ status: 404 });
  });

  it("throws 400 when request is not Pending", async () => {
    mockRequestRepo.findOneBy.mockResolvedValue({ ...pendingRequest, status: RequestStatus.APPROVED });
    await expect(service.deleteRequest(10)).rejects.toMatchObject({ status: 400 });
  });
});
