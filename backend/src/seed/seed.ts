import "reflect-metadata";
import * as dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "../data-source";
import { User, UserRole } from "../entities/User";
import { VacationRequest, RequestStatus } from "../entities/VacationRequest";

async function seed() {
  await AppDataSource.initialize();
  console.log("Connected to database. Seeding...");

  const userRepo = AppDataSource.getRepository(User);
  const requestRepo = AppDataSource.getRepository(VacationRequest);

  // Clear in correct order (child first)
  await requestRepo.createQueryBuilder().delete().execute();
  await userRepo.createQueryBuilder().delete().execute();

  // Create users (IDs are auto-assigned — requester will be 1, validator 2 after reset)
  const requester = userRepo.create({
    name: "Alice Johnson",
    role: UserRole.REQUESTER,
  });
  const validator = userRepo.create({
    name: "Bob Smith",
    role: UserRole.VALIDATOR,
  });

  const [savedRequester] = await userRepo.save([requester, validator]);

  // Seed vacation requests for the requester
  const requests = [
    requestRepo.create({
      user_id: savedRequester.id,
      start_date: "2026-06-01",
      end_date: "2026-06-05",
      reason: "Summer vacation",
      status: RequestStatus.PENDING,
    }),
    requestRepo.create({
      user_id: savedRequester.id,
      start_date: "2026-07-10",
      end_date: "2026-07-15",
      reason: "Family trip",
      status: RequestStatus.APPROVED,
    }),
    requestRepo.create({
      user_id: savedRequester.id,
      start_date: "2026-08-20",
      end_date: "2026-08-22",
      reason: "Personal days",
      status: RequestStatus.REJECTED,
      comments: "Too many employees absent that week",
    }),
  ];

  await requestRepo.save(requests);

  console.log("Seed complete!");
  console.log(`  Requester: Alice Johnson (id=${savedRequester.id})`);
  console.log(`  Validator: Bob Smith`);
  console.log(`  ${requests.length} vacation requests created`);

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
