import { describe, it, expect, beforeEach, vi } from "vitest";

const store: Record<string, string> = {};
vi.stubGlobal("localStorage", {
  getItem:    (k: string) => store[k] ?? null,
  setItem:    (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear:      () => { Object.keys(store).forEach(k => delete store[k]); },
});

import { LocalStorageAdapter } from "./LocalStorage";

const storage = new LocalStorageAdapter();

beforeEach(() => localStorage.clear());

describe("LocalStorageAdapter", () => {
  it("set stores a value as JSON and get retrieves it", () => {
    storage.set("key", { a: 1 });
    expect(storage.get("key")).toEqual({ a: 1 });
  });

  it("get returns null when key does not exist", () => {
    expect(storage.get("missing")).toBeNull();
  });

  it("set overwrites an existing value", () => {
    storage.set("key", "first");
    storage.set("key", "second");
    expect(storage.get("key")).toBe("second");
  });

  it("remove deletes the key", () => {
    storage.set("key", "value");
    storage.remove("key");
    expect(storage.get("key")).toBeNull();
  });

  it("has returns true when key exists", () => {
    storage.set("key", 42);
    expect(storage.has("key")).toBe(true);
  });

  it("has returns false when key does not exist", () => {
    expect(storage.has("nonexistent")).toBe(false);
  });

  it("has returns false after remove", () => {
    storage.set("key", true);
    storage.remove("key");
    expect(storage.has("key")).toBe(false);
  });

  it("stores and retrieves nested objects correctly", () => {
    const data = { id: 1, name: "Alice", role: "Requester" };
    storage.set("user", data);
    expect(storage.get("user")).toEqual(data);
  });
});
