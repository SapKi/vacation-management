import { RequestStatus } from "../entities/VacationRequest";
import { IUserRepository } from "../repositories/IUserRepository";
import { IVacationRequestRepository } from "../repositories/IVacationRequestRepository";
import {
  validateCreateRequest,
  validateUpdateRequest,
  validateReject,
  validateDeleteRequest,
} from "../validators/vacationRequest.validator";

export interface CreateRequestDto {
  userId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}

export class VacationRequestService {
  constructor(
    private readonly requestRepo: IVacationRequestRepository,
    private readonly userRepo: IUserRepository,
  ) {}

  async createRequest(dto: CreateRequestDto) {
    const { userId, startDate, endDate, reason } = dto;
    validateCreateRequest(userId, startDate, endDate);

    const user = await this.userRepo.findById(Number(userId));
    if (!user) throw { status: 404, message: "User not found" };

    const request = this.requestRepo.create({
      user_id: Number(userId),
      start_date: startDate,
      end_date: endDate,
      reason: reason || "",
      status: RequestStatus.PENDING,
    });

    return this.requestRepo.save(request);
  }

  async getRequestsByUser(userId: number) {
    return this.requestRepo.findByUserId(Number(userId));
  }

  async getAllRequests(status?: string) {
    const validStatus = (Object.values(RequestStatus) as string[]).includes(status ?? "")
      ? (status as RequestStatus)
      : undefined;
    return this.requestRepo.findAll(validStatus);
  }

  async updateRequest(id: number, dto: Partial<Pick<CreateRequestDto, "startDate" | "endDate" | "reason">>) {
    const request = await this.requestRepo.findById(Number(id));
    if (!request) throw { status: 404, message: "Vacation request not found" };

    const newStart = dto.startDate ?? request.start_date;
    const newEnd   = dto.endDate   ?? request.end_date;
    validateUpdateRequest(request.status, newStart, newEnd);

    request.start_date = newStart;
    request.end_date   = newEnd;
    if (dto.reason !== undefined) request.reason = dto.reason;

    return this.requestRepo.save(request);
  }

  async approveRequest(id: number) {
    const request = await this.requestRepo.findById(Number(id));
    if (!request) throw { status: 404, message: "Vacation request not found" };

    request.status = RequestStatus.APPROVED;
    return this.requestRepo.save(request);
  }

  async rejectRequest(id: number, comments: string) {
    validateReject(comments);

    const request = await this.requestRepo.findById(Number(id));
    if (!request) throw { status: 404, message: "Vacation request not found" };

    request.status   = RequestStatus.REJECTED;
    request.comments = comments.trim();
    return this.requestRepo.save(request);
  }

  async deleteRequest(id: number) {
    const request = await this.requestRepo.findById(Number(id));
    if (!request) throw { status: 404, message: "Vacation request not found" };

    validateDeleteRequest(request.status);
    await this.requestRepo.remove(request);
  }
}
