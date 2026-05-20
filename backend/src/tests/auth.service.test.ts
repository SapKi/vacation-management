import "reflect-metadata";

jest.mock("../data-source", () => ({
  AppDataSource: { getRepository: jest.fn() },
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash:    jest.fn(),
}));

import { AuthService } from "../services/auth.service";
import { AppDataSource } from "../data-source";
import * as bcrypt from "bcryptjs";
import { UserRole } from "../entities/User";

const mockQueryBuilder = {
  addSelect: jest.fn().mockReturnThis(),
  where:     jest.fn().mockReturnThis(),
  getOne:    jest.fn(),
};

const mockRepo = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  findOneBy: jest.fn(),
  create:    jest.fn(),
  save:      jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepo);
});

const service = new AuthService();

// ── login ────────────────────────────────────────────────────────
describe("AuthService.login", () => {
  const fakeUser = {
    id: 1, name: "Alice", role: UserRole.REQUESTER, password_hash: "hashed",
  };

  it("returns user without password_hash on valid credentials", async () => {
    mockQueryBuilder.getOne.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.login("Alice", "alice123");
    expect(result).not.toHaveProperty("password_hash");
    expect(result.name).toBe("Alice");
  });

  it("throws 400 when name is empty", async () => {
    await expect(service.login("", "pass")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when password is missing", async () => {
    await expect(service.login("Alice", "")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 401 when user is not found", async () => {
    mockQueryBuilder.getOne.mockResolvedValue(null);
    await expect(service.login("Nobody", "pass")).rejects.toMatchObject({ status: 401 });
  });

  it("throws 401 when password is wrong", async () => {
    mockQueryBuilder.getOne.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.login("Alice", "wrong")).rejects.toMatchObject({ status: 401 });
  });
});

// ── register ─────────────────────────────────────────────────────
describe("AuthService.register", () => {
  it("creates and returns user without password_hash", async () => {
    mockRepo.findOneBy.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_pw");
    const newUser = { id: 2, name: "Bob", role: UserRole.VALIDATOR, password_hash: "hashed_pw" };
    mockRepo.create.mockReturnValue(newUser);
    mockRepo.save.mockResolvedValue(newUser);

    const result = await service.register("Bob", UserRole.VALIDATOR, "pass1234");
    expect(result).not.toHaveProperty("password_hash");
    expect(result.name).toBe("Bob");
  });

  it("throws 400 when name is empty", async () => {
    await expect(service.register("", UserRole.REQUESTER, "pass123")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when role is missing", async () => {
    await expect(service.register("Bob", "" as UserRole, "pass123")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when password is too short", async () => {
    await expect(service.register("Bob", UserRole.REQUESTER, "pw")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 409 when name already exists", async () => {
    mockRepo.findOneBy.mockResolvedValue({ id: 1, name: "Bob" });
    await expect(service.register("Bob", UserRole.REQUESTER, "pass123")).rejects.toMatchObject({ status: 409 });
  });
});
