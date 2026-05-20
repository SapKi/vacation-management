import { VacationRequest, RequestStatus } from "../entities/VacationRequest";
import { IRepository } from "./IRepository";

export interface IVacationRequestRepository extends IRepository<VacationRequest> {
  findByUserId(userId: number): Promise<VacationRequest[]>;
  findAll(status?: RequestStatus): Promise<VacationRequest[]>;
}
