import "reflect-metadata";
import * as bcrypt from "bcryptjs";
import { AuthService } from "../services/auth.service";
import { IUserRepository } from "../repositories/IUserRepository";
import { UserRole } from "../entities/User";

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash:    jest.fn(),
}));

const mockUserRepo: jest.Mocked<IUserRepository> = {
  findByNameWithPassword: jest.fn(),
  findById:               jest.fn(),
  findAll:                jest.fn(),
  existsByName:           jest.fn(),
  create:                 jest.fn(),
  save:                   jest.fn(),
  remove:                 jest.fn(),
};

let service: AuthService;

beforeEach(() => {
  jest.clearAllMocks();
  service = new AuthService(mockUserRepo);
});

const fakeUser = { id: 1, name: "Alice", role: UserRole.REQUESTER, password_hash: "hashed" } as any;

// ── login ─────────────────────────────────────────────────────────
describe("AuthService.login", () => {
  it("returns user without password_hash on valid credentials", async () => {
    mockUserRepo.findByNameWithPassword.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const result = await service.login("Alice", "pass");
    expect(result).not.toHaveProperty("password_hash");
    expect(result.name).toBe("Alice");
  });

  it("throws 400 when name is empty", async () => {
    await expect(service.login("", "pass")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 400 when password is missing", async () => {
    await expect(service.login("Alice", "")).rejects.toMatchObject({ status: 400 });
  });

  it("throws 401 when user not found", async () => {
    mockUserRepo.findByNameWithPassword.mockResolvedValue(null);
    await expect(service.login("Ghost", "pass")).rejects.toMatchObject({ status: 401 });
  });

  it("throws 401 when password is wrong", async () => {
    mockUserRepo.findByNameWithPassword.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.login("Alice", "wrong")).rejects.toMatchObject({ status: 401 });
  });
});

// ── register ─────────────────────────────────────────────────────
describe("AuthService.register", () => {
  it("creates and returns user without password_hash", async () => {
    mockUserRepo.existsByName.mockResolvedValue(false);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_pw");
    mockUserRepo.create.mockReturnValue(fakeUser);
    mockUserRepo.save.mockResolvedValue(fakeUser);
    const result = await service.register("Alice", UserRole.REQUESTER, "pass1234");
    expect(result).not.toHaveProperty("password_hash");
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
    mockUserRepo.existsByName.mockResolvedValue(true);
    await expect(service.register("Alice", UserRole.REQUESTER, "pass123")).rejects.toMatchObject({ status: 409 });
  });
});
