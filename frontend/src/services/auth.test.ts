import { describe, it, expect, beforeEach, vi } from "vitest";

// Must stub localStorage before importing authService
const storage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem:    (k: string) => storage[k] ?? null,
  setItem:    (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; },
  clear:      () => { Object.keys(storage).forEach(k => delete storage[k]); },
});

import { authService } from "./auth";
import { UserRole } from "../constants";

const fakeUser = { id: 1, name: "Alice", role: UserRole.REQUESTER };

beforeEach(() => {
  localStorage.clear();
});

describe("authService.save / get / clear / isLoggedIn", () => {
  it("save persists user to localStorage", () => {
    authService.save(fakeUser);
    expect(localStorage.getItem("vm_user")).not.toBeNull();
  });

  it("get returns the saved user", () => {
    authService.save(fakeUser);
    const result = authService.get();
    expect(result).toEqual(fakeUser);
  });

  it("get returns null when nothing is stored", () => {
    expect(authService.get()).toBeNull();
  });

  it("clear removes the stored user", () => {
    authService.save(fakeUser);
    authService.clear();
    expect(authService.get()).toBeNull();
  });

  it("isLoggedIn returns true when user is stored", () => {
    authService.save(fakeUser);
    expect(authService.isLoggedIn()).toBe(true);
  });

  it("isLoggedIn returns false when nothing is stored", () => {
    expect(authService.isLoggedIn()).toBe(false);
  });

  it("isLoggedIn returns false after clear", () => {
    authService.save(fakeUser);
    authService.clear();
    expect(authService.isLoggedIn()).toBe(false);
  });
});
