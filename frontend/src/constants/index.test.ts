import { describe, it, expect } from "vitest";
import { UserRole, RequestStatus, ROUTES, roleToRoute, STATUS_FILTER_OPTIONS } from "./index";

describe("UserRole enum", () => {
  it("has Requester value", () => expect(UserRole.REQUESTER).toBe("Requester"));
  it("has Validator value",  () => expect(UserRole.VALIDATOR).toBe("Validator"));
});

describe("RequestStatus enum", () => {
  it("has Pending value",  () => expect(RequestStatus.PENDING).toBe("Pending"));
  it("has Approved value", () => expect(RequestStatus.APPROVED).toBe("Approved"));
  it("has Rejected value", () => expect(RequestStatus.REJECTED).toBe("Rejected"));
});

describe("ROUTES", () => {
  it("HOME is /",           () => expect(ROUTES.HOME).toBe("/"));
  it("LOGIN is /login",     () => expect(ROUTES.LOGIN).toBe("/login"));
  it("SIGNUP is /signup",   () => expect(ROUTES.SIGNUP).toBe("/signup"));
  it("REQUESTER is /requester", () => expect(ROUTES.REQUESTER).toBe("/requester"));
  it("VALIDATOR is /validator", () => expect(ROUTES.VALIDATOR).toBe("/validator"));
});

describe("roleToRoute", () => {
  it("maps Requester to /requester", () => {
    expect(roleToRoute(UserRole.REQUESTER)).toBe(ROUTES.REQUESTER);
  });

  it("maps Validator to /validator", () => {
    expect(roleToRoute(UserRole.VALIDATOR)).toBe(ROUTES.VALIDATOR);
  });

  it("maps unknown role to /validator (default)", () => {
    expect(roleToRoute("Other")).toBe(ROUTES.VALIDATOR);
  });
});

describe("STATUS_FILTER_OPTIONS", () => {
  it("includes All, Pending, Approved, Rejected", () => {
    expect(STATUS_FILTER_OPTIONS).toContain("All");
    expect(STATUS_FILTER_OPTIONS).toContain("Pending");
    expect(STATUS_FILTER_OPTIONS).toContain("Approved");
    expect(STATUS_FILTER_OPTIONS).toContain("Rejected");
  });

  it("has exactly 4 options", () => {
    expect(STATUS_FILTER_OPTIONS).toHaveLength(4);
  });
});
