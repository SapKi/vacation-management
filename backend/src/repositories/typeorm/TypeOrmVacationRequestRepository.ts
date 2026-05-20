import { DataSource } from "typeorm";
import { VacationRequest, RequestStatus } from "../../entities/VacationRequest";
import { IVacationRequestRepository } from "../IVacationRequestRepository";
import { TypeOrmBaseRepository } from "./TypeOrmBaseRepository";

export class TypeOrmVacationRequestRepository
  extends TypeOrmBaseRepository<VacationRequest>
  implements IVacationRequestRepository {

  constructor(dataSource: DataSource) {
    super(dataSource, VacationRequest);
  }

  async findByUserId(userId: number): Promise<VacationRequest[]> {
    return this.repo.find({
      where: { user_id: userId },
      order: { created_at: "DESC" },
    });
  }

  async findAll(status?: RequestStatus): Promise<VacationRequest[]> {
    return this.repo.find({
      where: status ? { status } : {},
      relations: ["user"],
      order: { created_at: "DESC" },
    });
  }
}
