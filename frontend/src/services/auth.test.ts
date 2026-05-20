import { describe, it, expect, beforeEach, vi } from "vitest";
import { IStorage } from "../storage/IStorage";
import { createAuthService } from "./auth";
import { UserRole } from "../constants";

vi.mock("./api", () => ({
  default: { post: vi.fn() },
}));

const fakeUser = { id: 1, name: "Alice", role: UserRole.REQUESTER };

function makeMockStorage(): IStorage & { store: Record<string, unknown> } {
  const store: Record<string, unknown> = {};
  return {
    store,
    get:    <T>(key: string) => (key in store ? (store[key] as T) : null),
    set:    <T>(key: string, value: T) => { store[key] = value; },
    remove: (key: string) => { delete store[key]; },
    has:    (key: string) => key in store,
  };
}

describe("authService (injected storage)", () => {
  let storage: ReturnType<typeof makeMockStorage>;
  let service: ReturnType<typeof createAuthService>;

  beforeEach(() => {
    storage = makeMockStorage();
    service = createAuthService(storage);
  });

  it("save persists user to storage", () => {
    service.save(fakeUser);
    expect(storage.has("vm_user")).toBe(true);
  });

  it("get returns the saved user", () => {
    service.save(fakeUser);
    expect(service.get()).toEqual(fakeUser);
  });

  it("get returns null when nothing is stored", () => {
    expect(service.get()).toBeNull();
  });

  it("clear removes the stored user", () => {
    service.save(fakeUser);
    service.clear();
    expect(service.get()).toBeNull();
  });

  it("isLoggedIn returns true when user is stored", () => {
    service.save(fakeUser);
    expect(service.isLoggedIn()).toBe(true);
  });

  it("isLoggedIn returns false when nothing is stored", () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it("isLoggedIn returns false after clear", () => {
    service.save(fakeUser);
    service.clear();
    expect(service.isLoggedIn()).toBe(false);
  });
});

describe("authService HTTP methods", () => {
  it("login calls POST /auth/login with name and password", async () => {
    const { default: api } = await import("./api");
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: fakeUser });
    const service = createAuthService();
    await service.login("Alice", "pass");
    expect(api.post).toHaveBeenCalledWith("/auth/login", { name: "Alice", password: "pass" });
  });

  it("register calls POST /auth/register with payload", async () => {
    const { default: api } = await import("./api");
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ data: fakeUser });
    const service = createAuthService();
    const payload = { name: "Alice", role: UserRole.REQUESTER, password: "pass1234" };
    await service.register(payload);
    expect(api.post).toHaveBeenCalledWith("/auth/register", payload);
  });
});
