import "reflect-metadata";
import { VacationRequestService } from "../services/vacationRequest.service";
import { IUserRepository } from "../repositories/IUserRepository";
import { IVacationRequestRepository } from "../repositories/IVacationRequestRepository";
import { RequestStatus } from "../entities/VacationRequest";

const mockRequestRepo: jest.Mocked<IVacationRequestRepository> = {
  create:      jest.fn(),
  save:        jest.fn(),
  findById:    jest.fn(),
  findByUserId:jest.fn(),
  findAll:     jest.fn(),
  remove:      jest.fn(),
};

const mockUserRepo: jest.Mocked<Pick<IUserRepository, "findById">> = {
  findById: jest.fn(),
};

let service: VacationRequestService;

beforeEach(() => {
  jest.clearAllMocks();
  service = new VacationRequestService(mockRequestRepo, mockUserRepo as unknown as IUserRepository);
});

const pending = {
  id: 10, user_id: 1,
  start_date: "2026-09-01", end_date: "2026-09-05",
  reason: "Holiday", status: RequestStatus.PENDING, comments: "",
} as any;

// ── createRequest ────────────────────────────────────────────────
describe("VacationRequestService.createRequest", () => {
  it("creates a Pending request when input is valid", async () => {
    mockUserRepo.findById.mockResolvedValue({ id: 1 } as any);
    mockRequestRepo.create.mockReturnValue(pending);
    mockRequestRepo.save.mockResolvedValue(pending);
    const result = await service.createRequest({ userId: 1, startDate: "2026-09-01", endDate: "2026-09-05" });
    expect(result.status).toBe(RequestStatus.PENDING);
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
    mockUserRepo.findById.mockResolvedValue(null);
    await expect(service.createRequest({ userId: 99, startDate: "2026-09-01", endDate: "2026-09-05" }))
      .rejects.toMatchObject({ status: 404 });
  });
});

// ── getRequestsByUser ────────────────────────────────────────────
describe("VacationRequestService.getRequestsByUser", () => {
  it("delegates to repo and returns results", async () => {
    mockRequestRepo.findByUserId.mockResolvedValue([pending]);
    const result = await service.getRequestsByUser(1);
    expect(result).toHaveLength(1);
  });
});

// ── getAllRequests ────────────────────────────────────────────────
describe("VacationRequestService.getAllRequests", () => {
  it("returns all when no status given", async () => {
    mockRequestRepo.findAll.mockResolvedValue([pending]);
    await service.getAllRequests();
    expect(mockRequestRepo.findAll).toHaveBeenCalledWith(undefined);
  });

  it("passes valid status to repo", async () => {
    mockRequestRepo.findAll.mockResolvedValue([]);
    await service.getAllRequests("Pending");
    expect(mockRequestRepo.findAll).toHaveBeenCalledWith(RequestStatus.PENDING);
  });

  it("ignores invalid status", async () => {
    mockRequestRepo.findAll.mockResolvedValue([]);
    await service.getAllRequests("InvalidStatus");
    expect(mockRequestRepo.findAll).toHaveBeenCalledWith(undefined);
  });
});

// ── updateRequest ────────────────────────────────────────────────
describe("VacationRequestService.updateRequest", () => {
  it("updates dates on Pending request", async () => {
    const req = { ...pending };
    mockRequestRepo.findById.mockResolvedValue(req);
    mockRequestRepo.save.mockResolvedValue({ ...req, start_date: "2026-10-01", end_date: "2026-10-05" });
    const result = await service.updateRequest(10, { startDate: "2026-10-01", endDate: "2026-10-05" });
    expect(result.start_date).toBe("2026-10-01");
  });

  it("throws 404 when not found", async () => {
    mockRequestRepo.findById.mockResolvedValue(null);
    await expect(service.updateRequest(99, { startDate: "2026-10-01", endDate: "2026-10-05" }))
      .rejects.toMatchObject({ status: 404 });
  });

  it("throws 400 when request is not Pending", async () => {
    mockRequestRepo.findById.mockResolvedValue({ ...pending, status: RequestStatus.APPROVED });
    await expect(service.updateRequest(10, { startDate: "2026-10-01", endDate: "2026-10-05" }))
      .rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when new endDate is before startDate", async () => {
    mockRequestRepo.findById.mockResolvedValue({ ...pending });
    await expect(service.updateRequest(10, { startDate: "2026-10-10", endDate: "2026-10-01" }))
      .rejects.toMatchObject({ status: 400 });
  });
});

// ── approveRequest ───────────────────────────────────────────────
describe("VacationRequestService.approveRequest", () => {
  it("sets status to Approved", async () => {
    mockRequestRepo.findById.mockResolvedValue({ ...pending });
    mockRequestRepo.save.mockResolvedValue({ ...pending, status: RequestStatus.APPROVED });
    const result = await service.approveRequest(10);
    expect(result.status).toBe(RequestStatus.APPROVED);
  });

  it("throws 404 when not found", async () => {
    mockRequestRepo.findById.mockResolvedValue(null);
    await expect(service.approveRequest(99)).rejects.toMatchObject({ status: 404 });
  });
});

// ── rejectRequest ────────────────────────────────────────────────
describe("VacationRequestService.rejectRequest", () => {
  it("sets status to Rejected with comments", async () => {
    mockRequestRepo.findById.mockResolvedValue({ ...pending });
    mockRequestRepo.save.mockResolvedValue({ ...pending, status: RequestStatus.REJECTED, comments: "Overlap" });
    const result = await service.rejectRequest(10, "Overlap");
    expect(result.status).toBe(RequestStatus.REJECTED);
  });

  it("throws 400 when comments is empty", async () => {
    await expect(service.rejectRequest(10, "")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when comments is whitespace", async () => {
    await expect(service.rejectRequest(10, "   ")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 404 when not found", async () => {
    mockRequestRepo.findById.mockResolvedValue(null);
    await expect(service.rejectRequest(99, "Reason")).rejects.toMatchObject({ status: 404 });
  });
});

// ── deleteRequest ────────────────────────────────────────────────
describe("VacationRequestService.deleteRequest", () => {
  it("removes a Pending request", async () => {
    mockRequestRepo.findById.mockResolvedValue({ ...pending });
    mockRequestRepo.remove.mockResolvedValue(undefined);
    await expect(service.deleteRequest(10)).resolves.toBeUndefined();
    expect(mockRequestRepo.remove).toHaveBeenCalled();
  });

  it("throws 404 when not found", async () => {
    mockRequestRepo.findById.mockResolvedValue(null);
    await expect(service.deleteRequest(99)).rejects.toMatchObject({ status: 404 });
  });

  it("throws 400 when request is not Pending", async () => {
    mockRequestRepo.findById.mockResolvedValue({ ...pending, status: RequestStatus.APPROVED });
    await expect(service.deleteRequest(10)).rejects.toMatchObject({ status: 400 });
  });
});
