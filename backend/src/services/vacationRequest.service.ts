import { AppDataSource } from "../data-source";
import { VacationRequest, RequestStatus } from "../entities/VacationRequest";
import { User } from "../entities/User";

export interface CreateRequestDto {
  userId: number;
  startDate: string;
  endDate: string;
  reason?: string;
}

export class VacationRequestService {
  private get requestRepo() {
    return AppDataSource.getRepository(VacationRequest);
  }

  private get userRepo() {
    return AppDataSource.getRepository(User);
  }

  async createRequest(dto: CreateRequestDto): Promise<VacationRequest> {
    const { userId, startDate, endDate, reason } = dto;

    if (!userId) throw { status: 400, message: "userId is required" };
    if (!startDate) throw { status: 400, message: "startDate is required" };
    if (!endDate) throw { status: 400, message: "endDate is required" };

    if (new Date(endDate) < new Date(startDate)) {
      throw { status: 400, message: "endDate must be same as or after startDate" };
    }

    const user = await this.userRepo.findOneBy({ id: Number(userId) });
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

  async getRequestsByUser(userId: number): Promise<VacationRequest[]> {
    return this.requestRepo.find({
      where: { user_id: Number(userId) },
      order: { created_at: "DESC" },
    });
  }

  async getAllRequests(status?: string): Promise<VacationRequest[]> {
    const where: Partial<VacationRequest> = {};
    if (status && (Object.values(RequestStatus) as string[]).includes(status)) {
      where.status = status as RequestStatus;
    }

    return this.requestRepo.find({
      where,
      relations: ["user"],
      order: { created_at: "DESC" },
    });
  }

  async updateRequest(
    id: number,
    dto: Partial<Pick<CreateRequestDto, "startDate" | "endDate" | "reason">>
  ): Promise<VacationRequest> {
    const request = await this.requestRepo.findOneBy({ id: Number(id) });
    if (!request) throw { status: 404, message: "Vacation request not found" };
    if (request.status !== RequestStatus.PENDING) {
      throw { status: 400, message: "Only Pending requests can be edited" };
    }

    const newStart = dto.startDate ?? request.start_date;
    const newEnd   = dto.endDate   ?? request.end_date;

    if (!newStart) throw { status: 400, message: "startDate is required" };
    if (!newEnd)   throw { status: 400, message: "endDate is required" };
    if (new Date(newEnd) < new Date(newStart)) {
      throw { status: 400, message: "endDate must be same as or after startDate" };
    }

    request.start_date = newStart;
    request.end_date   = newEnd;
    if (dto.reason !== undefined) request.reason = dto.reason;

    return this.requestRepo.save(request);
  }

  async approveRequest(id: number): Promise<VacationRequest> {
    const request = await this.requestRepo.findOneBy({ id: Number(id) });
    if (!request) throw { status: 404, message: "Vacation request not found" };

    request.status = RequestStatus.APPROVED;
    return this.requestRepo.save(request);
  }

  async deleteRequest(id: number): Promise<void> {
    const request = await this.requestRepo.findOneBy({ id: Number(id) });
    if (!request) throw { status: 404, message: "Vacation request not found" };
    if (request.status !== RequestStatus.PENDING) {
      throw { status: 400, message: "Only Pending requests can be cancelled" };
    }
    await this.requestRepo.remove(request);
  }

  async rejectRequest(id: number, comments: string): Promise<VacationRequest> {
    if (!comments || !comments.trim()) {
      throw { status: 400, message: "comments is required when rejecting a request" };
    }

    const request = await this.requestRepo.findOneBy({ id: Number(id) });
    if (!request) throw { status: 404, message: "Vacation request not found" };

    request.status = RequestStatus.REJECTED;
    request.comments = comments.trim();
    return this.requestRepo.save(request);
  }
}
