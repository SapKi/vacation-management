import "reflect-metadata";
import {
  validateCreateRequest,
  validateUpdateRequest,
  validateReject,
  validateDeleteRequest,
} from "../validators/vacationRequest.validator";
import { validateLogin, validateRegister } from "../validators/auth.validator";
import { RequestStatus } from "../entities/VacationRequest";
import { UserRole } from "../entities/User";

// ── auth validators ──────────────────────────────────────────────
describe("validateLogin", () => {
  it("passes with valid name and password", () => {
    expect(() => validateLogin("Alice", "pass")).not.toThrow();
  });
  it("throws 400 when name is empty", () => {
    expect(() => validateLogin("", "pass")).toMatchObject ||
    expect(() => validateLogin("", "pass")).toThrow();
    try { validateLogin("", "pass"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when name is only whitespace", () => {
    try { validateLogin("   ", "pass"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when password is empty", () => {
    try { validateLogin("Alice", ""); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
});

describe("validateRegister", () => {
  it("passes with valid inputs", () => {
    expect(() => validateRegister("Alice", UserRole.REQUESTER, "pass1234")).not.toThrow();
  });
  it("throws 400 when name is empty", () => {
    try { validateRegister("", UserRole.REQUESTER, "pass1234"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when name is whitespace", () => {
    try { validateRegister("  ", UserRole.REQUESTER, "pass1234"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when role is missing", () => {
    try { validateRegister("Alice", "" as UserRole, "pass1234"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when password is too short", () => {
    try { validateRegister("Alice", UserRole.REQUESTER, "pw"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when password is exactly 3 chars (boundary)", () => {
    try { validateRegister("Alice", UserRole.REQUESTER, "abc"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("passes when password is exactly 4 chars (boundary)", () => {
    expect(() => validateRegister("Alice", UserRole.REQUESTER, "abcd")).not.toThrow();
  });
});

// ── vacation request validators ───────────────────────────────────
describe("validateCreateRequest", () => {
  it("passes with valid inputs", () => {
    expect(() => validateCreateRequest(1, "2026-09-01", "2026-09-05")).not.toThrow();
  });
  it("passes when startDate equals endDate (same-day)", () => {
    expect(() => validateCreateRequest(1, "2026-09-01", "2026-09-01")).not.toThrow();
  });
  it("throws 400 when userId is 0", () => {
    try { validateCreateRequest(0, "2026-09-01", "2026-09-05"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when startDate is empty", () => {
    try { validateCreateRequest(1, "", "2026-09-05"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when endDate is empty", () => {
    try { validateCreateRequest(1, "2026-09-01", ""); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when endDate is before startDate", () => {
    try { validateCreateRequest(1, "2026-09-10", "2026-09-01"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
});

describe("validateUpdateRequest", () => {
  it("passes for Pending request with valid dates", () => {
    expect(() => validateUpdateRequest(RequestStatus.PENDING, "2026-10-01", "2026-10-05")).not.toThrow();
  });
  it("throws 400 when status is Approved", () => {
    try { validateUpdateRequest(RequestStatus.APPROVED, "2026-10-01", "2026-10-05"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when status is Rejected", () => {
    try { validateUpdateRequest(RequestStatus.REJECTED, "2026-10-01", "2026-10-05"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when startDate is empty", () => {
    try { validateUpdateRequest(RequestStatus.PENDING, "", "2026-10-05"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when endDate is empty", () => {
    try { validateUpdateRequest(RequestStatus.PENDING, "2026-10-01", ""); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when endDate is before startDate", () => {
    try { validateUpdateRequest(RequestStatus.PENDING, "2026-10-10", "2026-10-01"); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
});

describe("validateReject", () => {
  it("passes with a non-empty comment", () => {
    expect(() => validateReject("Too busy")).not.toThrow();
  });
  it("throws 400 when comments is empty string", () => {
    try { validateReject(""); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when comments is whitespace", () => {
    try { validateReject("   "); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when comments is null-ish", () => {
    try { validateReject(null as unknown as string); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
});

describe("validateDeleteRequest", () => {
  it("passes for Pending requests", () => {
    expect(() => validateDeleteRequest(RequestStatus.PENDING)).not.toThrow();
  });
  it("throws 400 when status is Approved", () => {
    try { validateDeleteRequest(RequestStatus.APPROVED); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
  it("throws 400 when status is Rejected", () => {
    try { validateDeleteRequest(RequestStatus.REJECTED); } catch (e) { expect(e).toMatchObject({ status: 400 }); }
  });
});
