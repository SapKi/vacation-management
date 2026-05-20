import { DataSource } from "typeorm";
import { TypeOrmUserRepository } from "./repositories/typeorm/TypeOrmUserRepository";
import { TypeOrmVacationRequestRepository } from "./repositories/typeorm/TypeOrmVacationRequestRepository";
import { AuthService } from "./services/auth.service";
import { VacationRequestService } from "./services/vacationRequest.service";

export function createContainer(dataSource: DataSource) {
  const userRepo        = new TypeOrmUserRepository(dataSource);
  const vacationRepo    = new TypeOrmVacationRequestRepository(dataSource);
  const authService     = new AuthService(userRepo);
  const vacationService = new VacationRequestService(vacationRepo, userRepo);
  return { authService, vacationService, userRepo };
}
