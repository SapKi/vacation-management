import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRole } from "../constants";

// Stub localStorage before module imports
const storage: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem:    (k: string) => storage[k] ?? null,
  setItem:    (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; },
  clear:      () => { Object.keys(storage).forEach(k => delete storage[k]); },
});

const requester = { id: 1, name: "Alice", role: UserRole.REQUESTER };
const validator = { id: 2, name: "Bob",   role: UserRole.VALIDATOR };

// Reset module state between tests so the module-level ref resets
beforeEach(() => {
  localStorage.clear();
  vi.resetModules();
});

async function getUseAuth() {
  const mod = await import("./useAuth");
  return mod.useAuth;
}

describe("useAuth — initial state", () => {
  it("isLoggedIn is false when localStorage is empty", async () => {
    const useAuth = await getUseAuth();
    const { isLoggedIn } = useAuth();
    expect(isLoggedIn.value).toBe(false);
  });

  it("isLoggedIn is true when user exists in localStorage", async () => {
    localStorage.setItem("vm_user", JSON.stringify(requester));
    const useAuth = await getUseAuth();
    const { isLoggedIn } = useAuth();
    expect(isLoggedIn.value).toBe(true);
  });
});

describe("useAuth — setUser", () => {
  it("sets currentUser and isLoggedIn after setUser", async () => {
    const useAuth = await getUseAuth();
    const { setUser, currentUser, isLoggedIn } = useAuth();
    setUser(requester);
    expect(currentUser.value).toEqual(requester);
    expect(isLoggedIn.value).toBe(true);
  });

  it("isRequester is true for Requester role", async () => {
    const useAuth = await getUseAuth();
    const { setUser, isRequester } = useAuth();
    setUser(requester);
    expect(isRequester.value).toBe(true);
  });

  it("isValidator is true for Validator role", async () => {
    const useAuth = await getUseAuth();
    const { setUser, isValidator } = useAuth();
    setUser(validator);
    expect(isValidator.value).toBe(true);
  });

  it("isRequester is false for Validator role", async () => {
    const useAuth = await getUseAuth();
    const { setUser, isRequester } = useAuth();
    setUser(validator);
    expect(isRequester.value).toBe(false);
  });
});

describe("useAuth — logout", () => {
  it("clears currentUser and isLoggedIn after logout", async () => {
    const useAuth = await getUseAuth();
    const { setUser, logout, currentUser, isLoggedIn } = useAuth();
    setUser(requester);
    logout();
    expect(currentUser.value).toBeNull();
    expect(isLoggedIn.value).toBe(false);
  });
});
